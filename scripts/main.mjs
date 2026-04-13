const MODULE_ID = "cpred-best-friend";

// Import automation modules
import { onFlamebreath } from "./automation/flamebreath.mjs";
import { onAcidSecretion } from "./automation/acid-secretion.mjs";
import { onVenomFangs } from "./automation/venom-fangs.mjs";
import { onAirhypoVampyres } from "./automation/airhypo-vampyres.mjs";
import { onRecovery, onThreeArmStrike, onThreeArmStrikeOption } from "./automation/cyberbear-martial.mjs";
import { onProtection } from "./automation/protection.mjs";
import { onCombatAwareness } from "./automation/combat-awareness.mjs";
import { onTraumaNanomatrix, onNanomatrixReset } from "./automation/trauma-nanomatrix.mjs";
import { handleChatButtons } from "./chat/chat-cards.mjs";

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initializing Your New Best Friend`);

  // Load Handlebars templates
  loadTemplates([
    `modules/${MODULE_ID}/templates/chat/ability-card.hbs`,
    `modules/${MODULE_ID}/templates/chat/flamebreath-card.hbs`,
    `modules/${MODULE_ID}/templates/chat/venom-card.hbs`,
    `modules/${MODULE_ID}/templates/chat/martial-art-card.hbs`,
    `modules/${MODULE_ID}/templates/chat/protection-card.hbs`,
  ]);

  // Register module API on the module object
  const mod = game.modules.get(MODULE_ID);
  if (mod) {
    mod.api = {
      flamebreath: onFlamebreath,
      acidSecretion: onAcidSecretion,
      venomFangs: onVenomFangs,
      airhypoVampyres: onAirhypoVampyres,
      recovery: onRecovery,
      threeArmStrike: onThreeArmStrike,
      threeArmStrikeOption: onThreeArmStrikeOption,
      protection: onProtection,
      combatAwareness: onCombatAwareness,
      traumaNanomatrix: onTraumaNanomatrix,
      nanomatrixReset: onNanomatrixReset,
    };
  }
});

Hooks.once("ready", () => {
  console.log(`${MODULE_ID} | Your New Best Friend is ready`);
});

// Handle interactive chat card buttons
Hooks.on("renderChatMessage", (message, html) => {
  handleChatButtons(message, html);
});
