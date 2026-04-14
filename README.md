# Cyberpunk RED: Your New Best Friend — Foundry VTT Module

A Foundry VTT module that brings the **Your New Best Friend** DLC by R. Talsorian Games into the [Cyberpunk RED Core](https://foundryvtt.com/packages/cyberpunk-red-core) system. Includes all 8 cyberpets as ready-to-use actors, 7 new cyberware items, pet-keeping rules, adventure hooks, and automated special abilities with full dice rolling.

## Requirements

- **Foundry VTT** v12+
- **Cyberpunk RED Core** system v0.92.0+
- **Your New Best Friend** PDF (for the actual rules text — this module provides the mechanical implementation, not the copyrighted content)

## Installation

In Foundry, go to **Add-on Modules > Install Module** and paste this manifest URL:

```
https://raw.githubusercontent.com/VebjornNyvoll/best-friend-foundry/main/module.json
```

## What's Included

### Compendium Packs

All content is organized under a **"Your New Best Friend"** folder in the compendium sidebar.

| Pack                   | Type         | Entries | Description                                                         |
| ---------------------- | ------------ | ------- | ------------------------------------------------------------------- |
| Best Friend: Cyberpets | Actor        | 8       | Complete cyberpet actors with stats, skills, weapons, and cyberware |
| Best Friend: Cyberware | Item         | 7       | New cyberware items ready to install on any actor                   |
| Best Friend: Macros    | Macro        | 9       | One-click macros for every special ability                          |
| Best Friend: Journals  | JournalEntry | 3       | Pet-keeping rules, adventure hooks, Cyberbear martial art           |

---

### Cyberpets

Every cyberpet is a fully configured Mook/Lieutenant/Mini-Boss actor with embedded skills, weapons, cyberware, and armor. Import them from the compendium and they're ready to drop onto any scene.

| Cyberpet            | Level         | HP  | Cost     | Cyberware Slots | Special Abilities                                                  |
| ------------------- | ------------- | --- | -------- | --------------- | ------------------------------------------------------------------ |
| **Datarabbit**      | Mook          | 10  | 1,000eb  | 2               | Chipware storage in EMP-hardened cybereye, homing tracer           |
| **Forever Turtle**  | Hardened Mook | 15  | 2,000eb  | 2               | **Protection** (shell covers head), **Trauma Response Nanomatrix** |
| **Neon Newt**       | Hardened Mook | 20  | 2,000eb  | 1               | **Flamebreath**, **Acid Secretion**                                |
| **Obsidian Ocelot** | Hardened Lt.  | 40  | 4,000eb  | 3               | **Combat Awareness Rank 5**, FBC Chameleon Coating                 |
| **Cyberbear**       | Mini-Boss     | 55  | 20,000eb | 3               | **Recovery**, **Three-Arm Strike** (Cyberbear Martial Art)         |
| **Cyberboa**        | Hardened Lt.  | 40  | 4,000eb  | 3               | **Airhypo Vampyres** (injectable poison, 5 doses)                  |
| **Cyberrat**        | Mook          | 10  | 1,000eb  | 2               | **Venom Fangs/Claws** (DV13 resist or 1d6 direct HP damage)        |
| **Cyberwolf**       | Hardened Lt.  | 40  | 4,000eb  | 3               | **Combat Awareness Rank 3** (requires pack within 20m)             |

### Cyberware

Seven new cyberware items from the DLC, configured with correct install type, humanity loss, price, and slots.

| Item                       | Type                      | Cost    | Install  |
| -------------------------- | ------------------------- | ------- | -------- |
| Chipware Compartment       | Cybereye (3 option slots) | 100eb   | Clinic   |
| Combat Jaw                 | External Body (2 slots)   | 500eb   | Hospital |
| FBC Chameleon Coating      | External Body             | 1,000eb | Hospital |
| Flashbulb                  | Cyberarm (2 option slots) | 500eb   | Clinic   |
| Hardened Cybereye Casing   | Cybereye                  | 500eb   | Clinic   |
| Homing Tracer Cyberfinger  | Cyberfinger               | 500eb   | Mall     |
| Trauma Response Nanomatrix | Internal Body             | 1,000eb | Hospital |

---

## Ability Automation

Every special ability has a macro in the compendium. Select the cyberpet's token, then run the macro from the hotbar or compendium. Rolls use **CPR-compatible d10 mechanics** — critical successes (natural 10 = exploding die) and critical failures (natural 1 = subtracted die) are fully handled. All rolls trigger **3D dice** if Dice So Nice is installed.

### How to Use

1. Import the macros from **Best Friend: Macros** to your hotbar
2. Select the cyberpet token on the canvas
3. Target an enemy token (if the ability requires a target)
4. Click the macro

### Ability Reference

#### Flamebreath (Neon Newt)

- **Macro:** Flamebreath (Neon Newt)
- **Roll:** d10 + Combat Number 8 (attack), 1d6 (damage)
- **Effect:** Acts as a Flamethrower. Cannot be used two turns in a row — the macro enforces the cooldown automatically.

#### Acid Secretion (Neon Newt)

- **Macro:** Acid Secretion (Neon Newt)
- **Requires:** A targeted token
- **Roll:** d10 + Combat Number 5 (attack)
- **Effect:** On hit, reduces SP of all worn armor on the target by 1. The SP reduction is applied automatically to the target's armor items.

#### Venom Fangs/Claws (Cyberrat)

- **Macro:** Venom Fangs/Claws (Cyberrat)
- **Flow:** Two-stage. The macro posts a chat card, then the target clicks "Resist" to roll.
  1. Run the macro after a successful Cyberrat attack
  2. A chat card appears with a **Resist** button
  3. The target (or GM) clicks Resist to roll WILL + Resist Torture/Drugs vs DV13
  4. On failure: 1d6 damage is dealt directly to the target's HP (bypasses armor)

#### Airhypo Vampyres (Cyberboa)

- **Macro:** Airhypo Vampyres (Cyberboa)
- **Effect:** Tracks doses (max 5). Each use decrements the counter and posts an injection notice. The chat card includes a **Reload** button to refill doses. The actual drug/toxin effect is applied manually by the GM (since substances vary).

#### Recovery (Cyberbear)

- **Macro:** Recovery (Cyberbear)
- **Roll:** DEX + Martial Arts (Cyberbear) vs DV13
- **Effect:** If the Cyberbear needs to Get Up, a successful roll means it didn't cost an Action.

#### Three-Arm Strike (Cyberbear)

- **Macro:** Three-Arm Strike (Cyberbear)
- **Prerequisite:** Must have hit the same target with two Bear Claw attacks this turn (GM confirms)
- **Roll:** DEX + Martial Arts (Cyberbear) vs DV15
- **On success:** A chat card appears with four buttons — choose one:
  - **Grapple / End Grapple** the target
  - **Extra Attack** with Bear Claw or Combat Jaw (rolls attack + damage)
  - **Random Body Critical Injury** (rolls 2d6 on the table)
  - **Reduce Target Armor SP by 4** (applied automatically)
- **On failure:** The brain tumor causes 5 damage directly to the Cyberbear's HP. This is applied automatically.

#### Protection (Forever Turtle)

- **Macro:** Protection (Forever Turtle)
- **Effect:** Toggles the shell protection on/off.
  - **On:** The Hardened Shell's body SP extends to the head location (the armor item is actually updated). An Active Effect icon appears on the token. The turtle cannot be targeted by Aimed Shots.
  - **Off:** Head SP is restored to its original value and the Active Effect is removed.

#### Combat Awareness (Ocelot/Wolf)

- **Macro:** Combat Awareness (Ocelot/Wolf)
- **Obsidian Ocelot:** Always active at Rank 5 — the macro confirms this.
- **Cyberwolf:** Active at Rank 3 only when within 20m of another Cyberwolf. The macro checks all tokens on the canvas and reports how many allied Cyberwolves are in range.

#### Trauma Response Nanomatrix

- **Macro:** Trauma Response Nanomatrix
- **Effect:** Restores all Skinweave/Subdermal Armor on the actor to full SP. Usable once per day — the macro enforces this. The chat card includes a **Reset Daily Uses** button for the GM to clear the limit.

---

## Journal Entries

| Journal                      | Contents                                                                                                                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cyberpet Rules**           | Keeping (lifestyle costs, housing requirements), Training (Animal Handling DV checks), Cybering (Medtech requirements, Tech Upgrade rules, cross-species cyberware compatibility) |
| **Cyberpet Adventure Hooks** | Four adventure starters: It Came From the Sewers, Too Good to Be True, Head of Security, Critter Combat                                                                           |
| **Cyberbear Martial Art**    | Full rules text for Recovery and Three-Arm Strike special moves                                                                                                                   |

---

## For Developers

### Project Structure

```
best-friend-foundry/
  module.json                          # Foundry module manifest
  package.json                         # Node dependencies
  build.mjs                            # YAML -> LevelDB compiler
  scripts/
    main.mjs                           # Entry point: hook registration, API
    utils.mjs                          # CPR roll helpers, actor/flag utilities
    automation/
      flamebreath.mjs                  # Neon Newt
      acid-secretion.mjs               # Neon Newt
      venom-fangs.mjs                  # Cyberrat
      airhypo-vampyres.mjs             # Cyberboa
      cyberbear-martial.mjs            # Recovery + Three-Arm Strike
      protection.mjs                   # Forever Turtle
      combat-awareness.mjs             # Ocelot / Cyberwolf
      trauma-nanomatrix.mjs            # SP repair
    chat/
      chat-cards.mjs                   # Chat button listener routing
  templates/chat/
    ability-card.hbs                   # Generic ability chat card
    flamebreath-card.hbs               # Flamebreath attack card
    venom-card.hbs                     # Venom resist prompt
    martial-art-card.hbs               # Three-Arm Strike option picker
    protection-card.hbs                # Shell toggle card
  styles/
    cpred-best-friend.css              # Chat card styling (crit glow, DV bars)
  src/packs/                           # YAML source files (source of truth)
    cyberpets/                         # 8 actor YAML files
    cyberware/                         # 7 item YAML files
    journals/                          # 3 journal YAML files
    macros/                            # 9 macro YAML files
  packs/                               # Compiled LevelDB (built from src/packs)
  assets/icons/
    actors/                            # Cyberpet portrait art (.webp)
    items/                             # Cyberware item icons (.webp)
    tokens/                            # Top-down token art (.webp)
```

### Building

The compendium packs are compiled from YAML source files using the Foundry CLI:

```bash
npm install
npm run build         # Compile YAML -> LevelDB
npm run build:clean   # Clean + recompile
```

The build script also post-processes the compiled LevelDB to fix `_stats.compendiumSource` on all documents and embedded items.

### Roll System

The module implements CPR's d10 roll mechanics without importing system-internal classes (following the community module pattern):

- **`cprRoll()`** — Rolls 1d10 with critical handling. Natural 10 explodes (roll again, add). Natural 1 fumbles (roll again, subtract). Triggers 3D dice via `game.dice3d.showForRoll()` if Dice So Nice is installed.
- **`cprSkillCheck(actor, statKey, skillName)`** — Looks up the stat and skill from the actor's data, rolls with crits, returns the total.
- **`cprAttackRoll(combatNumber)`** — d10 with crits + flat combat number.
- **`cprDamageRoll(formula)`** — Straight damage roll (no crits per CPR rules). Also triggers 3D dice.

### Module API

Other modules/macros can call abilities programmatically:

```javascript
const mod = game.modules.get("cpred-best-friend");
await mod.api.flamebreath();
await mod.api.threeArmStrike();
await mod.api.protection();
// etc.
```

### Chat Card Interaction

Ability chat cards use `data-action` attributes on buttons. The `renderChatMessage` hook in `chat-cards.mjs` routes clicks to the correct handler. To add a new interactive ability:

1. Create an automation function in `scripts/automation/`
2. Register it in `main.mjs` (API) and `chat-cards.mjs` (button handler)
3. Use `data-action="cpred-bf-your-action"` on the template button

---

## Related links

- **Your New Best Friend** DLC Rulebook by [R. Talsorian Games](https://rtalsoriangames.com/wp-content/uploads/2024/10/RTG-CPR-DLC-YourNewBestFriend.pdf)
- **Cyberpunk RED Core** Foundry system by [The Project Red Team](https://gitlab.com/cyberpunk-red-team/fvtt-cyberpunk-red-core)

## License

This module is an unofficial, fan-made implementation. I give no guarantees for further development/support. Cyberpunk RED and all related content are trademarks of R. Talsorian Games.
