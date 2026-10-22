#!/usr/bin/env python3
"""Convert Pathfinder 1e data packs into frontend data modules.

This script is a development tool. It is not used by the frontend or backend at
runtime. Run it after cloning the source data repositories to regenerate the
JSON files in frontend/src/pathfinder/data/.

Usage:
    python tools/convert_pf1_data.py \
        --foundry-packs ../foundry-pf1/packs \
        --jasontank-json ../pathfinder-data-1-e/json \
        --out frontend/src/pathfinder/data
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

import yaml

ALLOWED_SOURCE_IDS = {
    "PZO1110",  # Core Rulebook
    "PZO1115",  # Advanced Player's Guide
    "PZO1117",  # Ultimate Magic
    "PZO1118",  # Ultimate Combat
    "PZO1123",  # Ultimate Equipment
    "PZO1125",  # Ultimate Campaign
    "PZO1134",  # Ultimate Intrigue
    "PZO1140",  # Ultimate Wilderness
}

ALLOWED_SOURCE_NAMES = [
    "core rulebook",
    "advanced player's guide",
    "ultimate magic",
    "ultimate combat",
    "ultimate equipment",
    "ultimate campaign",
    "ultimate intrigue",
    "ultimate wilderness",
]

SOURCE_NAMES = {
    "PZO1110": "Core Rulebook",
    "PZO1115": "Advanced Player's Guide",
    "PZO1117": "Ultimate Magic",
    "PZO1118": "Ultimate Combat",
    "PZO1123": "Ultimate Equipment",
    "PZO1125": "Ultimate Campaign",
    "PZO1134": "Ultimate Intrigue",
    "PZO1140": "Ultimate Wilderness",
}

MISSING_FEATS = [
    {
        "id": "point-blank-master",
        "name": "Point-Blank Master",
        "sourceBook": "PZO1115",
        "tags": ["Combat"],
        "description": (
            "You are adept at firing ranged weapons in close quarters. "
            "Prerequisites : Weapon Specialization with selected ranged weapon. "
            "Benefits : Choose one type of ranged weapon. You do not provoke attacks "
            "of opportunity when firing the selected weapon while threatened."
        ),
    },
]

CLASS_IDS = {
    "barbarian",
    "bard",
    "cleric",
    "druid",
    "fighter",
    "monk",
    "paladin",
    "ranger",
    "rogue",
    "sorcerer",
    "wizard",
    "alchemist",
    "cavalier",
    "inquisitor",
    "oracle",
    "summoner",
    "witch",
    "magus",
    "gunslinger",
    "ninja",
    "samurai",
    "vigilante",
    "shifter",
}

APG_RACE_IDS = {
    "aasimar",
    "tiefling",
    "ifrit",
    "fetchling",
    "kitsune",
    "nagaji",
    "orec",
    "strix",
    "suli",
    "sylph",
    "undine",
    "vanara",
    "vishkanya",
    "dhampir",
    "gathlain",
    "ghoran",
    "vine-leshy",
}

ABILITY_NAMES = {
    "str": "Strength",
    "dex": "Dexterity",
    "con": "Constitution",
    "int": "Intelligence",
    "wis": "Wisdom",
    "cha": "Charisma",
}


def load_yaml(path):
    with open(path, "r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def source_ids(item):
    system = item.get("system") or {}
    sources = system.get("sources")
    if not isinstance(sources, list):
        return []
    result = []
    for source in sources:
        if isinstance(source, dict) and source.get("id"):
            result.append(source["id"])
    return result


def has_allowed_source(item):
    return any(source in ALLOWED_SOURCE_IDS for source in source_ids(item))


def first_allowed_source(item):
    for source in source_ids(item):
        if source in ALLOWED_SOURCE_IDS:
            return source
    return None


def slugify(value):
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value or "").strip("-").lower()
    return value or "unknown"


def clean_html(value):
    if not value:
        return ""
    value = re.sub(r"<[^>]+>", " ", value)
    value = value.replace("&mdash;", "—").replace("&ndash;", "–")
    value = value.replace("&nbsp;", " ").replace("&times;", "×")
    value = value.replace("&minus;", "-").replace("&plus;", "+")
    value = value.replace("&amp;", "&").replace("&quot;", '"')
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def description_text(item):
    system = item.get("system") or {}
    description = system.get("description") or {}
    if isinstance(description, dict):
        value = description.get("value")
        if value:
            return clean_html(value)
        summary = description.get("summary")
        if summary:
            return clean_html(summary)
    if isinstance(description, str):
        return clean_html(description)
    return ""


def parse_ability_modifiers(text):
    modifiers = {}
    if not text:
        return modifiers
    patterns = [
        r"([+-]\d+)\s+(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)",
        r"(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s+([+-]\d+)",
    ]
    for pattern in patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            if match.group(1).lstrip("+-").isdigit():
                value = int(match.group(1))
                ability = match.group(2).lower()[:3]
            else:
                ability = match.group(1).lower()[:3]
                value = int(match.group(2))
            modifiers[ability] = value
    return modifiers


def parse_prerequisites(text, known_feats, feat_name_by_id=None, feat_aliases=None):
    feat_aliases = feat_aliases or {}
    known_feats = set(known_feats) | set(feat_aliases)
    result = {
        "abilities": {},
        "bab": None,
        "characterLevel": None,
        "casterLevel": None,
        "spellLevel": None,
        "spellType": None,
        "skills": {},
        "feats": [],
        "anyFeats": [],
        "races": [],
        "classFeatures": [],
        "classLevels": {},
        "proficiencies": [],
        "alignment": None,
        "unparsed": "",
    }
    if not text:
        return result

    match = re.search(
        r"Prerequisites?\s*:\s*(.*?)(?:Benefits?\s*:|$)",
        text,
        re.IGNORECASE | re.DOTALL,
    )
    if not match:
        return result
    block = match.group(1).strip()

    if feat_name_by_id:
        def replace_feat_uuid(uuid_match):
            uuid = uuid_match.group(1)
            item_id = uuid.split(".")[-1]
            return feat_name_by_id.get(item_id, uuid_match.group(2))

        block = re.sub(
            r"@UUID\[([^\]]+)\]\{([^}]*)\}", replace_feat_uuid, block
        )
    else:
        block = re.sub(r"@UUID\[[^\]]+\]\{([^}]*)\}", r"\1", block)

    parsed_parts = set()
    for ability_match in re.finditer(
        r"\b(Str|Dex|Con|Int|Wis|Cha)\s+(\d+)\b", block, re.IGNORECASE
    ):
        key = ability_match.group(1).lower()[:3]
        result["abilities"][key] = int(ability_match.group(2))
        parsed_parts.add(ability_match.group(0))

    bab_match = re.search(r"base attack bonus\s+\+?(\d+)", block, re.IGNORECASE)
    if bab_match:
        result["bab"] = int(bab_match.group(1))
        parsed_parts.add(bab_match.group(0))

    level_match = re.search(
        r"character level\s+(\d+)(?:st|nd|rd|th)?", block, re.IGNORECASE
    )
    if level_match:
        result["characterLevel"] = int(level_match.group(1))
        parsed_parts.add(level_match.group(0))

    caster_match = re.search(
        r"caster level\s+(\d+)(?:st|nd|rd|th)?", block, re.IGNORECASE
    )
    if caster_match:
        result["casterLevel"] = int(caster_match.group(1))
        parsed_parts.add(caster_match.group(0))

    spell_match = re.search(
        r"ability to cast\s+(\d+)(?:st|nd|rd|th)-level\s+(arcane|divine)\s+spells",
        block,
        re.IGNORECASE,
    )
    if spell_match:
        result["spellLevel"] = int(spell_match.group(1))
        result["spellType"] = spell_match.group(2).lower()
        parsed_parts.add(spell_match.group(0))
    else:
        spell_match = re.search(
            r"ability to cast\s+(arcane|divine)\s+spells", block, re.IGNORECASE
        )
        if spell_match:
            result["spellLevel"] = 0
            result["spellType"] = spell_match.group(1).lower()
            parsed_parts.add(spell_match.group(0))

    for skill_match in re.finditer(
        r"(\d+)\s+ranks?\s+in\s+([A-Za-z][A-Za-z ()]+)", block, re.IGNORECASE
    ):
        skill_name = re.sub(r"\s*\([^)]*\)", "", skill_match.group(2)).strip().lower()
        result["skills"][skill_name] = int(skill_match.group(1))
        parsed_parts.add(skill_match.group(0))

    for skill_match in re.finditer(
        r"([A-Za-z][A-Za-z ()]+?)\s+(\d+)\s+ranks?\b", block, re.IGNORECASE
    ):
        skill_name = re.sub(
            r"^(?:and|or|a|an|the|have|has|with|in|of|at least)\s+",
            "",
            skill_match.group(1).strip(),
            flags=re.IGNORECASE,
        )
        skill_name = re.sub(r"\s*\([^)]*\)", "", skill_name).strip().lower()
        if skill_name:
            result["skills"][skill_name] = int(skill_match.group(2))
            parsed_parts.add(skill_match.group(0))

    for skill_match in re.finditer(
        r"([A-Za-z][A-Za-z ()]+?)\s+(?:rank|ranks)\s+(\d+)\b", block, re.IGNORECASE
    ):
        skill_name = re.sub(
            r"^(?:and|or|a|an|the|have|has|with|in|of|at least)\s+",
            "",
            skill_match.group(1).strip(),
            flags=re.IGNORECASE,
        )
        skill_name = re.sub(r"\s*\([^)]*\)", "", skill_name).strip().lower()
        if skill_name:
            result["skills"][skill_name] = int(skill_match.group(2))
            parsed_parts.add(skill_match.group(0))

    for feat_name in known_feats:
        if re.search(r"\b" + re.escape(feat_name) + r"\b", block, re.IGNORECASE):
            canonical = feat_aliases.get(feat_name, feat_name)
            if canonical not in result["feats"]:
                result["feats"].append(canonical)
            parsed_parts.add(feat_name)

    race_list_match = re.match(
        r"\s*([A-Za-z ,/or]+?)\s*;", block, re.IGNORECASE
    )
    if race_list_match:
        for race in re.split(r",|\bor\b|/", race_list_match.group(1)):
            race = race.strip().lower()
            if race:
                result["races"].append(race)
        parsed_parts.add(race_list_match.group(0))

    race_match = re.search(r"\brace\s*:?\s*([A-Za-z][A-Za-z ]+)", block, re.IGNORECASE)
    if race_match:
        result["races"].append(race_match.group(1).strip().lower())
        parsed_parts.add(race_match.group(0))

    for class_match in re.finditer(
        r"([A-Z][A-Za-z' -]+?)\s+class feature", block
    ):
        feature = class_match.group(1).strip()
        result["classFeatures"].append(feature)
        parsed_parts.add(class_match.group(0))

    for feature_match in re.finditer(
        r"\b(channel energy|wild shape|mercy|grit|lay on hands|bardic performance|"
        r"sneak attack|rage|ki pool|judgment|smite evil|favored enemy|"
        r"animal companion|familiar|hex|arcane pool|deed|panache|inspiration|"
        r"studied target|slayer talent|bomb|mutagen|challenge|tactician)\b",
        block,
        re.IGNORECASE,
    ):
        feature = feature_match.group(1)
        if feature.lower() not in [item.lower() for item in result["classFeatures"]]:
            result["classFeatures"].append(feature)
        parsed_parts.add(feature_match.group(0))

    for class_match in re.finditer(
        r"(\d+)(?:st|nd|rd|th)[- ]level\s+([a-z]+)", block, re.IGNORECASE
    ):
        result["classLevels"][class_match.group(2).lower()] = int(class_match.group(1))
        parsed_parts.add(class_match.group(0))

    for class_match in re.finditer(
        r"\b([a-z]+)\s+level\s+(\d+)(?:st|nd|rd|th)?", block, re.IGNORECASE
    ):
        class_name = class_match.group(1).lower()
        if class_name in {"level", "character", "caster", "spell"}:
            continue
        result["classLevels"][class_name] = int(class_match.group(2))
        parsed_parts.add(class_match.group(0))

    for class_match in re.finditer(
        r"\b([a-z]+)\s+(\d+)(?:st|nd|rd|th)\b", block, re.IGNORECASE
    ):
        class_name = class_match.group(1).lower()
        if class_name in {"level", "character", "caster", "spell"}:
            continue
        result["classLevels"][class_name] = int(class_match.group(2))
        parsed_parts.add(class_match.group(0))

    prof_match = re.search(
        r"proficien(?:t|cy)\s+with\s+([A-Za-z][A-Za-z '-]+?)(?=[,.;]|$)",
        block,
        re.IGNORECASE,
    )
    if prof_match:
        proficiency = re.sub(r"^the\s+", "", prof_match.group(1).strip().lower())
        result["proficiencies"].append(proficiency)
        parsed_parts.add(prof_match.group(0))

    align_match = re.search(
        r"alignment\s+(?:must be\s+)?([A-Za-z ]+)", block, re.IGNORECASE
    )
    if align_match:
        result["alignment"] = align_match.group(1).strip()
        parsed_parts.add(align_match.group(0))

    remainder = block
    for part in sorted(parsed_parts, key=len, reverse=True):
        remainder = re.sub(re.escape(part), " ", remainder, flags=re.IGNORECASE)
    remainder = re.sub(r"[^A-Za-z0-9' -]+", " ", remainder)
    noise = {
        "a",
        "ability",
        "abjuration",
        "acquire",
        "alignment",
        "an",
        "and",
        "any",
        "are",
        "armor",
        "as",
        "at",
        "attacks",
        "base",
        "be",
        "below",
        "benefit",
        "benefits",
        "bonus",
        "by",
        "can",
        "cantrips",
        "cast",
        "character",
        "chosen",
        "class",
        "claw",
        "compatible",
        "conjuration",
        "critical",
        "crossbow",
        "divination",
        "enchantment",
        "energy",
        "evocation",
        "familiar",
        "feat",
        "feats",
        "feature",
        "for",
        "from",
        "has",
        "have",
        "high",
        "improved",
        "in",
        "is",
        "least",
        "level",
        "levels",
        "melee",
        "must",
        "natural",
        "necromancy",
        "new",
        "not",
        "of",
        "old",
        "one",
        "or",
        "orisons",
        "other",
        "piercing",
        "prerequisite",
        "prerequisites",
        "proficiency",
        "proficient",
        "ranged",
        "rank",
        "ranks",
        "requirement",
        "requirements",
        "score",
        "see",
        "selected",
        "size",
        "small",
        "smaller",
        "special",
        "spell",
        "spells",
        "sufficiently",
        "that",
        "the",
        "this",
        "thrown",
        "to",
        "transmutation",
        "two",
        "type",
        "use",
        "weapon",
        "weapons",
        "whip",
        "with",
        "years",
        "you",
    }
    remainder = " ".join(
        word
        for word in remainder.split()
        if word.lower() not in noise and not word.isdigit()
    )
    result["unparsed"] = remainder.strip(" ,;:-")
    return result


def extract_classes(packs_dir, class_ability_map):
    classes = []
    classes_dir = Path(packs_dir) / "classes"
    for path in sorted(classes_dir.glob("*.yaml")):
        if path.name.startswith("_"):
            continue
        item = load_yaml(path)
        if not isinstance(item, dict):
            continue
        system = item.get("system") or {}
        tag = system.get("tag") or slugify(item.get("name"))
        if tag not in CLASS_IDS:
            continue
        if source_ids(item) and not has_allowed_source(item):
            continue
        source = first_allowed_source(item)
        casting = system.get("casting") or {}
        features = []
        links = system.get("links") or {}
        supplements = links.get("supplements") or []
        for link in supplements:
            uuid = link.get("uuid") or ""
            ability_id = uuid.split(".")[-1]
            feature_name = class_ability_map.get(ability_id)
            if feature_name:
                features.append(
                    {
                        "level": link.get("level"),
                        "name": feature_name,
                        "id": ability_id,
                    }
                )
        classes.append(
            {
                "id": tag,
                "name": item.get("name") or tag,
                "sourceBook": source,
                "bab": system.get("bab"),
                "hitDie": system.get("hd"),
                "skillsPerLevel": system.get("skillsPerLevel"),
                "classSkills": system.get("classSkills") or [],
                "savingThrows": system.get("savingThrows") or {},
                "weaponProf": system.get("weaponProf") or [],
                "armorProf": system.get("armorProf") or [],
                "wealth": system.get("wealth"),
                "casting": {
                    "ability": casting.get("ability"),
                    "cantrips": casting.get("cantrips", False),
                    "domain": casting.get("domain", 0),
                    "progression": casting.get("progression"),
                    "spells": casting.get("spells"),
                    "type": casting.get("type"),
                }
                if casting
                else None,
                "features": features,
                "description": description_text(item),
            }
        )
    return classes


def extract_class_abilities(packs_dir):
    abilities = []
    ability_map = {}
    abilities_dir = Path(packs_dir) / "class-abilities"
    for path in sorted(abilities_dir.rglob("*.yaml")):
        if path.name.startswith("_"):
            continue
        item = load_yaml(path)
        if not isinstance(item, dict):
            continue
        if not has_allowed_source(item):
            continue
        system = item.get("system") or {}
        name = item.get("name") or slugify(path.stem)
        ability_id = item.get("_id") or slugify(path.stem)
        ability_map[ability_id] = name
        associations = system.get("associations") or {}
        abilities.append(
            {
                "id": ability_id,
                "name": name,
                "sourceBook": first_allowed_source(item),
                "subType": system.get("subType"),
                "abilityType": system.get("abilityType"),
                "classes": associations.get("classes") or [],
                "description": description_text(item),
            }
        )
    return abilities, ability_map


def extract_feats(packs_dir):
    feats = []
    feats_dir = Path(packs_dir) / "feats"
    for path in sorted(feats_dir.glob("*.yaml")):
        if path.name.startswith("_"):
            continue
        item = load_yaml(path)
        if not isinstance(item, dict):
            continue
        if not has_allowed_source(item):
            continue
        system = item.get("system") or {}
        feats.append(
            {
                "id": item.get("_id") or slugify(item.get("name")),
                "name": item.get("name") or "Unknown",
                "sourceBook": first_allowed_source(item),
                "tags": system.get("tags") or [],
                "description": description_text(item),
            }
        )
    known_names = {feat["name"] for feat in feats}
    for missing in MISSING_FEATS:
        if missing["name"] not in known_names:
            feats.append(dict(missing))
    return feats


def parse_feat_prerequisites(feats):
    known_feats = {feat["name"] for feat in feats}
    feat_name_by_id = {feat["id"]: feat["name"] for feat in feats}
    feat_aliases = {}
    for feat in feats:
        name = feat["name"]
        if ", " in name:
            base, qualifier = name.split(", ", 1)
            feat_aliases[f"{qualifier} {base}"] = name
        if "-" in name:
            feat_aliases[name.replace("-", " ")] = name
            feat_aliases[name.replace("-", "")] = name
    for feat in feats:
        feat["prerequisites"] = parse_prerequisites(
            feat.get("description", ""),
            known_feats,
            feat_name_by_id,
            feat_aliases,
        )
        if feat["name"] == "False Opening":
            prerequisites = feat["prerequisites"]
            alternatives = [
                name
                for name in ("Close-Quarters Thrower", "Point-Blank Master")
                if name in prerequisites["feats"]
            ]
            if len(alternatives) == 2:
                prerequisites["feats"] = [
                    name
                    for name in prerequisites["feats"]
                    if name not in alternatives
                ]
                prerequisites["anyFeats"] = alternatives
            prerequisites["unparsed"] = ""
    return feats


def extract_spells(packs_dir):
    spells = []
    spells_dir = Path(packs_dir) / "spells"
    for path in sorted(spells_dir.rglob("*.yaml")):
        if path.name.startswith("_"):
            continue
        item = load_yaml(path)
        if not isinstance(item, dict):
            continue
        if not has_allowed_source(item):
            continue
        system = item.get("system") or {}
        learned_at = system.get("learnedAt") or {}
        class_levels = learned_at.get("class") or {}
        spells.append(
            {
                "id": item.get("_id") or slugify(item.get("name")),
                "name": item.get("name") or "Unknown",
                "sourceBook": first_allowed_source(item),
                "level": system.get("level"),
                "school": system.get("school"),
                "castingTime": system.get("castingTime"),
                "components": system.get("components") or {},
                "range": system.get("range"),
                "duration": system.get("duration"),
                "savingThrow": system.get("savingThrow"),
                "spellResistance": system.get("spellResistance"),
                "materials": system.get("materials"),
                "classLevels": class_levels,
                "description": description_text(item),
            }
        )
    return spells


def extract_equipment(packs_dir):
    equipment = []
    armor_dir = Path(packs_dir) / "armors-and-shields"
    for path in sorted(armor_dir.rglob("*.yaml")):
        if path.name.startswith("_"):
            continue
        item = load_yaml(path)
        if not isinstance(item, dict):
            continue
        if not has_allowed_source(item):
            continue
        system = item.get("system") or {}
        armor = system.get("armor") or {}
        equipment.append(
            {
                "id": item.get("_id") or slugify(item.get("name")),
                "name": item.get("name") or "Unknown",
                "sourceBook": first_allowed_source(item),
                "type": "armor" if system.get("subType") == "armor" else "shield",
                "slot": system.get("slot"),
                "baseTypes": system.get("baseTypes") or [],
                "armor": {
                    "value": armor.get("value"),
                    "dex": armor.get("dex"),
                    "acp": armor.get("acp"),
                    "spellFailure": system.get("spellFailure"),
                    "price": (system.get("price") or {}).get("base"),
                    "weight": (system.get("weight") or {}).get("value"),
                },
                "description": description_text(item),
            }
        )
    weapons_dir = Path(packs_dir) / "weapons-and-ammo"
    for path in sorted(weapons_dir.rglob("*.yaml")):
        if path.name.startswith("_"):
            continue
        item = load_yaml(path)
        if not isinstance(item, dict):
            continue
        if not has_allowed_source(item):
            continue
        system = item.get("system") or {}
        weapon = system.get("weapon") or {}
        equipment.append(
            {
                "id": item.get("_id") or slugify(item.get("name")),
                "name": item.get("name") or "Unknown",
                "sourceBook": first_allowed_source(item),
                "type": "weapon",
                "weapon": {
                    "damage": weapon.get("damage"),
                    "critical": weapon.get("critical"),
                    "range": weapon.get("range"),
                    "type": weapon.get("type"),
                    "proficiency": weapon.get("proficiency"),
                    "price": (system.get("price") or {}).get("base"),
                    "weight": (system.get("weight") or {}).get("value"),
                },
                "description": description_text(item),
            }
        )
    return equipment


def extract_races(packs_dir):
    races = []
    races_dir = Path(packs_dir) / "races"
    for path in sorted(races_dir.rglob("*.yaml")):
        if path.name.startswith("_"):
            continue
        item = load_yaml(path)
        if not isinstance(item, dict):
            continue
        race_id = slugify(item.get("name")) or slugify(path.stem)
        if race_id not in APG_RACE_IDS and source_ids(item) and not has_allowed_source(item):
            continue
        system = item.get("system") or {}
        description = description_text(item)
        races.append(
            {
                "id": race_id,
                "name": item.get("name") or "Unknown",
                "sourceBook": first_allowed_source(item),
                "size": system.get("size"),
                "speed": system.get("speeds") or {},
                "languages": system.get("languages") or [],
                "abilityModifiers": parse_ability_modifiers(description),
                "description": description,
            }
        )
    return races


def extract_skills(packs_dir):
    skills = []
    skills_dir = Path(packs_dir) / "skills-core"
    for path in sorted(skills_dir.glob("*.yaml")):
        item = load_yaml(path)
        if not isinstance(item, dict):
            continue
        system = item.get("system") or {}
        skills.append(
            {
                "id": system.get("identifier") or slugify(item.get("name")),
                "name": item.get("name") or "Unknown",
                "ability": system.get("ability"),
                "acp": system.get("acp", False),
                "sets": system.get("sets") or [],
            }
        )
    return skills


def normalize_source_name(name):
    name = (name or "").lower()
    name = name.replace("prpg", "").replace("pathfinder roleplaying game", "")
    name = re.sub(r"\s+", " ", name).strip()
    return name


def jasontank_allowed(item):
    sources = item.get("sources")
    if not isinstance(sources, list):
        return True
    for source in sources:
        normalized = normalize_source_name(str(source))
        if any(allowed in normalized for allowed in ALLOWED_SOURCE_NAMES):
            return True
    return False


def parse_jasontank_archetypes(json_dir):
    archetypes = []
    json_dir = Path(json_dir)
    files = sorted(json_dir.glob("archetypes_*.json"))
    for path in files:
        stem = path.stem.replace("archetypes_", "")
        if stem.endswith("_UC"):
            class_id = f"{stem[:-3]}Unchained"
        else:
            class_id = stem.split("_")[0].rstrip("2")
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        if not isinstance(data, dict):
            continue
        for key, entry in data.items():
            if not isinstance(entry, dict):
                continue
            if not jasontank_allowed(entry):
                continue
            description = entry.get("description") or []
            joined = "\n".join(description)
            prerequisites = ""
            prereq_match = re.search(r"::prereq\{([^}]*)\}", joined)
            if prereq_match:
                prerequisites = prereq_match.group(1)
            skill_changes = re.search(r"::cskill\{([^}]*)\}", joined)
            gain_skills = []
            lose_skills = []
            if skill_changes:
                attrs = skill_changes.group(1)
                gain_match = re.search(r"gain=([^ }]+)", attrs)
                lose_match = re.search(r"lose=([^ }]+)", attrs)
                if gain_match:
                    gain_skills = gain_match.group(1).split("~")
                if lose_match:
                    lose_skills = lose_match.group(1).split("~")
            features = []
            for feature_match in re.finditer(
                r"::ab\[([^\]]+)\]\{([^}]*)\}", joined
            ):
                name = feature_match.group(1).strip()
                attrs = feature_match.group(2)
                level_match = re.search(r"\bl=(\d+)", attrs)
                replace_match = re.search(r"replace=\"?([^\"}]+)\"?", attrs)
                features.append(
                    {
                        "name": name,
                        "level": int(level_match.group(1)) if level_match else None,
                        "replaces": replace_match.group(1).strip() if replace_match else None,
                    }
                )
            if class_id not in CLASS_IDS:
                continue
            archetypes.append(
                {
                    "id": f"{key}_{class_id}",
                    "name": entry.get("name") or key,
                    "classId": class_id,
                    "sourceBook": ", ".join(entry.get("sources") or []),
                    "prerequisites": prerequisites,
                    "classSkills": {"gain": gain_skills, "lose": lose_skills},
                    "features": features,
                    "description": clean_html(joined),
                }
            )
    return archetypes


def clean_trait_text(value):
    value = clean_html(value)
    value = re.sub(
        "[‹«]([^›»]+)[›»]",
        lambda match: match.group(1).split("/")[-1].split("<")[0].replace("_", " "),
        value,
    )
    value = re.sub(
        "\ufffd([^\ufffd]+)\ufffd",
        lambda match: match.group(1).split("/")[-1].split("<")[0].replace("_", " "),
        value,
    )
    return value.replace("\ufffd", " ").strip()


def parse_jasontank_alternates(json_dir):
    alternates = {}
    json_dir = Path(json_dir)
    files = sorted(json_dir.glob("races*.json"))
    for path in files:
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        if not isinstance(data, dict):
            continue
        for key, entry in data.items():
            if not isinstance(entry, dict):
                continue
            alt = entry.get("alternates")
            if isinstance(alt, list) and alt:
                items = []
                for item in alt:
                    if isinstance(item, list) and item:
                        name = str(item[0])
                        pages = [str(page) for page in item[1:] if page]
                        items.append({"name": name, "pages": pages})
                alternates[key] = items
    return alternates


def parse_jasontank_traits(json_dir):
    traits = []
    seen = set()
    json_dir = Path(json_dir)
    for path in sorted(json_dir.glob("traits*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue
        if not isinstance(data, dict):
            continue
        for key, entry in data.items():
            if key == "not_found" or not isinstance(entry, dict):
                continue
            sources = []
            for group in entry.get("compilationSources") or []:
                if isinstance(group, list):
                    sources.extend(str(source) for source in group)
                else:
                    sources.append(str(group))
            allowed_sources = sorted(
                {
                    source
                    for source in sources
                    if any(
                        name in source.lower()
                        for name in ALLOWED_SOURCE_NAMES
                    )
                }
            )
            if not allowed_sources:
                continue

            name = str(entry.get("name") or key)
            trait_id = slugify(name)
            if trait_id in seen:
                trait_id = slugify(f"{name}-{key}")
            if trait_id in seen:
                continue
            seen.add(trait_id)

            description = " ".join(
                str(part) for part in entry.get("description") or []
            )
            attributes = {}
            match = re.search(r"::trait\{(.*)\}", description, re.DOTALL)
            if match:
                for attribute, value in re.findall(
                    r'(\w+)\s*=\s*"((?:\\.|[^"\\])*)"', match.group(1)
                ):
                    attributes[attribute.lower()] = value.replace('\\"', '"')

            category = str(entry.get("category") or "")
            top_link = entry.get("topLink") or []
            category_group = (
                str(top_link[0])
                if isinstance(top_link, list) and top_link
                else category.split("-")[0]
            )
            if category_group.endswith(" Traits"):
                category_group = category_group[: -len(" Traits")]
            trait_type = (
                "drawback"
                if "drawback" in category.lower()
                or "drawback" in attributes.get("type", "").lower()
                else "trait"
            )
            flavor = clean_trait_text(attributes.get("flavor", ""))
            benefit = clean_trait_text(attributes.get("benefit", ""))
            if not benefit and not flavor:
                benefit = clean_trait_text(description)

            traits.append(
                {
                    "id": trait_id,
                    "name": name,
                    "type": trait_type,
                    "category": category,
                    "categoryGroup": category_group or trait_type.title(),
                    "sourceBook": ", ".join(allowed_sources),
                    "flavor": flavor,
                    "benefit": benefit,
                }
            )
    return traits


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, indent=2, ensure_ascii=False)
        handle.write("\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--foundry-packs", required=True)
    parser.add_argument("--jasontank-json", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    packs_dir = Path(args.foundry_packs).resolve()
    json_dir = Path(args.jasontank_json).resolve()
    out_dir = Path(args.out).resolve()

    class_abilities, class_ability_map = extract_class_abilities(packs_dir)
    classes = extract_classes(packs_dir, class_ability_map)
    feats = parse_feat_prerequisites(extract_feats(packs_dir))
    spells = extract_spells(packs_dir)
    equipment = extract_equipment(packs_dir)
    races = extract_races(packs_dir)
    skills = extract_skills(packs_dir)
    archetypes = parse_jasontank_archetypes(json_dir)
    alternate_racial_traits = parse_jasontank_alternates(json_dir)
    traits = parse_jasontank_traits(json_dir)
    race_ids = {race["id"] for race in races}
    alternate_racial_traits = {
        key: value
        for key, value in alternate_racial_traits.items()
        if key in race_ids
    }

    write_json(out_dir / "classes.json", classes)
    write_json(out_dir / "feats.json", feats)
    write_json(out_dir / "spells.json", spells)
    write_json(out_dir / "equipment.json", equipment)
    write_json(out_dir / "races.json", races)
    write_json(out_dir / "skills.json", skills)
    write_json(out_dir / "classAbilities.json", class_abilities)
    write_json(out_dir / "archetypes.json", archetypes)
    write_json(out_dir / "alternateRacialTraits.json", alternate_racial_traits)
    write_json(out_dir / "traits.json", traits)
    write_json(out_dir / "sources.json", SOURCE_NAMES)

    print(
        json.dumps(
            {
                "classes": len(classes),
                "feats": len(feats),
                "spells": len(spells),
                "equipment": len(equipment),
                "races": len(races),
                "skills": len(skills),
                "classAbilities": len(class_abilities),
                "archetypes": len(archetypes),
                "alternateRacialTraits": len(alternate_racial_traits),
                "traits": len(traits),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
