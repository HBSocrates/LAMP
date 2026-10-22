import React, { useEffect, useMemo, useState } from "react";
import "../styles/App.css";
import "../styles/Pathfinder.css";
import {
  ABILITY_KEYS,
  ABILITY_NAMES,
  DATA,
  abilityModifier,
  computeCasterLevel,
  computeSkillBonus,
  computeSpellSaveDC,
  computeSpellSlots,
  deriveCharacter,
  getFeat,
  getClass,
  getSpellsForClass,
  getTrait,
  levelUp,
  migrateCharacter,
  rebuildFromHistory,
  undoLevel,
  validateCharacter,
  validateFeatPrerequisites,
  validatePointBuy,
} from "../pathfinder/rules.js";

const DEFAULT_CHARACTER = {
  schemaVersion: 1,
  meta: { name: "", alignment: "", deity: "", age: "", gender: "", notes: "" },
  rules: { pointBuy: { enabled: true, total: 15 }, armorAsDR: false },
  sourceBooks: ["PZO1110", "PZO1115", "PZO1117", "PZO1118", "PZO1123", "PZO1125", "PZO1134", "PZO1140"],
  identity: { raceId: "", alternateRacialTraitIds: [], traitIds: [], drawbackIds: [] },
  abilities: {
    base: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    racial: {},
    levelIncreases: {},
  },
  classes: [],
  levelHistory: [],
  skillRanks: {},
  featIds: [],
  equipment: [],
  spellcasting: { known: {}, prepared: {}, usedSlots: {} },
};

const isLoggedIn = () => localStorage.getItem("loggedIn") === "true";
const getUsername = () => localStorage.getItem("username") || "";

function formatFeatPrerequisites(feat) {
  const prerequisites = feat?.prerequisites || {};
  const parts = [];
  for (const [key, value] of Object.entries(prerequisites.abilities || {})) {
    parts.push(`${ABILITY_NAMES[key]} ${value}`);
  }
  if (prerequisites.bab) parts.push(`BAB +${prerequisites.bab}`);
  if (prerequisites.characterLevel) parts.push(`Level ${prerequisites.characterLevel}`);
  if (prerequisites.casterLevel) parts.push(`Caster level ${prerequisites.casterLevel}`);
  if (prerequisites.spellLevel) {
    parts.push(
      `Cast ${prerequisites.spellLevel}${prerequisites.spellType ? ` ${prerequisites.spellType}` : ""} spells`
    );
  }
  for (const [skill, ranks] of Object.entries(prerequisites.skills || {})) {
    parts.push(`${skill} ${ranks} rank${Number(ranks) === 1 ? "" : "s"}`);
  }
  parts.push(...(prerequisites.feats || []));
  if (prerequisites.anyFeats?.length) {
    parts.push(`One of: ${prerequisites.anyFeats.join(", ")}`);
  }
  for (const [classId, level] of Object.entries(prerequisites.classLevels || {})) {
    if (!["level", "character", "caster", "spell"].includes(classId)) {
      parts.push(`${classId} ${level}`);
    }
  }
  parts.push(...(prerequisites.races || []));
  parts.push(...(prerequisites.classFeatures || []));
  parts.push(...(prerequisites.proficiencies || []));
  if (prerequisites.alignment) parts.push(`Alignment: ${prerequisites.alignment}`);
  if (prerequisites.unparsed) parts.push(prerequisites.unparsed);
  return parts.join(", ");
}

function formatClassList(classes) {
  if (!classes) return "";
  return classes
    .split(",")
    .map((classId) => classId.trim())
    .filter(Boolean)
    .map((classId) => getClass(classId)?.name || classId)
    .join(" / ");
}

function getRaceName(raceId) {
  return DATA.races.find((race) => race.id === raceId)?.name || raceId || "";
}

function skillPointsForLevel(character, classData) {
  const intScore =
    (character.abilities?.base?.int || 10) +
    (character.abilities?.racial?.int || 0) +
    (character.abilities?.levelIncreases?.int || 0);
  return Math.max(1, (Number(classData?.skillsPerLevel) || 0) + abilityModifier(intScore));
}

function Pathfinder() {
  const [character, setCharacter] = useState(DEFAULT_CHARACTER);
  const [savedId, setSavedId] = useState(null);
  const [spells, setSpells] = useState([]);
  const [archetypes, setArchetypes] = useState([]);
  const [savedCharacters, setSavedCharacters] = useState([]);
  const [loadOpen, setLoadOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [featQuery, setFeatQuery] = useState("");
  const [spellQuery, setSpellQuery] = useState("");
  const [levelOpen, setLevelOpen] = useState(false);
  const [levelClassId, setLevelClassId] = useState("");
  const [levelArchetypeId, setLevelArchetypeId] = useState("");
  const [levelSkillRanks, setLevelSkillRanks] = useState({});
  const [levelFeatIds, setLevelFeatIds] = useState([]);
  const [levelAbilityIncrease, setLevelAbilityIncrease] = useState("");
  const [levelError, setLevelError] = useState("");

  const derived = useMemo(
    () => deriveCharacter(character, { archetypes }),
    [character, archetypes]
  );
  const levelSkillPoints = useMemo(() => {
    const classData = getClass(levelClassId);
    return skillPointsForLevel(character, classData);
  }, [character, levelClassId]);
  const pointBuy = useMemo(
    () => validatePointBuy(character.abilities.base, character.rules.pointBuy.total),
    [character.abilities.base, character.rules.pointBuy.total]
  );
  const race = useMemo(
    () => DATA.races.find((entry) => entry.id === character.identity.raceId) || null,
    [character.identity.raceId]
  );
  const raceAbilityModifiers = useMemo(() => {
    if (!race) return {};
    if (race.id === "human") {
      const chosen = character.identity.humanAbility || null;
      return chosen ? { [chosen]: 2 } : {};
    }
    return race.abilityModifiers || {};
  }, [race, character.identity.humanAbility]);
  const classes = DATA.classes;
  const feats = DATA.feats;
  const equipment = DATA.equipment;
  const skills = DATA.skills;
  const alternateTraits = race ? DATA.alternateRacialTraits[race.id] || [] : [];
  const traits = DATA.traits;
  const selectedTraits = (character.identity.traitIds || [])
    .map((traitId) => getTrait(traitId))
    .filter(Boolean);
  const selectedDrawbacks = (character.identity.drawbackIds || [])
    .map((traitId) => getTrait(traitId))
    .filter(Boolean);

  useEffect(() => {
    let active = true;
    import("../pathfinder/data/spells.json").then((module) => {
      if (active) setSpells(module.default);
    });
    import("../pathfinder/data/archetypes.json").then((module) => {
      if (active) setArchetypes(module.default);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn()) fetchSavedCharacters();
  }, []);

  useEffect(() => {
    if (!dirty) return undefined;
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const update = (updater) => {
    setCharacter((current) => updater(current));
    setDirty(true);
  };
  const updateMeta = (key, value) =>
    update((current) => ({ ...current, meta: { ...current.meta, [key]: value } }));
  const updateRules = (key, value) =>
    update((current) => ({ ...current, rules: { ...current.rules, [key]: value } }));
  const updateAbility = (key, value) =>
    update((current) => ({
      ...current,
      abilities: {
        ...current.abilities,
        base: { ...current.abilities.base, [key]: Number(value) },
      },
    }));
  const updateClass = (classId, patch) =>
    update((current) => ({
      ...current,
      classes: current.classes.map((entry) =>
        entry.classId === classId ? { ...entry, ...patch } : entry
      ),
    }));
  const addClass = (classId) => {
    if (character.classes.some((entry) => entry.classId === classId)) return;
    if (derived.totalLevel >= 20) {
      setMessage("Total character level cannot exceed 20.");
      return;
    }
    try {
      setCharacter(levelUp(character, classId, {}));
      setDirty(true);
    } catch (error) {
      setMessage(error.message);
    }
  };
  const removeClass = (classId) =>
    update((current) => {
      const classes = current.classes.filter((entry) => entry.classId !== classId);
      const levelHistory = (current.levelHistory || []).filter(
        (entry) => entry.classId !== classId
      );
      return rebuildFromHistory({ ...current, classes, levelHistory });
    });
  const updateSkillRank = (skillId, value) =>
    update((current) => ({
      ...current,
      skillRanks: {
        ...current.skillRanks,
        [skillId]: Math.max(
          0,
          Math.min(derived.totalLevel, Number(value) || 0)
        ),
      },
    }));
  const toggleTrait = (traitId, type) => {
    const key = type === "drawback" ? "drawbackIds" : "traitIds";
    const list = character.identity?.[key] || [];
    const selected = list.includes(traitId);
    if (!selected) {
      const drawbackCount = (character.identity?.drawbackIds || []).length;
      const max =
        type === "drawback" ? 1 : 2 + Math.min(drawbackCount, 1);
      if (list.length >= max) {
        setMessage(
          type === "drawback"
            ? "Select at most one drawback."
            : `Select at most ${max} traits.`
        );
        return;
      }
    }
    update((current) => {
      const currentList = current.identity?.[key] || [];
      return {
        ...current,
        identity: {
          ...current.identity,
          [key]: selected
            ? currentList.filter((id) => id !== traitId)
            : [...currentList, traitId],
        },
      };
    });
  };
  const toggleFeat = (featId) => {
    const selected = character.featIds.includes(featId);
    if (!selected) {
      const result = validateFeatPrerequisites(character, featId, {
        allowUnparsed: false,
        archetypes,
      });
      if (!result.valid) {
        const feat = getFeat(featId);
        setMessage(`${feat?.name || "Feat"}: ${result.errors.join(" ")}`);
        return;
      }
    }
    update((current) => ({
      ...current,
      featIds: selected
        ? current.featIds.filter((id) => id !== featId)
        : [...current.featIds, featId],
    }));
  };
  const toggleEquipment = (itemId) =>
    update((current) => ({
      ...current,
      equipment: current.equipment.includes(itemId)
        ? current.equipment.filter((id) => id !== itemId)
        : [...current.equipment, itemId],
    }));

  const updateSpellcasting = (updater) =>
    update((current) => ({
      ...current,
      spellcasting: updater(current.spellcasting || {}),
    }));
  const toggleKnownSpell = (classId, spellId) =>
    updateSpellcasting((spellcasting) => {
      const known = spellcasting.known || {};
      const list = known[classId] || [];
      return {
        ...spellcasting,
        known: {
          ...known,
          [classId]: list.includes(spellId)
            ? list.filter((id) => id !== spellId)
            : [...list, spellId],
        },
      };
    });
  const addPreparedSpell = (classId, level, spellId) => {
    if (!spellId) return;
    updateSpellcasting((spellcasting) => {
      const prepared = spellcasting.prepared || {};
      const classPrepared = prepared[classId] || {};
      const list = classPrepared[level] || [];
      return {
        ...spellcasting,
        prepared: {
          ...prepared,
          [classId]: { ...classPrepared, [level]: [...list, spellId] },
        },
      };
    });
  };
  const removePreparedSpell = (classId, level, index) =>
    updateSpellcasting((spellcasting) => {
      const prepared = spellcasting.prepared || {};
      const classPrepared = prepared[classId] || {};
      const list = [...(classPrepared[level] || [])];
      list.splice(index, 1);
      return {
        ...spellcasting,
        prepared: {
          ...prepared,
          [classId]: { ...classPrepared, [level]: list },
        },
      };
    });
  const setUsedSlots = (classId, level, value) =>
    updateSpellcasting((spellcasting) => {
      const usedSlots = spellcasting.usedSlots || {};
      const classUsed = usedSlots[classId] || {};
      return {
        ...spellcasting,
        usedSlots: {
          ...usedSlots,
          [classId]: { ...classUsed, [level]: Math.max(0, Number(value) || 0) },
        },
      };
    });

  const openLevelUp = (classId) => {
    if (derived.totalLevel >= 20) {
      setMessage("Total character level cannot exceed 20.");
      return;
    }
    const nextClassId =
      classId || character.classes[0]?.classId || DATA.classes[0].id;
    setLevelClassId(nextClassId);
    setLevelArchetypeId(
      character.classes.find((entry) => entry.classId === nextClassId)
        ?.archetypeIds?.[0] || ""
    );
    setLevelSkillRanks({});
    setLevelFeatIds([]);
    setLevelAbilityIncrease("");
    setLevelError("");
    setLevelOpen(true);
  };

  const handleConfirmLevelUp = () => {
    const classData = getClass(levelClassId);
    if (!classData) {
      setLevelError("Choose a class.");
      return;
    }
    const spent = Object.values(levelSkillRanks).reduce(
      (sum, value) => sum + (Number(value) || 0),
      0
    );
    if (spent > levelSkillPoints) {
      setLevelError(`You can only spend ${levelSkillPoints} skill points this level.`);
      return;
    }
    const nextTotalLevel = derived.totalLevel + 1;
    const needsAbilityIncrease = [4, 8, 12, 16, 20].includes(nextTotalLevel);
    if (needsAbilityIncrease && !levelAbilityIncrease) {
      setLevelError("Choose an ability score to increase.");
      return;
    }
    let next;
    try {
      next = levelUp(character, levelClassId, {
        skillRanks: Object.fromEntries(
          Object.entries(levelSkillRanks).filter(([, value]) => Number(value) > 0)
        ),
        featIds: levelFeatIds,
        abilityIncrease: levelAbilityIncrease || null,
        archetypeIds: levelArchetypeId ? [levelArchetypeId] : [],
      });
    } catch (error) {
      setLevelError(error.message);
      return;
    }
    const featErrors = [];
    for (const featId of levelFeatIds) {
      const result = validateFeatPrerequisites(next, featId, {
        allowUnparsed: false,
        archetypes,
      });
      if (!result.valid) {
        featErrors.push(`${getFeat(featId)?.name || featId}: ${result.errors.join(" ")}`);
      }
    }
    if (featErrors.length > 0) {
      setLevelError(featErrors.join(" "));
      return;
    }
    const hpEntry = next.levelHistory[next.levelHistory.length - 1]?.hp;
    setCharacter(next);
    setDirty(true);
    setLevelOpen(false);
    setMessage(
      hpEntry
        ? `Level ${nextTotalLevel} gained. HP roll: ${hpEntry.final}${hpEntry.reroll ? ` (rerolled from ${hpEntry.firstRoll})` : ""}.`
        : `Level ${nextTotalLevel} gained.`
    );
  };

  const handleUndoLevel = () => {
    if (!character.levelHistory?.length) return;
    setCharacter(undoLevel(character));
    setDirty(true);
    setMessage("Last level removed.");
  };

  const fetchSavedCharacters = async () => {
    if (!isLoggedIn()) return;
    try {
      const response = await fetch(
        `/api/pathfinder/characters?username=${encodeURIComponent(getUsername())}`
      );
      const data = await response.json();
      if (response.ok) setSavedCharacters(data.characters || []);
    } catch (error) {
      console.error("Failed to load saved characters", error);
    }
  };

  const saveCharacter = async () => {
    if (!isLoggedIn()) {
      setMessage("Log in to save characters.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const data = JSON.stringify(character);
      const body = new URLSearchParams({
        username: getUsername(),
        name: character.meta.name || "Unnamed Character",
        data,
      });
      const url = savedId
        ? `/api/pathfinder/characters/${savedId}`
        : "/api/pathfinder/characters";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Save failed");
      if (result.id) setSavedId(result.id);
      setDirty(false);
      setMessage("Character saved.");
      fetchSavedCharacters();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const loadCharacter = async (id) => {
    if (!isLoggedIn()) return;
    if (dirty && !window.confirm("Discard unsaved changes and load this character?")) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `/api/pathfinder/characters/${id}?username=${encodeURIComponent(getUsername())}`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Load failed");
      setCharacter(migrateCharacter(data.character.data));
      setSavedId(id);
      setLoadOpen(false);
      setDirty(false);
      setMessage("Character loaded.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCharacter = async (id) => {
    if (!isLoggedIn()) return;
    if (!window.confirm("Delete this saved character?")) return;
    try {
      const response = await fetch(`/api/pathfinder/characters/${id}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: getUsername() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Delete failed");
      if (savedId === id) setSavedId(null);
      fetchSavedCharacters();
      setMessage("Character deleted.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const validation = validateCharacter(character, { archetypes });
  const nextLevel = derived.totalLevel + 1;
  const levelAbilityRequired = [4, 8, 12, 16, 20].includes(nextLevel);
  const classOptions = classes.filter((entry) => !character.classes.some((c) => c.classId === entry.id));
  const armorItems = equipment.filter((item) => item.type === "armor");
  const shieldItems = equipment.filter((item) => item.type === "shield");

  return (
    <div className="pf-wrapper">
      <div className="pf-header">
        <h1>Pathfinder 1e Character Builder</h1>
        <div className="pf-header-actions">
          <button onClick={saveCharacter} disabled={saving || !validation.valid}>
            {saving ? "Saving..." : savedId ? "Save" : "Save As New"}
          </button>
          <button onClick={() => setLoadOpen(true)} disabled={!isLoggedIn()}>
            Load
          </button>
          <button
            onClick={() => {
              if (dirty && !window.confirm("Discard unsaved changes and start a new character?")) {
                return;
              }
              setCharacter(DEFAULT_CHARACTER);
              setSavedId(null);
              setDirty(false);
              setMessage("New character.");
            }}
          >
            New
          </button>
        </div>
      </div>

      {!isLoggedIn() && (
        <div className="pf-notice">Log in to save and load characters. You can still build locally.</div>
      )}
      {message && <div className="pf-message">{message}</div>}
      {!validation.valid && (
        <div className="pf-errors">
          {validation.errors.map((error) => (
            <div key={error}>{error}</div>
          ))}
        </div>
      )}

      <div className="pf-layout">
        <div className="pf-main">
          <section className="pf-card">
            <h2>Identity</h2>
            <label>
              Character Name
              <input
                value={character.meta.name}
                onChange={(event) => updateMeta("name", event.target.value)}
                placeholder="Character name"
              />
            </label>
            <label>
              Race
              <select
                value={character.identity.raceId}
                onChange={(event) =>
                  update((current) => ({
                    ...current,
                    identity: { ...current.identity, raceId: event.target.value, humanAbility: null },
                  }))
                }
              >
                <option value="">Select race</option>
                {DATA.races.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </label>
            {race?.id === "human" && (
              <label>
                Human Ability Bonus
                <select
                  value={character.identity.humanAbility || ""}
                  onChange={(event) =>
                    update((current) => ({
                      ...current,
                      identity: { ...current.identity, humanAbility: event.target.value },
                    }))
                  }
                >
                  <option value="">Choose ability</option>
                  {ABILITY_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {ABILITY_NAMES[key]}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {race && (
              <div className="pf-race-summary">
                <strong>{race.name}</strong> — Size: {race.size || "Medium"}, Speed:{" "}
                {race.speed?.land || 30} ft.
                {Object.keys(raceAbilityModifiers).length > 0 && (
                  <div>
                    Racial modifiers:{" "}
                    {Object.entries(raceAbilityModifiers)
                      .map(([key, value]) => `${ABILITY_NAMES[key]} ${value > 0 ? "+" : ""}${value}`)
                      .join(", ")}
                  </div>
                )}
              </div>
            )}
            {alternateTraits.length > 0 && (
              <div className="pf-alternate-traits">
                <h3>Alternate Racial Traits</h3>
                <p className="pf-prereq">
                  Source references only; mechanical replacements are not automated yet.
                </p>
                {alternateTraits.map((trait) => {
                  const traitKey = `${race.id}:${trait.name}`;
                  return (
                    <label key={traitKey} className="pf-feat">
                      <input
                        type="checkbox"
                        checked={character.identity.alternateRacialTraitIds?.includes(traitKey) || false}
                        onChange={(event) =>
                          update((current) => {
                            const selected = current.identity.alternateRacialTraitIds || [];
                            return {
                              ...current,
                              identity: {
                                ...current.identity,
                                alternateRacialTraitIds: event.target.checked
                                  ? [...selected, traitKey]
                                  : selected.filter((id) => id !== traitKey),
                              },
                            };
                          })
                        }
                      />
                      <span>
                        {trait.name}
                        {trait.pages?.length > 0 && (
                          <em className="pf-prereq"> (p. {trait.pages.join(", ")})</em>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          <section className="pf-card">
            <h2>Traits & Drawbacks</h2>
            <p className="pf-prereq">
              Select up to 2 traits. Taking one drawback grants a third trait.
              Benefits are shown for reference and are not applied automatically.
            </p>
            <label>
              Add trait
              <select
                value=""
                onChange={(event) => {
                  if (event.target.value) {
                    toggleTrait(event.target.value, "trait");
                  }
                }}
              >
                <option value="">Choose trait</option>
                {traits
                  .filter((trait) => trait.type === "trait")
                  .sort((left, right) =>
                    `${left.categoryGroup} ${left.name}`.localeCompare(
                      `${right.categoryGroup} ${right.name}`
                    )
                  )
                  .map((trait) => (
                    <option key={trait.id} value={trait.id}>
                      {trait.name} ({trait.categoryGroup})
                    </option>
                  ))}
              </select>
            </label>
            <div className="pf-trait-list">
              {selectedTraits.map((trait) => (
                <div key={trait.id} className="pf-trait-row">
                  <div>
                    <strong>{trait.name}</strong>{" "}
                    <em className="pf-prereq">
                      ({trait.categoryGroup}, {trait.sourceBook})
                    </em>
                    {trait.benefit && <div>{trait.benefit}</div>}
                  </div>
                  <button onClick={() => toggleTrait(trait.id, "trait")}>
                    Remove
                  </button>
                </div>
              ))}
              {selectedTraits.length === 0 && <div>No traits selected.</div>}
            </div>
            <label>
              Add drawback
              <select
                value=""
                onChange={(event) => {
                  if (event.target.value) {
                    toggleTrait(event.target.value, "drawback");
                  }
                }}
              >
                <option value="">Choose drawback</option>
                {traits
                  .filter((trait) => trait.type === "drawback")
                  .sort((left, right) => left.name.localeCompare(right.name))
                  .map((trait) => (
                    <option key={trait.id} value={trait.id}>
                      {trait.name}
                    </option>
                  ))}
              </select>
            </label>
            <div className="pf-trait-list">
              {selectedDrawbacks.map((trait) => (
                <div key={trait.id} className="pf-trait-row">
                  <div>
                    <strong>{trait.name}</strong>{" "}
                    <em className="pf-prereq">
                      (Drawback, {trait.sourceBook})
                    </em>
                    {trait.benefit && <div>{trait.benefit}</div>}
                  </div>
                  <button onClick={() => toggleTrait(trait.id, "drawback")}>
                    Remove
                  </button>
                </div>
              ))}
              {selectedDrawbacks.length === 0 && <div>No drawbacks selected.</div>}
            </div>
          </section>

          <section className="pf-card">
            <h2>Rules</h2>
            <label className="pf-toggle">
              <input
                type="checkbox"
                checked={character.rules.pointBuy.enabled}
                onChange={(event) =>
                  updateRules("pointBuy", {
                    ...character.rules.pointBuy,
                    enabled: event.target.checked,
                  })
                }
              />
              Use point buy
            </label>
            {character.rules.pointBuy.enabled && (
              <label>
                Point buy budget
                <input
                  type="number"
                  min="0"
                  value={character.rules.pointBuy.total}
                  onChange={(event) =>
                    updateRules("pointBuy", {
                      ...character.rules.pointBuy,
                      total: Number(event.target.value),
                    })
                  }
                />
              </label>
            )}
            {character.rules.pointBuy.enabled && (
              <div className={pointBuy.valid ? "pf-ok" : "pf-error"}>
                Points spent: {pointBuy.spent} / {character.rules.pointBuy.total}
                {!pointBuy.valid && (
                  <ul>
                    {pointBuy.errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <label className="pf-toggle">
              <input
                type="checkbox"
                checked={character.rules.armorAsDR}
                onChange={(event) => updateRules("armorAsDR", event.target.checked)}
              />
              Armor as Damage Reduction
            </label>
          </section>

          <section className="pf-card">
            <h2>Ability Scores</h2>
            <div className="pf-ability-grid">
              {ABILITY_KEYS.map((key) => {
                const base = character.abilities.base[key] || 10;
                const racial = raceAbilityModifiers[key] || 0;
                const level = character.abilities.levelIncreases[key] || 0;
                const total = base + racial + level;
                return (
                  <div key={key} className="pf-ability">
                    <label>
                      {ABILITY_NAMES[key]}
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={base}
                        onChange={(event) => updateAbility(key, event.target.value)}
                      />
                    </label>
                    <div className="pf-ability-total">
                      {total} ({abilityModifier(total) >= 0 ? "+" : ""}
                      {abilityModifier(total)})
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="pf-card">
            <h2>Classes</h2>
            <div className="pf-class-list">
              {character.classes.map((entry) => {
                const classData = getClass(entry.classId);
                if (!classData) return null;
                const classArchetypes = archetypes.filter((arch) => arch.classId === entry.classId);
                const selectedArchetype = classArchetypes.find(
                  (arch) => arch.id === entry.archetypeIds?.[0]
                );
                return (
                  <div key={entry.classId} className="pf-class-row">
                    <strong>{classData.name}</strong>
                    <div className="pf-class-level">
                      <span>Level</span>
                      <strong>{entry.level}</strong>
                    </div>
                    {classArchetypes.length > 0 && (
                      <label>
                        Archetype
                        <select
                          value={entry.archetypeIds?.[0] || ""}
                          onChange={(event) =>
                            updateClass(entry.classId, {
                              archetypeIds: event.target.value ? [event.target.value] : [],
                            })
                          }
                        >
                          <option value="">None</option>
                          {classArchetypes.map((arch) => (
                            <option key={arch.id} value={arch.id}>
                              {arch.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    {selectedArchetype && (
                      <details className="pf-archetype-summary">
                        <summary>
                          {selectedArchetype.name} features (
                          {selectedArchetype.features?.length || 0})
                        </summary>
                        <div className="pf-spell-list">
                          {(selectedArchetype.features || []).map(
                            (feature, index) => (
                              <div key={`${feature.name}-${index}`}>
                                <strong>{feature.name}</strong>
                                {feature.level ? ` (Level ${feature.level})` : ""}
                                {feature.replaces && (
                                  <em className="pf-prereq">
                                    {" "}
                                    replaces {feature.replaces}
                                  </em>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </details>
                    )}
                    <button onClick={() => removeClass(entry.classId)}>Remove</button>
                  </div>
                );
              })}
            </div>
            {classOptions.length > 0 && (
              <label>
                Add class
                <select
                  value=""
                  onChange={(event) => {
                    if (event.target.value) addClass(event.target.value);
                  }}
                >
                  <option value="">Select class</option>
                  {classOptions.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="pf-level-up">
              <strong>Total Level: {derived.totalLevel}</strong>
              {character.classes.length > 0 && (
                <button onClick={() => openLevelUp(character.classes[0]?.classId)}>
                  Level Up
                </button>
              )}
              {character.levelHistory?.length > 0 && (
                <button onClick={handleUndoLevel}>Undo Last Level</button>
              )}
            </div>
            {derived.totalLevel >= 20 && <div className="pf-notice">Maximum level reached.</div>}
          </section>

          <section className="pf-card">
            <h2>Skills</h2>
            <div
              className={
                derived.skills.spent > derived.skills.totalPoints
                  ? "pf-error"
                  : "pf-ok"
              }
            >
              Skill points spent: {derived.skills.spent} /{" "}
              {derived.skills.totalPoints}
            </div>
            <div className="pf-skill-grid">
              {skills.map((skill) => (
                <label key={skill.id} className="pf-skill">
                  {skill.name}
                  <input
                    type="number"
                    min="0"
                    max={derived.totalLevel}
                    value={character.skillRanks[skill.id] || 0}
                    onChange={(event) => updateSkillRank(skill.id, event.target.value)}
                  />
                  <span className="pf-skill-bonus">
                    {computeSkillBonus(character, skill.id) >= 0 ? "+" : ""}
                    {computeSkillBonus(character, skill.id)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="pf-card">
            <h2>Feats</h2>
            <label>
              Search feats
              <input
                value={featQuery}
                onChange={(event) => setFeatQuery(event.target.value)}
                placeholder="Filter by name or prerequisite"
              />
            </label>
            <div className="pf-feat-list">
              {feats
                .filter((feat) => {
                  const query = featQuery.trim().toLowerCase();
                  if (!query) return true;
                  return (
                    feat.name.toLowerCase().includes(query) ||
                    formatFeatPrerequisites(feat).toLowerCase().includes(query)
                  );
                })
                .map((feat) => {
                  const selected = character.featIds.includes(feat.id);
                  const prerequisites = formatFeatPrerequisites(feat);
                  const validationResult = validateFeatPrerequisites(character, feat.id, {
                    allowUnparsed: false,
                    archetypes,
                  });
                  const disabled = !selected && !validationResult.valid;
                  return (
                    <label key={feat.id} className="pf-feat" title={validationResult.errors.join(" ")}>
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={disabled}
                        onChange={() => toggleFeat(feat.id)}
                      />
                      <span>
                        {feat.name}
                        {prerequisites && (
                          <em className="pf-prereq"> ({prerequisites})</em>
                        )}
                        {selected && !validationResult.valid && (
                          <span className="pf-error">
                            {" "}
                            — {validationResult.errors.join(" ")}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
            </div>
          </section>

          <section className="pf-card">
            <h2>Equipment</h2>
            <div className="pf-equipment-grid">
              <div>
                <h3>Armor</h3>
                {armorItems.map((item) => (
                  <label key={item.id} className="pf-equipment">
                    <input
                      type="checkbox"
                      checked={character.equipment.includes(item.id)}
                      onChange={() => toggleEquipment(item.id)}
                    />
                    {item.name} (+{item.armor?.value || 0})
                  </label>
                ))}
              </div>
              <div>
                <h3>Shields</h3>
                {shieldItems.map((item) => (
                  <label key={item.id} className="pf-equipment">
                    <input
                      type="checkbox"
                      checked={character.equipment.includes(item.id)}
                      onChange={() => toggleEquipment(item.id)}
                    />
                    {item.name} (+{item.armor?.value || 0})
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="pf-card">
            <h2>Spells</h2>
            <label>
              Search spells
              <input
                value={spellQuery}
                onChange={(event) => setSpellQuery(event.target.value)}
                placeholder="Filter by spell name"
              />
            </label>
            {character.classes.length === 0 && (
              <p>Add a spellcasting class to manage spells.</p>
            )}
            {character.classes.map((entry) => {
              const classData = getClass(entry.classId);
              if (!classData?.casting) return null;
              const query = spellQuery.trim().toLowerCase();
              const classSpells = getSpellsForClass(spells, entry.classId)
                .filter(
                  (spell) =>
                    !query ||
                    spell.name.toLowerCase().includes(query) ||
                    spell.description?.toLowerCase().includes(query)
                )
                .sort(
                  (left, right) =>
                    (Number(left.classLevels?.[entry.classId]) || 0) -
                    (Number(right.classLevels?.[entry.classId]) || 0)
                );
              const known = character.spellcasting?.known?.[entry.classId] || [];
              const prepared = character.spellcasting?.prepared?.[entry.classId] || {};
              const usedSlots = character.spellcasting?.usedSlots?.[entry.classId] || {};
              const slotsInfo = computeSpellSlots(character, entry.classId);
              const isSpontaneous = classData.casting.type === "spontaneous";
              const levels = slotsInfo
                ? slotsInfo.slots
                    .map((base, level) => ({
                      level,
                      base,
                      bonus: slotsInfo.bonus[level] || 0,
                      total: base + (slotsInfo.bonus[level] || 0),
                    }))
                    .filter((slot) => slot.total > 0)
                : [];
              const casterLevel = computeCasterLevel(character, entry.classId);
              return (
                <div key={entry.classId} className="pf-spell-class">
                  <h3>
                    {classData.name} — caster level {casterLevel}, {classData.casting.type}
                  </h3>
                  {!slotsInfo && <div>No spell slots at this level.</div>}
                  {slotsInfo && (
                    <div className="pf-spell-slots">
                      {levels.map(({ level, base, bonus, total }) => {
                        const used = Number(usedSlots[level]) || 0;
                        return (
                          <div key={level} className="pf-spell-slot-row">
                            <strong>Level {level}</strong>
                            <span>
                              {base}
                              {bonus ? ` + ${bonus}` : ""} = {total}
                            </span>
                            <label>
                              Used
                              <input
                                type="number"
                                min="0"
                                max={total}
                                value={used}
                                onChange={(event) =>
                                  setUsedSlots(entry.classId, level, event.target.value)
                                }
                              />
                            </label>
                            <span className={used > total ? "pf-error" : "pf-ok"}>
                              Remaining {Math.max(0, total - used)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {isSpontaneous ? (
                    <div className="pf-spell-level">
                      <h4>Known Spells ({known.length})</h4>
                      <select
                        value=""
                        onChange={(event) => {
                          if (event.target.value) {
                            toggleKnownSpell(entry.classId, event.target.value);
                          }
                        }}
                      >
                        <option value="">Add known spell</option>
                        {classSpells.map((spell) => (
                          <option key={spell.id} value={spell.id}>
                            {spell.name} (Level {spell.classLevels?.[entry.classId]})
                          </option>
                        ))}
                      </select>
                      <div className="pf-spell-list">
                        {known.map((spellId) => {
                          const spell = spells.find((item) => item.id === spellId);
                          return (
                            <div key={spellId} className="pf-spell-row">
                              <span>
                                {spell?.name || spellId} (Level{" "}
                                {spell?.classLevels?.[entry.classId] ?? "?"})
                              </span>
                              <button
                                onClick={() => toggleKnownSpell(entry.classId, spellId)}
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                        {known.length === 0 && <div>No known spells selected.</div>}
                      </div>
                    </div>
                  ) : (
                    levels.map(({ level, total }) => {
                        const levelSpells = classSpells.filter(
                          (spell) =>
                            Number(spell.classLevels?.[entry.classId]) === level
                        );
                        const list = prepared[level] || [];
                        const isCantrip = level === 0;
                        return (
                          <div key={level} className="pf-spell-level">
                            <h4>
                              {isCantrip
                                ? "Cantrips/Orisons (unlimited)"
                                : `Level ${level} Prepared (${list.length}/${total})`}
                            </h4>
                            <select
                              value=""
                              onChange={(event) => {
                                if (event.target.value) {
                                  addPreparedSpell(
                                    entry.classId,
                                    level,
                                    event.target.value
                                  );
                                }
                              }}
                            >
                              <option value="">Prepare spell</option>
                              {levelSpells.map((spell) => (
                                <option key={spell.id} value={spell.id}>
                                  {spell.name}
                                </option>
                              ))}
                            </select>
                            <div className="pf-spell-list">
                              {list.map((spellId, index) => {
                                const spell = spells.find(
                                  (item) => item.id === spellId
                                );
                                return (
                                  <div
                                    key={`${spellId}-${index}`}
                                    className="pf-spell-row"
                                  >
                                    <span>
                                      {spell?.name || spellId}
                                      {spell && slotsInfo && (
                                        <em className="pf-prereq">
                                          {" "}
                                          DC{" "}
                                          {computeSpellSaveDC(
                                            character,
                                            spell,
                                            entry.classId
                                          )}
                                        </em>
                                      )}
                                    </span>
                                    <button
                                      onClick={() =>
                                        removePreparedSpell(entry.classId, level, index)
                                      }
                                    >
                                      Remove
                                    </button>
                                  </div>
                                );
                              })}
                              {list.length === 0 && <div>No spells prepared.</div>}
                            </div>
                          </div>
                        );
                      })
                  )}
                  <details>
                    <summary>All {classData.name} spells ({classSpells.length})</summary>
                    <div className="pf-spell-list">
                      {classSpells.slice(0, 200).map((spell) => (
                        <div key={spell.id} className="pf-spell">
                          <strong>{spell.name}</strong> (Level{" "}
                          {spell.classLevels?.[entry.classId]})
                          {slotsInfo && (
                            <span>
                              {" "}
                              — {spell.school || "school"} — DC{" "}
                              {computeSpellSaveDC(character, spell, entry.classId)}
                            </span>
                          )}
                        </div>
                      ))}
                      {classSpells.length > 200 && (
                        <div>Showing first 200. Refine the search.</div>
                      )}
                    </div>
                  </details>
                </div>
              );
            })}
          </section>
        </div>

        <aside className="pf-sheet">
          <h2>Character Sheet</h2>
          <div className="pf-sheet-section">
            <strong>{character.meta.name || "Unnamed"}</strong>
            <div>
              {race?.name || "No race"} —{" "}
              {character.classes.map((entry) => `${getClass(entry.classId)?.name} ${entry.level}`).join(" / ") ||
                "No classes"}
            </div>
          </div>
          {(selectedTraits.length > 0 || selectedDrawbacks.length > 0) && (
            <div className="pf-sheet-section">
              {selectedTraits.length > 0 && (
                <div>
                  Traits: {selectedTraits.map((trait) => trait.name).join(", ")}
                </div>
              )}
              {selectedDrawbacks.length > 0 && (
                <div>
                  Drawbacks:{" "}
                  {selectedDrawbacks.map((trait) => trait.name).join(", ")}
                </div>
              )}
            </div>
          )}
          <div className="pf-sheet-section">
            <div>Level: {derived.totalLevel}</div>
            <div>BAB: +{derived.bab}</div>
            <div>Fort: +{derived.saves.fort}</div>
            <div>Ref: +{derived.saves.ref}</div>
            <div>Will: +{derived.saves.will}</div>
            <div>HP: {derived.hp.total}</div>
          </div>
          <div className="pf-sheet-section">
            <div>AC: {derived.ac.ac}</div>
            <div>Touch: {derived.ac.touch}</div>
            <div>Flat-footed: {derived.ac.flatFooted}</div>
            {character.rules.armorAsDR && <div>DR: {derived.ac.dr}</div>}
          </div>
          <div className="pf-sheet-section">
            <div>Feats: {character.featIds.length}</div>
            <div>Skill ranks spent: {derived.skills.spent}</div>
          </div>
          {derived.classFeatures.length > 0 && (
            <div className="pf-sheet-section">
              <strong>Class Features</strong>
              {derived.classFeatures.map((entry) => (
                <details key={entry.classId}>
                  <summary>
                    {entry.className} {entry.level}
                    {entry.archetypes.length > 0
                      ? ` (${entry.archetypes.join(", ")})`
                      : ""}
                  </summary>
                  <div className="pf-prereq">
                    {entry.features.join(", ") || "No features."}
                  </div>
                </details>
              ))}
            </div>
          )}
          {derived.archetypeErrors.length > 0 && (
            <div className="pf-sheet-section pf-error">
              <strong>Archetype errors</strong>
              {derived.archetypeErrors.map((error) => (
                <div key={error}>{error}</div>
              ))}
            </div>
          )}
          {derived.featErrors.length > 0 && (
            <div className="pf-sheet-section pf-error">
              <strong>Feat errors</strong>
              {derived.featErrors.map((entry) => (
                <div key={entry.featId}>
                  {getFeat(entry.featId)?.name}: {entry.errors.join(", ")}
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {levelOpen && (
        <div className="pf-modal-backdrop" onClick={() => setLevelOpen(false)}>
          <div className="pf-modal" onClick={(event) => event.stopPropagation()}>
            <h2>Level Up to {nextLevel}</h2>
            <label>
              Class
              <select
                value={levelClassId}
                onChange={(event) => {
                  const nextClassId = event.target.value;
                  setLevelClassId(nextClassId);
                  setLevelArchetypeId(
                    character.classes.find(
                      (entry) => entry.classId === nextClassId
                    )?.archetypeIds?.[0] || ""
                  );
                }}
              >
                {classes.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                    {character.classes.some((c) => c.classId === entry.id)
                      ? ` (currently ${
                          character.classes.find((c) => c.classId === entry.id)?.level
                        })`
                      : " (new multiclass)"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Archetype
              <select
                value={levelArchetypeId}
                onChange={(event) => setLevelArchetypeId(event.target.value)}
              >
                <option value="">None</option>
                {archetypes
                  .filter((entry) => entry.classId === levelClassId)
                  .map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name}
                    </option>
                  ))}
              </select>
            </label>
            <p className="pf-prereq">
              Selecting an archetype replaces the listed class features. Check
              with your GM before changing an archetype after 1st level.
            </p>
            <p>
              HP will be rolled when you confirm. Level 1 is always maximum; a natural
              1 is rerolled once and the second result stands.
            </p>
            <h3>
              Skill Points:{" "}
              {Object.values(levelSkillRanks).reduce(
                (sum, value) => sum + (Number(value) || 0),
                0
              )}{" "}
              / {levelSkillPoints}
            </h3>
            <div className="pf-skill-grid">
              {skills.map((skill) => (
                <label key={skill.id} className="pf-skill">
                  {skill.name}
                  <input
                    type="number"
                    min="0"
                    max={Math.min(levelSkillPoints, nextLevel)}
                    value={levelSkillRanks[skill.id] || 0}
                    onChange={(event) =>
                      setLevelSkillRanks((current) => ({
                        ...current,
                        [skill.id]: Math.max(
                          0,
                          Math.min(
                            levelSkillPoints,
                            nextLevel,
                            Number(event.target.value) || 0
                          )
                        ),
                      }))
                    }
                  />
                </label>
              ))}
            </div>
            {levelAbilityRequired && (
              <label>
                Ability Score Increase
                <select
                  value={levelAbilityIncrease}
                  onChange={(event) => setLevelAbilityIncrease(event.target.value)}
                >
                  <option value="">Choose ability</option>
                  {ABILITY_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {ABILITY_NAMES[key]}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <details>
              <summary>Add a feat this level</summary>
              <div className="pf-feat-list">
                {feats.map((feat) => {
                  const selected = levelFeatIds.includes(feat.id);
                  const validationResult = validateFeatPrerequisites(character, feat.id, {
                    allowUnparsed: false,
                    archetypes,
                  });
                  return (
                    <label key={feat.id} className="pf-feat">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          setLevelFeatIds((current) =>
                            current.includes(feat.id)
                              ? current.filter((id) => id !== feat.id)
                              : [...current, feat.id]
                          )
                        }
                      />
                      <span>
                        {feat.name}
                        {!validationResult.valid && (
                          <em className="pf-prereq">
                            {" "}
                            ({validationResult.errors.join(", ")})
                          </em>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            </details>
            {levelError && <div className="pf-error">{levelError}</div>}
            <div className="pf-dialog-actions">
              <button onClick={handleConfirmLevelUp}>Confirm Level Up</button>
              <button onClick={() => setLevelOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loadOpen && (
        <div className="pf-modal-backdrop" onClick={() => setLoadOpen(false)}>
          <div className="pf-modal" onClick={(event) => event.stopPropagation()}>
            <h2>Saved Characters</h2>
            {loading && <div>Loading...</div>}
            <div className="pf-saved-list">
              {savedCharacters.map((entry) => (
                <div key={entry.id} className="pf-saved-row">
                  <strong>{entry.name}</strong>
                  <span>
                    {getRaceName(entry.race)} — {formatClassList(entry.classes)}{" "}
                    {entry.total_level ? `(Level ${entry.total_level})` : ""}
                  </span>
                  <button onClick={() => loadCharacter(entry.id)}>Load</button>
                  <button onClick={() => deleteCharacter(entry.id)}>Delete</button>
                </div>
              ))}
              {savedCharacters.length === 0 && <div>No saved characters.</div>}
            </div>
            <button onClick={() => setLoadOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pathfinder;
