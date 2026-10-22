# Pathfinder 1e Character Builder Plan

## Purpose

Add a Pathfinder 1e character builder webpage to the LAMP site. The page must support:

- Character creation using d20pfsrd rules.
- Account-tied save/load.
- Leveling up with multiclassing.
- A point buy toggle with a configurable point budget.
- A manual-entry mode when point buy is disabled.
- An Armor as Damage Reduction toggle.
- Full prepared/known/spontaneous spell tracking.
- Enforced feat prerequisites.
- Archetypes and alternate racial traits.

## Locked Decisions

### Sources

Include:

- Core Rulebook
- Advanced Player's Guide (APG)
- Ultimate Magic
- Ultimate Combat
- Ultimate Equipment
- Ultimate Campaign
- Ultimate Intrigue
- Ultimate Wilderness

"All Ultimate books" means the official Paizo Ultimate line. Exclude third-party "Ultimate" books such as Ultimate Psionics and Ultimate Spheres unless explicitly requested later.

### Included Features

- Archetypes for all included classes.
- Alternate racial traits.
- Traits and drawbacks from included books.
- Full prepared, known, and spontaneous spell tracking.
- Feat prerequisite enforcement as a hard block.
- Multiclassing.
- Point buy toggle and point budget field.
- Manual base ability score entry when point buy is off.
- Armor as Damage Reduction toggle.
- Level 1 hit die is always maximum.
- Later hit dice are rolled.
- A natural 1 on a level-up hit die is rerolled once. The second result stands even if it is also a 1.
- Existing `localStorage`-trusted login model.

### Excluded Features

- Favored class bonuses. Do not add UI or schema fields for them.
- Prestige classes. Defer to v2.
- Variant multiclassing. Defer to v2.

## v2 TODO

- Add prestige classes. Prerequisites must be hard-blocked like feats, not warn-only. Note: current sources (Foundry PF1 packs, jasontank JSON) contain no prestige class definitions, so a data source must be chosen/curated first.
- Add variant multiclassing.
- Revisit third-party Ultimate-line content only if explicitly requested.
- Keep favored class bonuses excluded unless requested later.

---

## Architecture

### Frontend

- React 19 + Vite.
- Page: `frontend/src/pages/pathfinder.jsx`.
- Components: `frontend/src/components/Pathfinder/`.
- Styles: `frontend/src/styles/Pathfinder.css`.
- Rules engine: `frontend/src/pathfinder/rules.js`.
- Data: `frontend/src/pathfinder/data/`.
- Routing: add `/pathfinder` in `frontend/src/App.jsx`.
- Navigation: add "Pathfinder 1e" to desktop and mobile menus in `frontend/src/components/NavBar/NavBar.jsx`.

Use `useReducer` and `useMemo`. Do not add a state-management library. Keep the derived character sheet visible beside the builder.

### Backend

- Flask backend is the single file `api/app.py`.
- Database is Neon PostgreSQL, not SQLite.
- Add a `PathfinderCharacter` model to `api/app.py`.
- Add Flask-Migrate migration files under `api/migrations/versions/`.
- Keep mutation endpoints form-encoded to match existing callers.
- Use JSON response bodies for reads.

### Data Source and Licensing

Use bundled, curated OGL data with d20pfsrd source links and OGL attribution. Do not scrape d20pfsrd at runtime. If an offline import or scrape step is used, commit the generated data and keep the scraper out of the runtime request path.

Only include content that is valid for the project's OGL use. Verify each source book's content status. Do not copy product-identity material.

---

## Data Layer

Create source-based modules under `frontend/src/pathfinder/data/`:

```text
data/
  core/
  apg/
  ultimateMagic/
  ultimateCombat/
  ultimateEquipment/
  ultimateCampaign/
  ultimateIntrigue/
  ultimateWilderness/
```

Use JavaScript modules rather than raw JSON to avoid import/export friction.

Every data entry must include:

```js
{
  id: "fighter",
  name: "Fighter",
  sourceBook: "core",
  sourceUrl: "https://www.d20pfsrd.com/...",
  // rule data
}
```

Stable IDs are required across books. Do not derive IDs from display names.

### Data Categories

- Races: ability modifiers, size, speed, base traits, alternate racial traits, languages.
- Classes: hit die, BAB progression, good saves, skill points, class skills, class features by level, alignment restrictions, starting wealth, spellcasting metadata, bonus feats.
- Archetypes: replaced feature IDs, replacement features by level, altered skills, altered spellcasting, bonus feats, restrictions.
- Skills: linked ability, class-skill applicability, armor check penalty applicability.
- Feats: prerequisite expression, benefits, source, bonus-feat eligibility.
- Equipment: armor and shield AC, max Dex, armor check penalty, DR conversion fields, weight, cost.
- Spells: class lists, level, school, casting time, components, range, duration, saving throw, spell resistance, source.
- Traits and drawbacks: type, effects, restrictions.
- Class spellcasting metadata: prepared/spontaneous/hybrid, casting ability, spells known progression, slots per day, cantrips/orisons, bonus spell rules, special spell sources.

Lazy-load spells, feats, equipment, and archetypes by source book/class where practical. A single eagerly loaded bundle will become large with all included books.

### Data Validator

Add a validator script that checks:

- Duplicate IDs.
- Missing prerequisite references.
- Missing class-feature references from archetypes.
- Missing spell references in class spell lists.
- Invalid source-book tags.
- Archetype replacements that target nonexistent features.
- Alternate racial traits that replace nonexistent base traits.
- Feat prerequisites that cannot be represented with the supported expression model.

Run the validator before building the UI against new data.

---

## Character Data Model

Store base choices only. Derive AC, DR, BAB, saves, HP, skills, spell slots, and DCs at runtime.

```js
{
  schemaVersion: 1,
  meta: {
    name,
    alignment,
    deity,
    age,
    gender,
    notes
  },
  rules: {
    pointBuy: { enabled: true, total: 15 },
    armorAsDR: false
  },
  sourceBooks: ["core", "apg", "ultimateMagic"],
  identity: {
    raceId,
    alternateRacialTraitIds: [],
    traitIds: [],
    drawbackIds: []
  },
  abilities: {
    base: {},
    racial: {},
    levelIncreases: {}
  },
  classes: [
    {
      classId,
      level,
      archetypeIds: []
    }
  ],
  levelHistory: [
    {
      classId,
      archetypeIds,
      hp: {
        die,
        firstRoll,
        reroll,
        final,
        conMod
      },
      skillRanks: {},
      featIds: [],
      abilityIncrease: null
    }
  ],
  skillRanks: {},
  featIds: [],
  equipment: [],
  spellcasting: {
    known: { classId: [spellId] },
    prepared: { classId: { spellLevel: [spellId] } },
    usedSlots: { classId: { spellLevel: 0 } }
  }
}
```

Remove `favoredClassBonuses` entirely. Do not display favored class bonus UI.

Add a `schemaVersion` migration function for older saves.

---

## Rules Engine

Create `frontend/src/pathfinder/rules.js` as pure functions.

### Resolution Pipeline

1. Resolve race and alternate racial traits.
2. Resolve classes, levels, and archetypes.
3. Apply archetype feature replacements.
4. Apply traits and drawbacks.
5. Apply ability score increases.
6. Compute BAB, saves, HP, AC, DR, skills, feats, and spells.

### Required Functions

- `abilityModifier(score)`
- `pointBuyCost(score)`
- `validatePointBuy(scores, total)`
- `resolveRacialTraits(raceId, alternateTraitIds)`
- `resolveClassFeatures(classes)`
- `resolveArchetypes(classes)`
- `computeBAB(classes)`
- `computeSaves(classes)`
- `computeHP(levelHistory)`
- `computeSkillRanks(levelHistory, intMod)`
- `computeSkillBonus(skill, character)`
- `computeAC(character)`
- `computeDR(character)`
- `validateMulticlass(character)`
- `validateFeatPrerequisites(character, featId)`
- `computeSpellSlots(character, classId)`
- `computeSpellSaveDC(character, spell)`
- `computeCasterLevel(character, classId)`
- `deriveCharacter(savedData)`
- `levelUp(character, classId, options)`
- `validateCharacter(character)`

### Point Buy

Use the Pathfinder 1e cost table from 7 to 18.

- Point buy on: enforce the selected budget and show points spent/remaining.
- Point buy off: hide the budget and allow manual base ability score entry.
- Apply racial modifiers after base scores.
- Apply level-based ability increases separately at levels 4, 8, 12, 16, and 20.
- Validate scores and budget with clear error messages.

### Hit Points

- Level 1 hit die is always maximum.
- Later levels roll the selected class hit die.
- A natural 1 is rerolled once. The second result stands even if it is also a 1.
- Store `firstRoll`, `reroll`, and `final`.
- Apply the Constitution modifier per level.
- Enforce a minimum of 1 HP per level.
- Recompute HP if Constitution changes.
- Use an injectable RNG so tests are deterministic.
- Prevent reroll abuse in the UI; the recorded result is final.

### Feat Prerequisites

Enforce prerequisites as a hard block. Do not allow an invalid feat selection.

Use a structured expression tree:

```js
{
  all: [
    { ability: "str", min: 13 },
    { bab: 1 },
    { feat: "power-attack" }
  ]
}
```

Support:

- `all`
- `any`
- `not`
- Ability score minimums.
- BAB minimums.
- Caster level minimums.
- Character level minimums.
- Skill rank minimums.
- Required feats.
- Required races.
- Required class features.
- Required proficiencies.
- Alignment requirements.

Class and archetype bonus feats may bypass prerequisites only where the rules explicitly allow it. Unsupported narrative prerequisites must produce a data-validation error or an explicit unresolved-prerequisite error. Do not silently allow them.

### Archetypes

- A class may have multiple archetypes only when they do not replace the same feature.
- Archetypes replace class features by stable feature ID.
- Validate conflicts between archetypes.
- Validate alternate racial traits against replaced base traits.
- Show replaced and gained features clearly in the UI.

### Multiclassing

- Total character level cannot exceed 20.
- Stack BAB, saves, HP, and skill points across classes.
- Class skills are cumulative across all classes.
- Skill ranks are selected per level based on the class taken at that level.
- Enforce class alignment restrictions.
- Display class breakdown, for example `Fighter 2 / Wizard 3`.
- Support "undo last level" if straightforward from `levelHistory`.
- Defer prestige classes and variant multiclassing.

### Armor as Damage Reduction

Use the Ultimate Combat Armor as Damage Reduction variant.

- Per-character toggle stored in `rules.armorAsDR`.
- Standard mode: AC includes armor bonus.
- DR mode: armor bonus becomes DR; shields still provide shield AC.
- Follow the selected variant for touch AC, flat-footed AC, and DR interaction.
- Display AC, touch AC, flat-footed AC, and DR so the toggle's effect is clear.
- Equipment data must support the conversion fields.

---

## Spell Management

Implement full prepared, known, and spontaneous tracking.

### Prepared Casters

- Choose spells available to the class.
- Prepare specific spells into specific slots.
- Track expended slots per spell level.
- Support multiple prepared copies of the same spell where allowed.

### Spontaneous Casters

- Choose spells known.
- Track slots used per spell level.
- Support cantrips/orisons and 0-level slots.

### Hybrid and Special Cases

Model special behavior through data flags, not hardcoded class names.

### Calculations

- Spells per day from class level, casting ability, and bonus spells.
- Spell save DCs.
- Caster level.
- Domain, school, bloodline, patron, mystery, and similar bonus spell sources.
- Bonus spells from high ability scores.
- Class-specific restrictions and exceptions from the included books.

Persist known spells, prepared spells, and used slots.

---

## Backend

Add to `api/app.py`:

```python
class PathfinderCharacter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    data = db.Column(JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
    )
```

### Endpoints

Follow the existing form-encoded mutation convention.

- `GET /api/pathfinder/characters?username=...`
  - Return character summaries for the username.
- `GET /api/pathfinder/characters/<id>?username=...`
  - Return the full character if it belongs to the username.
- `POST /api/pathfinder/characters`
  - Form fields: `username`, `name`, `data` (JSON string).
  - Create a character and return its id.
- `POST /api/pathfinder/characters/<id>`
  - Form fields: `username`, `name`, `data`.
  - Update the character if it belongs to the username.
- `POST /api/pathfinder/characters/<id>/delete`
  - Form field: `username`.
  - Delete the character if it belongs to the username.

### Backend Rules

- Validate that `username` is present.
- Validate that `data` parses as JSON.
- Enforce a 1 MB payload limit.
- Return 404 for missing or non-owned characters.
- Do not trust the client for rule validation. The backend stores the character document; the frontend rules engine derives stats.
- Always build a new dict or `copy.deepcopy` the existing `data` before assigning it back. SQLAlchemy JSON columns do not track in-place mutation.
- Keep server logging in the existing `print(..., file=sys.stderr)` style.
- Do not enable Flask debug mode.

### Migration

From `api/` with the venv active:

```powershell
flask db migrate -m "add pathfinder characters"
flask db upgrade
```

Inspect the generated migration before applying it.

### Authentication Note

The existing login model stores `loggedIn` and `username` in `localStorage`. Save/load endpoints will trust the submitted username, matching the existing RSS pattern. This is spoofable. Keep it for now. If real account security is added later, introduce signed session tokens and update all account-tied endpoints together.

---

## Frontend

### Page

`frontend/src/pages/pathfinder.jsx`

Responsibilities:

- Hold character state with `useReducer`.
- Run `deriveCharacter` in `useMemo`.
- Coordinate save/load with the backend.
- Show validation errors.
- Track unsaved changes.
- Warn before navigating away with unsaved changes.

### Components

Create under `frontend/src/components/Pathfinder/`:

- `BuilderStepper.jsx`
- `IdentityPanel.jsx`
- `RacePanel.jsx`
- `AbilityScorePanel.jsx`
- `ClassPanel.jsx`
- `ArchetypePanel.jsx`
- `SkillPanel.jsx`
- `FeatPanel.jsx`
- `EquipmentPanel.jsx`
- `SpellPanel.jsx`
- `LevelUpDialog.jsx`
- `CharacterSheetPreview.jsx`
- `SaveLoadDialog.jsx`

### Builder Steps

1. Identity and rules toggles.
2. Race and alternate racial traits.
3. Ability scores.
4. Classes, archetypes, and multiclassing.
5. Skills.
6. Feats with enforced prerequisites.
7. Equipment, including armor-as-DR fields.
8. Spells.
9. Review and level-up.
10. Save/load.

### Save/Load UI

- Save is enabled only when `localStorage.loggedIn === 'true'`.
- Logged-out users can build locally but see "Log in to save".
- Load dialog lists the user's characters with name, race, classes, total level, and updated date.
- Actions: load, overwrite save, save as new, delete with confirmation.
- On load, run schema migration and `validateCharacter` before rendering.
- Show clear errors for failed saves and non-owned characters.

### Routing and Navigation

- Add `<Route path="/pathfinder" element={<Pathfinder />} />` in `frontend/src/App.jsx`.
- Add "Pathfinder 1e" to both desktop and mobile menus in `frontend/src/components/NavBar/NavBar.jsx`.
- No Vercel routing change should be required. The top-level `/api` rewrite still routes API calls to the backend, and `/pathfinder` falls through to the frontend service SPA fallback.
- Verify a hard refresh on `/pathfinder` after deployment.

---

## Implementation Order

1. Build the data schema and validator.
2. Populate Core Rulebook data.
3. Populate APG data.
4. Populate Ultimate-line data.
5. Build the rules engine and deterministic HP tests.
6. Build the backend model, endpoints, and migration.
7. Build the page shell, stepper, and character sheet preview.
8. Implement ability scores, point buy, and manual entry.
9. Implement races and alternate racial traits.
10. Implement classes, archetypes, and multiclassing.
11. Implement skills and enforced feat prerequisites.
12. Implement equipment and Armor as DR.
13. Implement spell tracking.
14. Implement level-up and HP rolling.
15. Implement save/load/delete.
16. Add routing and navigation.
17. Run validation, lint, build, and manual acceptance tests.

---

## Verification

### Commands

From `frontend/`:

```powershell
npm run lint
npm run build
```

Backend, from `api/` with the venv active:

```powershell
flask db migrate
flask db upgrade
flask run
```

### Manual Acceptance Checks

- Create, save, refresh, and load a character while logged in.
- Confirm logged-out save is blocked with a clear message.
- Confirm point buy enforces the budget.
- Confirm point buy off allows manual base scores.
- Confirm level 1 HP is max.
- Confirm a level-up roll of 1 rerolls once and records the second result.
- Confirm a second 1 stands.
- Confirm HP updates when Constitution changes.
- Confirm Armor as DR changes AC, touch AC, flat-footed AC, and DR correctly.
- Confirm alternate racial traits replace the correct base traits.
- Confirm conflicting archetypes are rejected.
- Confirm archetypes replace the correct class features.
- Confirm multiclassing stacks BAB, saves, HP, and skills.
- Confirm total level cannot exceed 20.
- Confirm feat prerequisites are enforced.
- Confirm class/archetype bonus feats bypass prerequisites only where allowed.
- Confirm prepared casters can prepare and expend slots.
- Confirm spontaneous casters can select known spells and expend slots.
- Confirm spell DCs, caster level, and bonus spells are computed.
- Confirm another account cannot load or delete a character by guessing an id.
- Confirm hard refresh on `/pathfinder` works in production.

### Automated Tests

The repository currently has no test suite. Add pure rules tests if practical using Node's built-in test runner or Vitest. At minimum, add known-value tests for:

- Point buy costs and validation.
- Ability modifiers.
- BAB stacking.
- Save stacking.
- HP rolls, including the level-1 max and reroll-once behavior.
- Skill rank and skill bonus calculations.
- Feat prerequisite evaluation.
- Archetype feature replacement.
- Alternate racial trait replacement.
- Spell slot and bonus spell calculations.
- Armor as DR calculations.

---

## Repo Notes and Gotchas

- Git root is `LAMP/`, but the real project is in `LAMP/vite-project/`.
- `frontend/` is the React app. `api/` is the Flask backend.
- `LAMP/my-app/` and `LAMP/vite-project/src/` are stale leftovers. Ignore them.
- API calls use relative `/api/...` URLs. Vite proxies `/api` to `http://localhost:5000` in development.
- Most `/api/*` mutation endpoints read `request.form`, not JSON.
- The database is Postgres/Neon. Password hashing uses Postgres `pgcrypto`. Do not introduce SQLite.
- `Game.state_pieces` is a JSON column whose in-place mutations are not tracked. Apply the same rule to Pathfinder character JSON.
- There is no websocket/SSE infrastructure in this project. Do not invent real-time channels.
- Do not remove `vite-plugin-neon-new` from `vite.config.js`.
- Vercel deploys as Services from `vite-project/vercel.json`. The SPA fallback must remain inside the `my_frontend` service.
- Keep `frontend/.env` and `api/.env` values out of version control.
