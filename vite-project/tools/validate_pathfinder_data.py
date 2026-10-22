#!/usr/bin/env python3
"""Validate the generated Pathfinder 1e frontend data files."""

import json
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "frontend" / "src" / "pathfinder" / "data"
ABILITY_KEYS = {"str", "dex", "con", "int", "wis", "cha"}
EXTRA_CLASS_IDS = {
    "adept",
    "antipaladin",
    "arcanist",
    "bloodrager",
    "hunter",
    "investigator",
    "medium",
    "mesmerist",
    "occultist",
    "psychic",
    "shaman",
    "skald",
    "spiritualist",
    "summonerUnchained",
    "warpriest",
}


def load(name):
    with open(DATA_DIR / name, encoding="utf-8") as handle:
        return json.load(handle)


def main():
    errors = []
    classes = load("classes.json")
    feats = load("feats.json")
    spells = load("spells.json")
    equipment = load("equipment.json")
    races = load("races.json")
    skills = load("skills.json")
    class_abilities = load("classAbilities.json")
    archetypes = load("archetypes.json")
    alternate_traits = load("alternateRacialTraits.json")
    traits = load("traits.json")

    class_ids = {entry["id"] for entry in classes}
    race_ids = {entry["id"] for entry in races}
    skill_ids = {entry["id"] for entry in skills}
    feat_ids = {entry["id"] for entry in feats}
    trait_ids = {entry["id"] for entry in traits}

    for label, entries in [
        ("class", classes),
        ("feat", feats),
        ("spell", spells),
        ("equipment", equipment),
        ("race", races),
        ("skill", skills),
        ("class ability", class_abilities),
        ("archetype", archetypes),
        ("trait", traits),
    ]:
        ids = [entry.get("id") for entry in entries]
        if len(ids) != len(set(ids)):
            errors.append(f"Duplicate {label} IDs detected.")
        if any(not entry.get("name") for entry in entries):
            errors.append(f"Missing {label} name detected.")
        if any(not entry.get("id") for entry in entries):
            errors.append(f"Missing {label} ID detected.")

    for spell in spells:
        for class_id, level in (spell.get("classLevels") or {}).items():
            if class_id not in class_ids and class_id not in EXTRA_CLASS_IDS:
                errors.append(f"Spell {spell['id']} references unknown class {class_id}.")
            if not isinstance(level, int) or not 0 <= level <= 9:
                errors.append(f"Spell {spell['id']} has invalid level for {class_id}.")

    for skill in skills:
        if skill.get("ability") not in ABILITY_KEYS:
            errors.append(f"Skill {skill['id']} has invalid ability {skill.get('ability')}.")

    for archetype in archetypes:
        if archetype.get("classId") not in class_ids:
            errors.append(
                f"Archetype {archetype['id']} references unknown class {archetype.get('classId')}."
            )
        for feature in archetype.get("features") or []:
            if not feature.get("name"):
                errors.append(f"Archetype {archetype['id']} has an unnamed feature.")

    for race_id in alternate_traits:
        if race_id not in race_ids:
            errors.append(f"Alternate traits reference unknown race {race_id}.")

    for trait in traits:
        if trait.get("type") not in {"trait", "drawback"}:
            errors.append(f"Trait {trait['id']} has invalid type {trait.get('type')}.")
        if not trait.get("benefit"):
            errors.append(f"Trait {trait['id']} is missing a benefit.")

    for feat in feats:
        prerequisites = feat.get("prerequisites") or {}
        for prereq in (prerequisites.get("feats") or []) + (
            prerequisites.get("anyFeats") or []
        ):
            if not any(
                prereq.lower().replace(",", "").replace("-", " ")
                == entry["name"].lower().replace(",", "").replace("-", " ")
                for entry in feats
            ):
                errors.append(f"Feat {feat['id']} references unknown prerequisite {prereq}.")

    summary = {
        "classes": len(classes),
        "feats": len(feats),
        "spells": len(spells),
        "equipment": len(equipment),
        "races": len(races),
        "skills": len(skills),
        "classAbilities": len(class_abilities),
        "archetypes": len(archetypes),
        "alternateRacialTraits": len(alternate_traits),
        "traits": len(traits),
        "errors": len(errors),
    }
    print(json.dumps(summary, indent=2))
    for error in errors:
        print(error, file=sys.stderr)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
