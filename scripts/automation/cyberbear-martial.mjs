import { getSelectedActor, getTargetedActor, rollDVCheck, rollDamage, sendAbilityCard } from "../utils.mjs";

/**
 * Cyberbear Martial Art: Recovery
 * When knocked prone, attempt DV13 Martial Arts to Get Up as a free action.
 * @param {object} [context] - Chat card button context
 */
export async function onRecovery(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();

  if (!actor) {
    ui.notifications.warn("Select a Cyberbear token first.");
    return;
  }

  // Cyberbear's Martial Arts (Cyberbear) skill base is 10
  // The roll is 1d10 + DEX + Martial Arts level
  const dex = actor.system?.stats?.dex?.value ?? 8;
  const martialSkill = actor.items.find(
    (i) => i.type === "skill" && i.name.toLowerCase().includes("martial arts")
  );
  const skillLevel = martialSkill?.system?.level ?? 0;

  // Use the skill base directly if available (Cyberbear has base 10)
  const statPlusSkill = martialSkill ? skillLevel + dex : 10;
  const roll = new Roll("1d10 + @base", { base: statPlusSkill });
  await roll.evaluate();

  const success = roll.total >= 13;

  await sendAbilityCard("ability-card.hbs", {
    actorName: actor.name,
    actorImg: actor.img,
    abilityName: game.i18n.localize("CPRED_BF.abilities.recovery"),
    description: game.i18n.localize("CPRED_BF.abilities.recovery.desc"),
    rollResult: roll.total,
    rollFormula: roll.result,
    dv: 13,
    success,
    result: success
      ? "Success! The Cyberbear Gets Up as a free action (no Action cost)."
      : "Failed. The Get Up action costs an Action as normal.",
  }, {
    speaker: ChatMessage.getSpeaker({ actor }),
  });
}

/**
 * Cyberbear Martial Art: Three-Arm Strike
 * After hitting the same target with two Bear Claw attacks, attempt DV15.
 * On success: choose one of four effects. On failure: 5 self-damage.
 * @param {object} [context] - Chat card button context
 */
export async function onThreeArmStrike(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();

  if (!actor) {
    ui.notifications.warn("Select a Cyberbear token first.");
    return;
  }

  const dex = actor.system?.stats?.dex?.value ?? 8;
  const martialSkill = actor.items.find(
    (i) => i.type === "skill" && i.name.toLowerCase().includes("martial arts")
  );
  const skillLevel = martialSkill?.system?.level ?? 0;
  const statPlusSkill = martialSkill ? skillLevel + dex : 10;

  const roll = new Roll("1d10 + @base", { base: statPlusSkill });
  await roll.evaluate();

  const success = roll.total >= 15;

  if (success) {
    // Show the four options
    await sendAbilityCard("martial-art-card.hbs", {
      actorName: actor.name,
      actorImg: actor.img,
      rollResult: roll.total,
      rollFormula: roll.result,
      dv: 15,
      success: true,
      actorId: actor.id,
      targetId: context.targetId ?? "",
    }, {
      speaker: ChatMessage.getSpeaker({ actor }),
    });
  } else {
    // Failure: 5 damage directly to Cyberbear's HP
    const currentHP = actor.system?.derivedStats?.hp?.value ?? 0;
    await actor.update({
      "system.derivedStats.hp.value": Math.max(0, currentHP - 5),
    });

    await sendAbilityCard("ability-card.hbs", {
      actorName: actor.name,
      actorImg: actor.img,
      abilityName: game.i18n.localize("CPRED_BF.abilities.threeArmStrike"),
      rollResult: roll.total,
      rollFormula: roll.result,
      dv: 15,
      success: false,
      result: game.i18n.localize("CPRED_BF.chat.threeArmStrike.fail"),
      selfDamage: 5,
    }, {
      speaker: ChatMessage.getSpeaker({ actor }),
    });
  }
}

/**
 * Handle a Three-Arm Strike option selection.
 * @param {object} context - Chat card button context with option
 */
export async function onThreeArmStrikeOption(context = {}) {
  const actor = context.actorId
    ? game.actors.get(context.actorId)
    : getSelectedActor();
  const target = context.targetId
    ? game.actors.get(context.targetId)
    : getTargetedActor();

  if (!actor) return;

  const option = context.option;
  let resultText = "";

  switch (option) {
    case "grapple":
      resultText = `${actor.name} grapples (or ends a grapple with) ${target?.name ?? "the target"}.`;
      break;

    case "extraAttack": {
      // Roll an additional Bear Claw or Combat Jaw attack
      const attackRoll = new Roll("1d10 + 16"); // Combat Number 16
      await attackRoll.evaluate();
      const { total: dmg } = await rollDamage("3d6");
      resultText = `${actor.name} attacks again! Attack: ${attackRoll.total} (${attackRoll.result}), Damage: ${dmg} (3d6)`;
      break;
    }

    case "criticalInjury": {
      // Roll on the Body Critical Injury table (2d6)
      const critRoll = new Roll("2d6");
      await critRoll.evaluate();
      resultText = `${target?.name ?? "Target"} suffers a random Body Critical Injury! Roll result: ${critRoll.total} (${critRoll.result}). See CP:R page 187.`;
      break;
    }

    case "reduceSP": {
      if (target) {
        for (const item of target.items) {
          if (item.type === "armor" && item.system?.isEquipped) {
            const updates = {};
            if (item.system.bodyLocation?.sp > 0) {
              updates["system.bodyLocation.sp"] = Math.max(0, item.system.bodyLocation.sp - 4);
            }
            if (item.system.headLocation?.sp > 0) {
              updates["system.headLocation.sp"] = Math.max(0, item.system.headLocation.sp - 4);
            }
            if (Object.keys(updates).length > 0) {
              await item.update(updates);
            }
          }
        }
      }
      resultText = `${target?.name ?? "Target"}'s worn armor SP reduced by 4!`;
      break;
    }

    default:
      resultText = "Unknown option.";
  }

  await ChatMessage.create({
    content: `<div class="cpred-bf-card">
      <div class="card-header">
        <img src="${actor.img}" />
        <h3>Three-Arm Strike</h3>
      </div>
      <div class="card-body">
        <p>${resultText}</p>
      </div>
    </div>`,
    speaker: ChatMessage.getSpeaker({ actor }),
  });
}
