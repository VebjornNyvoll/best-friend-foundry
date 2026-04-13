const MODULE_ID = "cpred-best-friend";

import { onFlamebreath } from "../automation/flamebreath.mjs";
import { onAcidSecretion } from "../automation/acid-secretion.mjs";
import { onVenomFangs, onVenomResistRoll } from "../automation/venom-fangs.mjs";
import { onAirhypoVampyres, onAirhypoReload } from "../automation/airhypo-vampyres.mjs";
import { onRecovery, onThreeArmStrike, onThreeArmStrikeOption } from "../automation/cyberbear-martial.mjs";
import { onProtection } from "../automation/protection.mjs";
import { onCombatAwareness } from "../automation/combat-awareness.mjs";
import { onTraumaNanomatrix, onNanomatrixReset } from "../automation/trauma-nanomatrix.mjs";

/**
 * Handlers mapped by data-action attribute value.
 */
const ACTION_HANDLERS = {
  "cpred-bf-flamebreath": onFlamebreath,
  "cpred-bf-acid-secretion": onAcidSecretion,
  "cpred-bf-venom-fangs": onVenomFangs,
  "cpred-bf-venom-resist": onVenomResistRoll,
  "cpred-bf-airhypo": onAirhypoVampyres,
  "cpred-bf-airhypo-reload": onAirhypoReload,
  "cpred-bf-recovery": onRecovery,
  "cpred-bf-three-arm-strike": onThreeArmStrike,
  "cpred-bf-three-arm-option": onThreeArmStrikeOption,
  "cpred-bf-protection": onProtection,
  "cpred-bf-combat-awareness": onCombatAwareness,
  "cpred-bf-trauma-nanomatrix": onTraumaNanomatrix,
  "cpred-bf-nanomatrix-reset": onNanomatrixReset,
};

/**
 * Attach click listeners to chat card buttons.
 * Called from the renderChatMessage hook.
 * @param {ChatMessage} message
 * @param {jQuery} html
 */
export function handleChatButtons(message, html) {
  html.find(`button[data-action^="cpred-bf-"]`).on("click", async (event) => {
    event.preventDefault();
    const button = event.currentTarget;
    const action = button.dataset.action;
    const handler = ACTION_HANDLERS[action];

    if (!handler) {
      console.warn(`${MODULE_ID} | No handler for action: ${action}`);
      return;
    }

    // Disable button to prevent double-clicks
    button.disabled = true;

    try {
      await handler({
        message,
        button,
        actorId: button.dataset.actorId,
        tokenId: button.dataset.tokenId,
        targetId: button.dataset.targetId,
        option: button.dataset.option,
      });
    } catch (err) {
      console.error(`${MODULE_ID} | Error handling ${action}:`, err);
      ui.notifications.error(`Your New Best Friend: Error executing ${action}`);
    } finally {
      button.disabled = false;
    }
  });
}
