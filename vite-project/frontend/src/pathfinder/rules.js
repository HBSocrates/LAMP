import classes from "./data/classes.json";
import races from "./data/races.json";
import skills from "./data/skills.json";
import feats from "./data/feats.json";
import equipment from "./data/equipment.json";
import sources from "./data/sources.json";
import alternateRacialTraits from "./data/alternateRacialTraits.json";
import traits from "./data/traits.json";

export const DATA = {
  classes,
  races,
  skills,
  feats,
  equipment,
  sources,
  alternateRacialTraits,
  traits,
};

export const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"];

export const ABILITY_NAMES = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

export const POINT_BUY_COST = {
  7: -4,
  8: -2,
  9: -1,
  10: 0,
  11: 1,
  12: 2,
  13: 3,
  14: 5,
  15: 7,
  16: 10,
  17: 13,
  18: 17,
};

export const FULL_CASTER_SLOTS = [
  [3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 1, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 4, 3, 2, 1, 0, 0, 0, 0, 0],
  [4, 4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 4, 4, 3, 2, 1, 0, 0, 0, 0],
  [4, 4, 4, 3, 3, 2, 0, 0, 0, 0],
  [4, 4, 4, 4, 3, 2, 1, 0, 0, 0],
  [4, 4, 4, 4, 3, 3, 2, 0, 0, 0],
  [4, 4, 4, 4, 4, 3, 2, 1, 0, 0],
  [4, 4, 4, 4, 4, 3, 3, 2, 0, 0],
  [4, 4, 4, 4, 4, 4, 3, 2, 1, 0],
  [4, 4, 4, 4, 4, 4, 3, 3, 2, 0],
  [4, 4, 4, 4, 4, 4, 4, 3, 2, 1],
  [4, 4, 4, 4, 4, 4, 4, 3, 3, 2],
  [4, 4, 4, 4, 4, 4, 4, 4, 3, 3],
  [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
];

export const MEDIUM_CASTER_SLOTS = [
  [3, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 1, 0, 0, 0, 0, 0, 0, 0],
  [4, 4, 2, 0, 0, 0, 0, 0, 0, 0],
  [5, 4, 3, 0, 0, 0, 0, 0, 0, 0],
  [5, 5, 3, 1, 0, 0, 0, 0, 0, 0],
  [5, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  [5, 5, 4, 3, 0, 0, 0, 0, 0, 0],
  [5, 5, 5, 3, 1, 0, 0, 0, 0, 0],
  [5, 5, 5, 4, 2, 0, 0, 0, 0, 0],
  [5, 5, 5, 4, 3, 0, 0, 0, 0, 0],
  [5, 5, 5, 5, 3, 1, 0, 0, 0, 0],
  [5, 5, 5, 5, 4, 2, 0, 0, 0, 0],
  [5, 5, 5, 5, 4, 3, 0, 0, 0, 0],
  [5, 5, 5, 5, 5, 3, 1, 0, 0, 0],
  [5, 5, 5, 5, 5, 4, 2, 0, 0, 0],
  [5, 5, 5, 5, 5, 4, 3, 0, 0, 0],
  [5, 5, 5, 5, 5, 5, 3, 1, 0, 0],
  [5, 5, 5, 5, 5, 5, 4, 2, 0, 0],
];

export const HALF_CASTER_SLOTS = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 2, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 2, 0, 0, 0, 0, 0, 0, 0],
  [0, 3, 3, 1, 0, 0, 0, 0, 0, 0],
  [0, 3, 3, 1, 0, 0, 0, 0, 0, 0],
  [0, 3, 4, 2, 0, 0, 0, 0, 0, 0],
  [0, 3, 4, 2, 0, 0, 0, 0, 0, 0],
  [0, 4, 4, 3, 1, 0, 0, 0, 0, 0],
  [0, 4, 4, 3, 1, 0, 0, 0, 0, 0],
  [0, 4, 5, 3, 2, 0, 0, 0, 0, 0],
  [0, 4, 5, 3, 2, 0, 0, 0, 0, 0],
];

export const SPONTANEOUS_FULL_SLOTS = [
  [0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 4, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 6, 3, 0, 0, 0, 0, 0, 0, 0],
  [0, 6, 4, 0, 0, 0, 0, 0, 0, 0],
  [0, 6, 5, 3, 0, 0, 0, 0, 0, 0],
  [0, 6, 6, 4, 0, 0, 0, 0, 0, 0],
  [0, 6, 6, 5, 3, 0, 0, 0, 0, 0],
  [0, 6, 6, 6, 4, 0, 0, 0, 0, 0],
  [0, 6, 6, 6, 5, 3, 0, 0, 0, 0],
  [0, 6, 6, 6, 6, 4, 0, 0, 0, 0],
  [0, 6, 6, 6, 6, 5, 3, 0, 0, 0],
  [0, 6, 6, 6, 6, 6, 4, 0, 0, 0],
  [0, 6, 6, 6, 6, 6, 5, 3, 0, 0],
  [0, 6, 6, 6, 6, 6, 6, 4, 0, 0],
  [0, 6, 6, 6, 6, 6, 6, 5, 3, 0],
  [0, 6, 6, 6, 6, 6, 6, 6, 4, 0],
  [0, 6, 6, 6, 6, 6, 6, 6, 5, 3],
  [0, 6, 6, 6, 6, 6, 6, 6, 6, 4],
  [0, 6, 6, 6, 6, 6, 6, 6, 6, 6],
];

export const SORCERER_KNOWN = [  [4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  [5, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  [5, 4, 0, 0, 0, 0, 0, 0, 0, 0],
  [6, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  [6, 6, 0, 0, 0, 0, 0, 0, 0, 0],
  [7, 7, 0, 0, 0, 0, 0, 0, 0, 0],
  [7, 8, 0, 0, 0, 0, 0, 0, 0, 0],
  [8, 9, 0, 0, 0, 0, 0, 0, 0, 0],
  [8, 10, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 11, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 12, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 13, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 14, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 15, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 16, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 17, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 18, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 19, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 20, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 20, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const SUMMONER_KNOWN = [
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 3, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 4, 2, 0, 0, 0, 0, 0, 0, 0],
  [0, 4, 3, 0, 0, 0, 0, 0, 0, 0],
  [0, 5, 3, 1, 0, 0, 0, 0, 0, 0],
  [0, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  [0, 5, 4, 3, 0, 0, 0, 0, 0, 0],
  [0, 5, 5, 3, 1, 0, 0, 0, 0, 0],
  [0, 5, 5, 4, 2, 0, 0, 0, 0, 0],
  [0, 5, 5, 4, 3, 0, 0, 0, 0, 0],
  [0, 5, 5, 5, 3, 1, 0, 0, 0, 0],
  [0, 5, 5, 5, 4, 2, 0, 0, 0, 0],
  [0, 5, 5, 5, 4, 3, 0, 0, 0, 0],
  [0, 5, 5, 5, 5, 3, 1, 0, 0, 0],
  [0, 5, 5, 5, 5, 4, 2, 0, 0, 0],
  [0, 5, 5, 5, 5, 4, 3, 0, 0, 0],
  [0, 5, 5, 5, 5, 5, 3, 1, 0, 0],
  [0, 5, 5, 5, 5, 5, 4, 2, 0, 0],
];

export function abilityModifier(score) {
  if (score === undefined || score === null || Number.isNaN(Number(score))) {
    return 0;
  }
  return Math.floor((Number(score) - 10) / 2);
}

export function pointBuyCost(score) {
  return POINT_BUY_COST[Number(score)] ?? null;
}

export function validatePointBuy(scores, total) {
  const errors = [];
  let spent = 0;
  for (const key of ABILITY_KEYS) {
    const score = Number(scores[key]);
    if (!Number.isInteger(score) || score < 7 || score > 18) {
      errors.push(`${ABILITY_NAMES[key]} must be between 7 and 18 for point buy.`);
      continue;
    }
    spent += pointBuyCost(score);
  }
  if (spent > Number(total)) {
    errors.push(`Point buy total is ${spent}; budget is ${total}.`);
  }
  return { valid: errors.length === 0, spent, errors };
}

export function getClass(classId) {
  return classes.find((entry) => entry.id === classId) || null;
}

export function getRace(raceId) {
  return races.find((entry) => entry.id === raceId) || null;
}

export function getFeat(featId) {
  return feats.find((entry) => entry.id === featId) || null;
}

export function getSkill(skillId) {
  return skills.find((entry) => entry.id === skillId) || null;
}

export function getEquipment(itemId) {
  return equipment.find((entry) => entry.id === itemId) || null;
}

export function getClassList() {
  return classes;
}

export function getRaceList() {
  return races;
}

export function getFeatList() {
  return feats;
}

export function getSkillList() {
  return skills;
}

export function getEquipmentList() {
  return equipment;
}

export function getAlternateRacialTraits(raceId) {
  return alternateRacialTraits[raceId] || [];
}

export function getTrait(traitId) {
  return traits.find((entry) => entry.id === traitId) || null;
}

export function getTraitList() {
  return traits;
}

export function getTraitByName(name) {
  const normalized = normalizeName(name);
  if (!normalized) return null;
  return traits.find((entry) => normalizeName(entry.name) === normalized) || null;
}

function normalizeFeatureName(value) {
  return normalizeName(value)
    .replace(/\b(\d+)(?:st|nd|rd|th)\b/g, "$1")
    .replace(/\b(?:ex|su|sp)\b/g, " ")
    .replace(/\bthe\b/g, " ")
    .replace(/\b(?:and|or|with)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function featureWords(value) {
  return value
    .replace(/\b\d+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function featureNumbers(value) {
  return (value.match(/\b\d+\b/g) || []).map((entry) => Number(entry));
}

function splitReplacementNames(value) {
  const variants = [];
  for (const segment of String(value || "").split(/[~;]/)) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    variants.push(trimmed);
    if (/[,/]|\band\b|\bor\b/i.test(trimmed)) {
      for (const part of trimmed.split(/[,/]|\band\b|\bor\b/i)) {
        const piece = part.trim();
        if (piece) variants.push(piece);
      }
    }
  }
  return [...new Set(variants)];
}

function featureMatches(left, right) {
  const a = normalizeFeatureName(String(left || "").replace(/\([^)]*\)/g, " "));
  const b = normalizeFeatureName(String(right || "").replace(/\([^)]*\)/g, " "));
  if (!a || !b) return false;
  if (a === b) return true;
  const aWords = featureWords(a);
  const bWords = featureWords(b);
  if (!aWords || !bWords) return false;
  const related = aWords === bWords || aWords.includes(bWords) || bWords.includes(aWords);
  if (!related) return false;
  const aNumbers = featureNumbers(a);
  const bNumbers = featureNumbers(b);
  if (!aNumbers.length || !bNumbers.length) return true;
  return aNumbers.some((number) => bNumbers.includes(number));
}

export function resolveArchetypes(character, archetypeList = []) {
  const active = [];
  const errors = [];
  const conflicts = [];
  if (!archetypeList.length) return { active, errors, conflicts };
  for (const classEntry of character.classes || []) {
    const selected = classEntry.archetypeIds || [];
    const selectedForClass = [];
    for (const archetypeId of selected) {
      const archetype = archetypeList.find((entry) => entry.id === archetypeId);
      if (!archetype) {
        errors.push(`Unknown archetype: ${archetypeId}.`);
        continue;
      }
      if (archetype.classId !== classEntry.classId) {
        errors.push(`${archetype.name} is not a ${classEntry.classId} archetype.`);
        continue;
      }
      active.push(archetype);
      selectedForClass.push(archetype);
    }
    for (let left = 0; left < selectedForClass.length; left++) {
      for (let right = left + 1; right < selectedForClass.length; right++) {
        const first = selectedForClass[left];
        const second = selectedForClass[right];
        for (const firstFeature of first.features || []) {
          for (const replacement of splitReplacementNames(
            firstFeature.replaces
          )) {
            for (const secondFeature of second.features || []) {
              for (const otherReplacement of splitReplacementNames(
                secondFeature.replaces
              )) {
                if (featureMatches(replacement, otherReplacement)) {
                  conflicts.push(
                    `${first.name} and ${second.name} both replace ${firstFeature.replaces}.`
                  );
                }
              }
            }
          }
        }
      }
    }
  }
  return { active, errors, conflicts: [...new Set(conflicts)] };
}

export function getEffectiveClassFeatures(character, archetypeList = []) {
  const resolved = resolveArchetypes(character, archetypeList);
  const all = [];
  for (const classEntry of character.classes || []) {
    const classData = getClass(classEntry.classId);
    if (!classData) continue;
    const level = Number(classEntry.level) || 0;
    const classArchetypes = resolved.active.filter(
      (archetype) => archetype.classId === classEntry.classId
    );
    const replacements = classArchetypes.flatMap((archetype) =>
      (archetype.features || []).flatMap((feature) =>
        splitReplacementNames(feature.replaces)
      )
    );
    const baseFeatures = (classData.features || []).filter(
      (feature) =>
        (Number(feature.level) || 0) <= level &&
        !replacements.some((replacement) =>
          featureMatches(feature.name, replacement)
        )
    );
    const archetypeFeatures = classArchetypes.flatMap((archetype) =>
      (archetype.features || []).filter(
        (feature) =>
          !feature.level || Number(feature.level) <= level
      )
    );
    const names = [];
    for (const feature of [...baseFeatures, ...archetypeFeatures]) {
      if (feature.name && !names.includes(feature.name)) {
        names.push(feature.name);
      }
    }
    all.push({
      classId: classEntry.classId,
      className: classData.name,
      level,
      archetypes: classArchetypes.map((archetype) => archetype.name),
      features: names,
      replacements,
    });
  }
  return { ...resolved, classes: all };
}

export function computeBAB(character) {
  let bab = 0;
  for (const classEntry of character.classes || []) {
    const classData = getClass(classEntry.classId);
    if (!classData) continue;
    const level = Number(classEntry.level) || 0;
    if (classData.bab === "high") bab += level;
    else if (classData.bab === "med") bab += Math.floor((level * 3) / 4);
    else bab += Math.floor(level / 2);
  }
  return bab;
}

export function computeSaves(character) {
  const saves = { fort: 0, ref: 0, will: 0 };
  for (const classEntry of character.classes || []) {
    const classData = getClass(classEntry.classId);
    if (!classData) continue;
    const level = Number(classEntry.level) || 0;
    const table = classData.savingThrows || {};
    for (const key of ["fort", "ref", "will"]) {
      const value = table[key]?.value;
      if (value === "high") saves[key] += 2 + Math.floor(level / 2);
      else saves[key] += Math.floor(level / 3);
    }
  }
  return saves;
}

export function computeHP(character) {
  const history = character.levelHistory || [];
  const conScore =
    (character.abilities?.base?.con || 10) +
    (character.abilities?.racial?.con || 0) +
    (character.abilities?.levelIncreases?.con || 0);
  const currentConMod = abilityModifier(conScore);
  let total = 0;
  const rolls = [];
  for (const entry of history) {
    const roll = entry.hp || {};
    const value = Math.max(1, (Number(roll.final) || 0) + currentConMod);
    total += value;
    rolls.push({ ...roll, conMod: currentConMod, value });
  }
  return { total, rolls };
}

export function computeSkillRanks(character) {
  const history = character.levelHistory || [];
  const intScore =
    (character.abilities?.base?.int || 10) +
    (character.abilities?.racial?.int || 0) +
    (character.abilities?.levelIncreases?.int || 0);
  const intMod = abilityModifier(intScore);
  let totalPoints = 0;
  for (const entry of history) {
    const classData = getClass(entry.classId);
    if (!classData) continue;
    totalPoints += Math.max(
      1,
      (Number(classData.skillsPerLevel) || 0) + intMod
    );
  }
  const ranks = character.skillRanks || {};
  const spent = Object.values(ranks).reduce(
    (sum, value) => sum + (Number(value) || 0),
    0
  );
  return { ranks, totalPoints, spent };
}

export function computeSkillBonus(character, skillId) {
  const skill = getSkill(skillId);
  if (!skill) return 0;
  const abilityKey = skill.ability;
  const abilityScore =
    (character.abilities?.base?.[abilityKey] || 10) +
    (character.abilities?.racial?.[abilityKey] || 0) +
    (character.abilities?.levelIncreases?.[abilityKey] || 0);
  let bonus = abilityModifier(abilityScore);
  const ranks = character.skillRanks?.[skillId] || 0;
  bonus += ranks;
  if (ranks > 0 && isClassSkill(character, skillId)) bonus += 3;
  return bonus;
}

export function isClassSkill(character, skillId) {
  const normalized = String(skillId).toLowerCase();
  for (const classEntry of character.classes || []) {
    const classData = getClass(classEntry.classId);
    if (!classData) continue;
    for (const classSkill of classData.classSkills || []) {
      if (String(classSkill).toLowerCase() === normalized) return true;
    }
  }
  return false;
}

export function computeAC(character) {
  const dexScore =
    (character.abilities?.base?.dex || 10) +
    (character.abilities?.racial?.dex || 0) +
    (character.abilities?.levelIncreases?.dex || 0);
  let dexCap = Infinity;
  for (const itemId of character.equipment || []) {
    const item = getEquipment(itemId);
    if (item?.type === "armor" && item.armor?.dex !== undefined && item.armor?.dex !== null) {
      dexCap = Math.min(dexCap, Number(item.armor.dex));
    }
  }
  const dexMod = Math.min(abilityModifier(dexScore), dexCap);
  let ac = 10 + dexMod;
  let touch = 10 + dexMod;
  let flatFooted = 10;
  let dr = 0;
  for (const itemId of character.equipment || []) {
    const item = getEquipment(itemId);
    if (!item) continue;
    if (item.type === "armor") {
      const armorBonus = Number(item.armor?.value) || 0;
      if (character.rules?.armorAsDR) {
        dr += armorBonus;
      } else {
        ac += armorBonus;
        flatFooted += armorBonus;
      }
    } else if (item.type === "shield") {
      const shieldBonus = Number(item.armor?.value) || 0;
      ac += shieldBonus;
      flatFooted += shieldBonus;
    }
  }
  return { ac, touch, flatFooted, dr };
}

export function validateMulticlass(character) {
  const errors = [];
  const totalLevel = (character.classes || []).reduce(
    (sum, entry) => sum + (Number(entry.level) || 0),
    0
  );
  if (totalLevel > 20) errors.push("Total character level cannot exceed 20.");
  if (totalLevel < 1) errors.push("Character must have at least one class level.");
  return { valid: errors.length === 0, errors, totalLevel };
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getFeatByName(name) {
  const normalized = normalizeName(name);
  if (!normalized) return null;
  return feats.find((entry) => normalizeName(entry.name) === normalized) || null;
}

function resolveFeatId(nameOrId) {
  const direct = getFeat(nameOrId);
  if (direct) return direct.id;
  return getFeatByName(nameOrId)?.id || null;
}

function characterHasFeat(character, nameOrId) {
  const targetId = resolveFeatId(nameOrId);
  const targetName = normalizeName(nameOrId);
  return (character.featIds || []).some((featId) => {
    if (targetId && featId === targetId) return true;
    const feat = getFeat(featId);
    return Boolean(feat && normalizeName(feat.name) === targetName);
  });
}

function getCharacterClassFeatures(character, archetypeList = []) {
  return getEffectiveClassFeatures(character, archetypeList).classes.flatMap(
    (entry) => entry.features
  );
}

function hasClassFeature(character, name, archetypeList = []) {
  const required = normalizeName(name);
  if (!required) return true;
  return getCharacterClassFeatures(character, archetypeList).some((feature) => {
    const normalized = normalizeName(feature);
    return (
      normalized === required ||
      normalized.includes(required) ||
      required.includes(normalized)
    );
  });
}

const PROFICIENCY_ALIASES = {
  lgt: ["light armor", "light"],
  med: ["medium armor", "medium"],
  hvy: ["heavy armor", "heavy"],
  shl: ["shield", "shields"],
  twr: ["tower shield", "tower shields"],
};

function hasProficiency(character, proficiency) {
  const required = normalizeName(proficiency).replace(/^the /, "");
  if (!required) return true;
  if (required.includes("selected weapon") || required === "weapon") {
    return (character.classes || []).some((entry) => {
      const classData = getClass(entry.classId);
      return Boolean(classData?.weaponProf?.length);
    });
  }
  for (const entry of character.classes || []) {
    const classData = getClass(entry.classId);
    if (!classData) continue;
    const proficiencies = [
      ...(classData.weaponProf || []),
      ...(classData.armorProf || []),
    ];
    for (const available of proficiencies) {
      const normalized = normalizeName(available);
      const names = PROFICIENCY_ALIASES[normalized] || [normalized];
      if (
        names.some(
          (name) => name.includes(required) || required.includes(name)
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

function maxCasterLevel(character) {
  return Math.max(
    0,
    ...(character.classes || []).map((entry) =>
      computeCasterLevel(character, entry.classId)
    )
  );
}

function canCastSpellLevel(character, spellLevel, spellType) {
  for (const entry of character.classes || []) {
    const classData = getClass(entry.classId);
    if (!classData?.casting) continue;
    if (
      spellType &&
      classData.casting.spells &&
      classData.casting.spells !== spellType &&
      !(spellType === "arcane" && classData.casting.spells === "alchemy")
    ) {
      continue;
    }
    const slots = computeSpellSlots(character, entry.classId);
    if (slots && (slots.slots[spellLevel] || 0) > 0) return true;
  }
  return false;
}

function meaningfulUnparsed(value) {
  const cleaned = String(value || "")
    .replace(/@UUID\[[^\]]+\]\{[^}]*\}/g, " ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim();
  return cleaned.length > 1;
}

export function validateFeatPrerequisites(character, featId, options = {}) {
  const feat = getFeat(featId) || getFeatByName(featId);
  if (!feat) return { valid: false, errors: ["Feat not found."] };
  const prerequisites = feat.prerequisites || {};
  const errors = [];
  const abilities = {
    ...(character.abilities?.base || {}),
    ...(character.abilities?.racial || {}),
    ...(character.abilities?.levelIncreases || {}),
  };
  for (const [key, min] of Object.entries(prerequisites.abilities || {})) {
    if ((Number(abilities[key]) || 0) < Number(min)) {
      errors.push(`${ABILITY_NAMES[key]} ${min}+ required.`);
    }
  }
  if (prerequisites.bab && computeBAB(character) < Number(prerequisites.bab)) {
    errors.push(`Base attack bonus +${prerequisites.bab} required.`);
  }
  if (
    prerequisites.characterLevel &&
    validateMulticlass(character).totalLevel < Number(prerequisites.characterLevel)
  ) {
    errors.push(`Character level ${prerequisites.characterLevel} required.`);
  }
  if (
    prerequisites.casterLevel &&
    maxCasterLevel(character) < Number(prerequisites.casterLevel)
  ) {
    errors.push(`Caster level ${prerequisites.casterLevel} required.`);
  }
  if (
    prerequisites.spellLevel !== null &&
    prerequisites.spellLevel !== undefined
  ) {
    const spellLevel = Number(prerequisites.spellLevel);
    if (spellLevel > 0) {
      if (!canCastSpellLevel(character, spellLevel, prerequisites.spellType)) {
        errors.push(
          `Ability to cast ${prerequisites.spellType || "arcane or divine"} level ${spellLevel} spells required.`
        );
      }
    } else if (
      !(character.classes || []).some((entry) => Boolean(getClass(entry.classId)?.casting))
    ) {
      errors.push(
        `Ability to cast ${prerequisites.spellType || "arcane or divine"} spells required.`
      );
    }
  }
  for (const featName of prerequisites.feats || []) {
    if (!characterHasFeat(character, featName)) {
      errors.push(`Feat "${featName}" required.`);
    }
  }
  if (prerequisites.anyFeats?.length) {
    const matched = prerequisites.anyFeats.some((featName) =>
      characterHasFeat(character, featName)
    );
    if (!matched) {
      errors.push(`One of these feats required: ${prerequisites.anyFeats.join(", ")}.`);
    }
  }
  for (const [skillName, ranks] of Object.entries(prerequisites.skills || {})) {
    const skillEntry = skills.find(
      (skill) => normalizeName(skill.name) === normalizeName(skillName)
    );
    const skillId = skillEntry?.id || skillName;
    const rankValue =
      character.skillRanks?.[skillId] ??
      Object.entries(character.skillRanks || {}).find(
        ([key]) => normalizeName(key) === normalizeName(skillName)
      )?.[1] ??
      0;
    if (Number(rankValue) < Number(ranks)) {
      errors.push(`${skillEntry?.name || skillName} ${ranks} ranks required.`);
    }
  }
  if (prerequisites.races?.length) {
    const raceId = normalizeName(character.identity?.raceId);
    const raceName = normalizeName(
      races.find((entry) => entry.id === character.identity?.raceId)?.name
    );
    const match = prerequisites.races.some((race) => {
      const normalized = normalizeName(race);
      return raceId.includes(normalized) || raceName.includes(normalized);
    });
    if (!match) errors.push(`Race ${prerequisites.races.join(", ")} required.`);
  }
  for (const feature of prerequisites.classFeatures || []) {
    if (!hasClassFeature(character, feature, options.archetypes || [])) {
      errors.push(`Class feature "${feature}" required.`);
    }
  }
  for (const proficiency of prerequisites.proficiencies || []) {
    if (!hasProficiency(character, proficiency)) {
      errors.push(`Proficiency with ${proficiency} required.`);
    }
  }
  for (const [classId, level] of Object.entries(
    prerequisites.classLevels || {}
  )) {
    if (["level", "character", "caster", "spell"].includes(normalizeName(classId))) {
      continue;
    }
    const classEntry = (character.classes || []).find(
      (entry) => normalizeName(entry.classId) === normalizeName(classId)
    );
    if ((Number(classEntry?.level) || 0) < Number(level)) {
      errors.push(`${classId} level ${level} required.`);
    }
  }
  if (prerequisites.alignment) {
    const alignment = normalizeName(character.meta?.alignment);
    if (!alignment.includes(normalizeName(prerequisites.alignment))) {
      errors.push(`Alignment ${prerequisites.alignment} required.`);
    }
  }
  if (options.allowUnparsed === false && meaningfulUnparsed(prerequisites.unparsed)) {
    errors.push(`Unresolved prerequisite: ${prerequisites.unparsed}`);
  }
  return { valid: errors.length === 0, errors };
}

export function computeCasterLevel(character, classId) {
  const classEntry = (character.classes || []).find((entry) => entry.classId === classId);
  if (!classEntry) return 0;
  const classData = getClass(classId);
  if (!classData?.casting) return 0;
  if (classData.casting.progression === "low") {
    return Math.max(0, (Number(classEntry.level) || 0) - 3);
  }
  return Number(classEntry.level) || 0;
}

export function computeSpellSlots(character, classId) {
  const classEntry = (character.classes || []).find((entry) => entry.classId === classId);
  if (!classEntry) return null;
  const classData = getClass(classId);
  if (!classData?.casting) return null;
  const level = Number(classEntry.level) || 0;
  const progression = classData.casting.progression;
  const isSpontaneous = classData.casting.type === "spontaneous";
  let table = FULL_CASTER_SLOTS;
  if (progression === "med") table = MEDIUM_CASTER_SLOTS;
  else if (progression === "low") table = HALF_CASTER_SLOTS;
  else if (isSpontaneous) table = SPONTANEOUS_FULL_SLOTS;
  const slots = [...(table[Math.min(level, 20) - 1] || table[0])];
  if (isSpontaneous || !classData.casting.cantrips) slots[0] = 0;
  const abilityKey = classData.casting.ability;
  const abilityScore =
    (character.abilities?.base?.[abilityKey] || 10) +
    (character.abilities?.racial?.[abilityKey] || 0) +
    (character.abilities?.levelIncreases?.[abilityKey] || 0);
  const abilityMod = abilityModifier(abilityScore);
  const bonus = [];
  for (let spellLevel = 0; spellLevel < 10; spellLevel++) {
    if (spellLevel === 0) {
      bonus.push(0);
      continue;
    }
    if (abilityMod < spellLevel || abilityScore < 10 + spellLevel) {
      bonus.push(0);
      continue;
    }
    const bonusSpells = Math.floor((abilityMod - spellLevel) / 4) + 1;
    bonus.push(Math.max(0, bonusSpells));
  }
  return { level, progression, slots, bonus, abilityScore, abilityMod };
}

export function computeSpellSaveDC(character, spell, classId) {
  const classData = getClass(classId);
  if (!classData?.casting || !spell) return 10;
  const abilityKey = classData.casting.ability;
  const abilityScore =
    (character.abilities?.base?.[abilityKey] || 10) +
    (character.abilities?.racial?.[abilityKey] || 0) +
    (character.abilities?.levelIncreases?.[abilityKey] || 0);
  const spellLevel = Number(spell.classLevels?.[classId] ?? spell.level) || 0;
  return 10 + spellLevel + abilityModifier(abilityScore);
}

export function getSpellsForClass(spells, classId) {
  return spells.filter((spell) => {
    const levels = spell.classLevels || {};
    return Object.prototype.hasOwnProperty.call(levels, classId);
  });
}

export function deriveCharacter(character, options = {}) {
  const errors = [];
  const totalLevel = (character.classes || []).reduce(
    (sum, entry) => sum + (Number(entry.level) || 0),
    0
  );
  const bab = computeBAB(character);
  const saves = computeSaves(character);
  const hp = computeHP(character);
  const skills = computeSkillRanks(character);
  const ac = computeAC(character);
  const archetypeList = options.archetypes || [];
  const archetypeData = getEffectiveClassFeatures(character, archetypeList);
  const featErrors = [];
  for (const featId of character.featIds || []) {
    const result = validateFeatPrerequisites(character, featId, {
      allowUnparsed: false,
      archetypes: archetypeList,
    });
    if (!result.valid) featErrors.push({ featId, errors: result.errors });
  }
  const classErrors = [];
  for (const classEntry of character.classes || []) {
    if (!getClass(classEntry.classId)) classErrors.push(`Unknown class ${classEntry.classId}`);
  }
  const archetypeErrors = [...archetypeData.errors, ...archetypeData.conflicts];
  return {
    totalLevel,
    bab,
    saves,
    hp,
    skills,
    ac,
    classFeatures: archetypeData.classes,
    archetypeErrors,
    featErrors,
    classErrors,
    valid:
      errors.length === 0 &&
      featErrors.length === 0 &&
      classErrors.length === 0 &&
      archetypeErrors.length === 0,
  };
}

export function levelUp(character, classId, options = {}) {
  const classData = getClass(classId);
  if (!classData) throw new Error(`Unknown class: ${classId}`);
  const totalLevel = (character.classes || []).reduce(
    (sum, entry) => sum + (Number(entry.level) || 0),
    0
  );
  if (totalLevel >= 20) throw new Error("Character is already at maximum level.");
  const existingClass = (character.classes || []).find(
    (entry) => entry.classId === classId
  );
  if (existingClass && (Number(existingClass.level) || 0) >= 20) {
    throw new Error(`${classData.name} is already at level 20.`);
  }
  const rng = options.rng || Math.random;
  const hitDie = Number(classData.hitDie) || 1;
  const isFirstLevel = totalLevel === 0;
  let firstRoll = isFirstLevel ? hitDie : Math.max(1, Math.min(hitDie, Math.floor(rng() * hitDie) + 1));
  let reroll = null;
  let final = firstRoll;
  if (!isFirstLevel && firstRoll === 1) {
    reroll = Math.max(1, Math.min(hitDie, Math.floor(rng() * hitDie) + 1));
    final = reroll;
  }
  const conScore =
    (character.abilities?.base?.con || 10) +
    (character.abilities?.racial?.con || 0) +
    (character.abilities?.levelIncreases?.con || 0);
  const conMod = abilityModifier(conScore);
  const addedFeatIds = (options.featIds || []).filter(
    (featId) => !(character.featIds || []).includes(featId)
  );
  const historyEntry = {
    classId,
    archetypeIds: options.archetypeIds || [],
    hp: { die: hitDie, firstRoll, reroll, final, conMod },
    skillRanks: options.skillRanks || {},
    featIds: addedFeatIds,
    abilityIncrease: options.abilityIncrease || null,
  };
  const classes = (character.classes || []).map((entry) =>
    entry.classId === classId
      ? {
          ...entry,
          level: (Number(entry.level) || 0) + 1,
          ...(options.archetypeIds
            ? { archetypeIds: options.archetypeIds }
            : {}),
        }
      : entry
  );
  if (!classes.some((entry) => entry.classId === classId)) {
    classes.push({ classId, level: 1, archetypeIds: options.archetypeIds || [] });
  }
  const levelHistory = [...(character.levelHistory || []), historyEntry];
  const featIds = [...(character.featIds || []), ...addedFeatIds];
  const skillRanks = { ...(character.skillRanks || {}) };
  for (const [skillId, value] of Object.entries(options.skillRanks || {})) {
    skillRanks[skillId] = (skillRanks[skillId] || 0) + Number(value);
  }
  const abilities = {
    ...character.abilities,
    levelIncreases: {
      ...(character.abilities?.levelIncreases || {}),
      ...(options.abilityIncrease
        ? { [options.abilityIncrease]: (character.abilities?.levelIncreases?.[options.abilityIncrease] || 0) + 1 }
        : {}),
    },
  };
  return {
    ...character,
    classes,
    levelHistory,
    featIds,
    skillRanks,
    abilities,
  };
}

export function undoLevel(character) {
  const history = [...(character.levelHistory || [])];
  const last = history.pop();
  if (!last) return character;
  const priorForClass = [...history]
    .reverse()
    .find((entry) => entry.classId === last.classId);
  const classes = (character.classes || [])
    .map((entry) =>
      entry.classId === last.classId
        ? {
            ...entry,
            level: Math.max(0, (Number(entry.level) || 0) - 1),
            ...(priorForClass || last.archetypeIds
              ? {
                  archetypeIds:
                    priorForClass?.archetypeIds ??
                    last.archetypeIds ??
                    entry.archetypeIds ??
                    [],
                }
              : {}),
          }
        : entry
    )
    .filter((entry) => (Number(entry.level) || 0) > 0);
  const featIds = [...(character.featIds || [])];
  for (const featId of last.featIds || []) {
    const index = featIds.lastIndexOf(featId);
    if (index >= 0) featIds.splice(index, 1);
  }
  const skillRanks = { ...(character.skillRanks || {}) };
  for (const [skillId, value] of Object.entries(last.skillRanks || {})) {
    skillRanks[skillId] = Math.max(0, (Number(skillRanks[skillId]) || 0) - Number(value));
  }
  const levelIncreases = { ...(character.abilities?.levelIncreases || {}) };
  if (last.abilityIncrease) {
    levelIncreases[last.abilityIncrease] = Math.max(
      0,
      (Number(levelIncreases[last.abilityIncrease]) || 0) - 1
    );
  }
  return {
    ...character,
    classes,
    levelHistory: history,
    featIds,
    skillRanks,
    abilities: { ...character.abilities, levelIncreases },
  };
}

export function rebuildFromHistory(character) {
  const skillRanks = {};
  const featIds = [];
  const levelIncreases = {};
  for (const entry of character.levelHistory || []) {
    for (const [skillId, value] of Object.entries(entry.skillRanks || {})) {
      skillRanks[skillId] = (skillRanks[skillId] || 0) + Number(value);
    }
    featIds.push(...(entry.featIds || []));
    if (entry.abilityIncrease) {
      levelIncreases[entry.abilityIncrease] =
        (levelIncreases[entry.abilityIncrease] || 0) + 1;
    }
  }
  return {
    ...character,
    skillRanks,
    featIds,
    abilities: { ...character.abilities, levelIncreases },
  };
}

export function migrateCharacter(saved) {
  const character = { ...(saved || {}) };
  character.schemaVersion = Number(character.schemaVersion) || 1;
  character.meta = {
    name: "",
    alignment: "",
    deity: "",
    age: "",
    gender: "",
    notes: "",
    ...(character.meta || {}),
  };
  const rules = character.rules || {};
  character.rules = {
    ...rules,
    pointBuy: {
      enabled: true,
      total: 15,
      ...(rules.pointBuy || {}),
    },
    armorAsDR: Boolean(rules.armorAsDR),
  };
  character.abilities = {
    base: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    racial: {},
    levelIncreases: {},
    ...(character.abilities || {}),
  };
  character.identity = {
    raceId: "",
    alternateRacialTraitIds: [],
    traitIds: [],
    drawbackIds: [],
    ...(character.identity || {}),
  };
  character.classes = Array.isArray(character.classes) ? character.classes : [];
  character.levelHistory = Array.isArray(character.levelHistory)
    ? character.levelHistory
    : [];
  character.skillRanks = character.skillRanks || {};
  character.featIds = Array.isArray(character.featIds) ? character.featIds : [];
  character.equipment = Array.isArray(character.equipment)
    ? character.equipment
    : [];
  const spellcasting = character.spellcasting || {};
  character.spellcasting = {
    known: spellcasting.known || {},
    prepared: spellcasting.prepared || {},
    usedSlots: spellcasting.usedSlots || {},
  };
  return character;
}

export function validateTraitSelection(character) {
  const errors = [];
  const traitIds = Array.isArray(character.identity?.traitIds)
    ? character.identity.traitIds
    : [];
  const drawbackIds = Array.isArray(character.identity?.drawbackIds)
    ? character.identity.drawbackIds
    : [];
  if (new Set(traitIds).size !== traitIds.length) {
    errors.push("The same trait cannot be selected twice.");
  }
  if (new Set(drawbackIds).size !== drawbackIds.length) {
    errors.push("The same drawback cannot be selected twice.");
  }
  if (drawbackIds.length > 1) {
    errors.push("Select at most one drawback.");
  }
  const maxTraits = 2 + Math.min(drawbackIds.length, 1);
  if (traitIds.length > maxTraits) {
    errors.push(`Select at most ${maxTraits} traits.`);
  }
  for (const traitId of traitIds) {
    const trait = getTrait(traitId);
    if (!trait) errors.push(`Unknown trait: ${traitId}.`);
    else if (trait.type !== "trait") errors.push(`${trait.name} is a drawback.`);
  }
  for (const drawbackId of drawbackIds) {
    const drawback = getTrait(drawbackId);
    if (!drawback) errors.push(`Unknown drawback: ${drawbackId}.`);
    else if (drawback.type !== "drawback") {
      errors.push(`${drawback.name} is not a drawback.`);
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validateCharacter(character, options = {}) {
  const errors = [];
  const archetypeList = options.archetypes || [];
  if (!character.meta?.name?.trim()) errors.push("Character name is required.");
  if (!character.identity?.raceId) errors.push("Race is required.");
  if (!character.classes?.length) errors.push("At least one class is required.");
  const totalLevel = (character.classes || []).reduce(
    (sum, entry) => sum + (Number(entry.level) || 0),
    0
  );
  if (totalLevel < 1) errors.push("Character must have at least one level.");
  if (totalLevel > 20) errors.push("Total character level cannot exceed 20.");
  errors.push(...validateTraitSelection(character).errors);
  const archetypeData = getEffectiveClassFeatures(character, archetypeList);
  errors.push(...archetypeData.errors, ...archetypeData.conflicts);
  if (character.rules?.pointBuy?.enabled) {
    const scores = character.abilities?.base || {};
    const result = validatePointBuy(scores, character.rules.pointBuy.total);
    errors.push(...result.errors);
  }
  for (const classEntry of character.classes || []) {
    if (!getClass(classEntry.classId)) errors.push(`Unknown class: ${classEntry.classId}`);
  }
  const skillPoints = computeSkillRanks(character);
  if (skillPoints.spent > skillPoints.totalPoints) {
    errors.push(
      `Skill ranks overspent: ${skillPoints.spent}/${skillPoints.totalPoints}.`
    );
  }
  for (const [skillId, value] of Object.entries(character.skillRanks || {})) {
    if ((Number(value) || 0) < 0) {
      errors.push(`Skill ranks cannot be negative: ${skillId}.`);
    }
  }
  for (const featId of character.featIds || []) {
    const result = validateFeatPrerequisites(character, featId, {
      allowUnparsed: false,
      archetypes: archetypeList,
    });
    if (!result.valid) {
      const feat = getFeat(featId);
      errors.push(
        `${feat?.name || featId}: ${result.errors.join(" ")}`
      );
    }
  }
  return { valid: errors.length === 0, errors };
}
