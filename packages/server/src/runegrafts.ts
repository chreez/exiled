// --- Runegraft Port Definitions ---

export type RunegraftPort = "riben_fell" | "pondium" | "kalguur";
export type Attribute = "INT" | "DEX" | "STR";

export type RunegraftEntry = {
  runegraft_name: string;
  trade_id: string;
  description: string;
};

export type RunegraftPortDefinition = {
  port: RunegraftPort;
  label: string;
  attribute: Attribute;
  runegrafts: RunegraftEntry[];
};

const SHARED_RUNEGRAFTS: RunegraftEntry[] = [
  { runegraft_name: "Runegraft of the Fortress", trade_id: "runegraft-of-the-fortress", description: "10% reduced Attributes; 40% increased Global Defences" },
  { runegraft_name: "Runegraft of Gemcraft", trade_id: "runegraft-of-gemcraft", description: "+1 to Level of all non-Exceptional Support Gems" },
];

export const RUNEGRAFT_PORTS: Record<RunegraftPort, RunegraftPortDefinition> = {
  riben_fell: {
    port: "riben_fell",
    label: "Riben Fell",
    attribute: "DEX",
    runegrafts: [
      { runegraft_name: "Runegraft of the Sinistral", trade_id: "runegraft-of-the-sinistral", description: "10% more Attack Speed with Off Hand" },
      { runegraft_name: "Runegraft of the Bound", trade_id: "runegraft-of-the-bound", description: "20% increased bonuses gained from Equipped Gloves; 20% reduced bonuses gained from Equipped Boots" },
      { runegraft_name: "Runegraft of Refraction", trade_id: "runegraft-of-refraction", description: "Fire at most 1 Projectile; Projectiles Fork; Projectiles Chain an additional time" },
      { runegraft_name: "Runegraft of the Imbued", trade_id: "runegraft-of-the-imbued", description: "Tinctures applied to you have 30% increased Effect while affected by no Flasks" },
      { runegraft_name: "Runegraft of the Agile", trade_id: "runegraft-of-the-agile", description: "Elusive's Effect on you is increased instead for the first 2 seconds" },
      { runegraft_name: "Runegraft of Suffering", trade_id: "runegraft-of-suffering", description: "50% increased Damage with Damaging Ailments you inflict while you are affected by the same Ailment" },
      { runegraft_name: "Runegraft of Quaffing", trade_id: "runegraft-of-quaffing", description: "Non-instant Mana Recovery from Flasks is also Recovered as Life; 25% reduced Mana Recovery from Flasks" },
      { runegraft_name: "Runegraft of Rotblood", trade_id: "runegraft-of-rotblood", description: "Enemies Poisoned by you have 10% of Physical Damage they deal converted to Chaos" },
      ...SHARED_RUNEGRAFTS,
    ],
  },
  pondium: {
    port: "pondium",
    label: "Pondium",
    attribute: "INT",
    runegrafts: [
      { runegraft_name: "Runegraft of Connection", trade_id: "runegraft-of-connection", description: "Link Skills have 50% increased range" },
      { runegraft_name: "Runegraft of Resurgence", trade_id: "runegraft-of-resurgence", description: "Arcane Surge also grants 15% increased Life Regeneration Rate to you" },
      { runegraft_name: "Runegraft of the Spellbound", trade_id: "runegraft-of-the-spellbound", description: "Spells have Added Spell Damage equal to 30% of Physical Damage of your Equipped Two Handed Weapon" },
      { runegraft_name: "Runegraft of the Novamark", trade_id: "runegraft-of-the-novamark", description: "Nova Spells Cast at a Marked target instead of around you if possible" },
      { runegraft_name: "Runegraft of the Witchmark", trade_id: "runegraft-of-the-witchmark", description: "Spells Cost +8% of Life; Spells deal added Chaos Damage equal to 2% of your maximum Life" },
      { runegraft_name: "Runegraft of Loyalty", trade_id: "runegraft-of-loyalty", description: "40% chance for Elemental Ailments inflicted on you to be inflicted on a nearby Minion instead" },
      { runegraft_name: "Runegraft of Treachery", trade_id: "runegraft-of-treachery", description: "Auras from your Skills which affect Allies also affect Enemies; 15% increased Reservation Efficiency of Skills" },
      { runegraft_name: "Runegraft of Time", trade_id: "runegraft-of-time", description: "20% chance for Skills to not consume a Cooldown on use" },
      { runegraft_name: "Runegraft of Blasphemy", trade_id: "runegraft-of-blasphemy", description: "30% chance to Curse non-Cursed Enemies with a random Hex on Hit" },
      { runegraft_name: "Runegraft of the Warp", trade_id: "runegraft-of-the-warp", description: "Debuffs on you expire 30% faster; Buffs on you expire 30% slower" },
      ...SHARED_RUNEGRAFTS,
    ],
  },
  kalguur: {
    port: "kalguur",
    label: "Kalguur",
    attribute: "STR",
    runegrafts: [
      { runegraft_name: "Runegraft of the River", trade_id: "runegraft-of-the-river", description: "20% chance on reaching Low Life to recover to Full Life" },
      { runegraft_name: "Runegraft of the Combatant", trade_id: "runegraft-of-the-combatant", description: "50% increased Attack Damage against Enemies with a higher percentage of their Life remaining than you" },
      { runegraft_name: "Runegraft of the Soulwick", trade_id: "runegraft-of-the-soulwick", description: "Gain 1 Vaal Soul per second" },
      { runegraft_name: "Runegraft of Restitching", trade_id: "runegraft-of-restitching", description: "40% of Damage taken from Critical Strikes Recouped as Life" },
      { runegraft_name: "Runegraft of Bellows", trade_id: "runegraft-of-bellows", description: "100% increased Warcry Speed if you have not Warcried Recently" },
      { runegraft_name: "Runegraft of the Jeweller", trade_id: "runegraft-of-the-jeweller", description: "10% increased Damage for each unlinked Socket in Equipped Two Handed Weapon" },
      { runegraft_name: "Runegraft of Stability", trade_id: "runegraft-of-stability", description: "Your Lucky or Unlucky effects are instead Unexciting" },
      { runegraft_name: "Runegraft of Consecration", trade_id: "runegraft-of-consecration", description: "Consecrated Ground you create grants 30% increased Mana Regeneration Rate to you and Allies" },
      { runegraft_name: "Runegraft of Fury", trade_id: "runegraft-of-fury", description: "Gain 3 Rage when you use a Life Flask" },
      { runegraft_name: "Runegraft of Rallying", trade_id: "runegraft-of-rallying", description: "Gain 1 Fortification per 5 Valour consumed to place a Banner" },
      ...SHARED_RUNEGRAFTS,
    ],
  },
};
