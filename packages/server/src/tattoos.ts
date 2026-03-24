// --- Tattoo Port Definitions ---

export type Port = "moti_aro" | "te_onui" | "ngakanu";
export type Attribute = "INT" | "DEX" | "STR";

export type TattooEntry = {
  tattoo_name: string;
  trade_id: string;
  description: string;
};

export type PortDefinition = {
  port: Port;
  label: string;
  attribute: Attribute;
  tattoos: TattooEntry[];
};

export const PORTS: Record<Port, PortDefinition> = {
  moti_aro: {
    port: "moti_aro",
    label: "Moti Aro",
    attribute: "INT",
    tattoos: [
      { tattoo_name: "Tattoo of the Arohongui Shaman", trade_id: "tattoo-of-the-arohongui-shaman", description: "5% increased Effect of Herald Buffs on you" },
      { tattoo_name: "Tattoo of the Arohongui Warmonger", trade_id: "tattoo-of-the-arohongui-warmonger", description: "5% chance to Freeze" },
      { tattoo_name: "Tattoo of the Hinekora Deathwarden", trade_id: "tattoo-of-the-hinekora-deathwarden", description: "6% reduced Effect of Curses on you" },
      { tattoo_name: "Tattoo of the Hinekora Shaman", trade_id: "tattoo-of-the-hinekora-shaman", description: "8% increased Mana Regeneration Rate" },
      { tattoo_name: "Tattoo of the Hinekora Storyteller", trade_id: "tattoo-of-the-hinekora-storyteller", description: "+3% to Chaos Resistance" },
      { tattoo_name: "Tattoo of the Hinekora Warmonger", trade_id: "tattoo-of-the-hinekora-warmonger", description: "Minions have 5% increased maximum Life" },
      { tattoo_name: "Tattoo of the Hinekora Warrior", trade_id: "tattoo-of-the-hinekora-warrior", description: "3% increased maximum Energy Shield" },
      { tattoo_name: "Tattoo of the Kitava Heart Eater", trade_id: "tattoo-of-the-kitava-heart-eater", description: "Killing Blows have 4% chance to Consume corpses to recover 10% of Maximum Life" },
      { tattoo_name: "Tattoo of the Rongokurai Turtle", trade_id: "tattoo-of-the-rongokurai-turtle", description: "You take 5% reduced Extra Damage from Critical Strikes" },
      { tattoo_name: "Tattoo of the Tasalio Shaman", trade_id: "tattoo-of-the-tasalio-shaman", description: "5% chance to Hinder Enemies on Hit with Spells" },
      { tattoo_name: "Tattoo of the Tawhoa Shaman", trade_id: "tattoo-of-the-tawhoa-shaman", description: "5% chance to Poison on Hit" },
      { tattoo_name: "Tattoo of the Tawhoa Warrior", trade_id: "tattoo-of-the-tawhoa-warrior", description: "5% increased Chaos Damage" },
      { tattoo_name: "Tattoo of the Valako Scout", trade_id: "tattoo-of-the-valako-scout", description: "10% reduced Effect of Shock on you" },
      { tattoo_name: "Tattoo of the Valako Shaman", trade_id: "tattoo-of-the-valako-shaman", description: "5% chance to Shock" },
      { tattoo_name: "Tattoo of the Valako Stormrider", trade_id: "tattoo-of-the-valako-stormrider", description: "+6% to Lightning Resistance" },
      { tattoo_name: "Tattoo of the Valako Warrior", trade_id: "tattoo-of-the-valako-warrior", description: "5% increased Lightning Damage" },
    ],
  },
  te_onui: {
    port: "te_onui",
    label: "Te Onui",
    attribute: "DEX",
    tattoos: [
      { tattoo_name: "Tattoo of the Arohongui Moonwarden", trade_id: "tattoo-of-the-arohongui-moonwarden", description: "+6% to Cold Resistance" },
      { tattoo_name: "Tattoo of the Arohongui Scout", trade_id: "tattoo-of-the-arohongui-scout", description: "10% chance to Avoid being Chilled or Frozen" },
      { tattoo_name: "Tattoo of the Arohongui Warrior", trade_id: "tattoo-of-the-arohongui-warrior", description: "5% increased Cold Damage" },
      { tattoo_name: "Tattoo of the Ramako Archer", trade_id: "tattoo-of-the-ramako-archer", description: "5% increased Global Accuracy Rating" },
      { tattoo_name: "Tattoo of the Ramako Fleetfoot", trade_id: "tattoo-of-the-ramako-fleetfoot", description: "2% increased Movement Speed" },
      { tattoo_name: "Tattoo of the Ramako Scout", trade_id: "tattoo-of-the-ramako-scout", description: "6% increased Evasion Rating" },
      { tattoo_name: "Tattoo of the Ramako Shaman", trade_id: "tattoo-of-the-ramako-shaman", description: "+2% chance to Suppress Spell Damage" },
      { tattoo_name: "Tattoo of the Ramako Sniper", trade_id: "tattoo-of-the-ramako-sniper", description: "5% increased Projectile Speed" },
      { tattoo_name: "Tattoo of the Tasalio Scout", trade_id: "tattoo-of-the-tasalio-scout", description: "4% increased Effect of your Marks" },
      { tattoo_name: "Tattoo of the Tasalio Tideshifter", trade_id: "tattoo-of-the-tasalio-tideshifter", description: "10% chance to Avoid being Stunned" },
      { tattoo_name: "Tattoo of the Tasalio Warrior", trade_id: "tattoo-of-the-tasalio-warrior", description: "5% chance to Blind Enemies on Hit with Attacks" },
      { tattoo_name: "Tattoo of the Tawhoa Herbalist", trade_id: "tattoo-of-the-tawhoa-herbalist", description: "4% increased Flask Effect Duration" },
      { tattoo_name: "Tattoo of the Tawhoa Naturalist", trade_id: "tattoo-of-the-tawhoa-naturalist", description: "8% increased Life Recovery from Flasks" },
      { tattoo_name: "Tattoo of the Tawhoa Scout", trade_id: "tattoo-of-the-tawhoa-scout", description: "10% chance to Avoid being Poisoned" },
    ],
  },
  ngakanu: {
    port: "ngakanu",
    label: "Ngakanu",
    attribute: "STR",
    tattoos: [
      { tattoo_name: "Tattoo of the Kitava Blood Drinker", trade_id: "tattoo-of-the-kitava-blood-drinker", description: "0.5% of Attack Damage Leeched as Life" },
      { tattoo_name: "Tattoo of the Kitava Rebel", trade_id: "tattoo-of-the-kitava-rebel", description: "10% chance to Avoid Bleeding" },
      { tattoo_name: "Tattoo of the Kitava Shaman", trade_id: "tattoo-of-the-kitava-shaman", description: "Attacks have 5% chance to cause Bleeding" },
      { tattoo_name: "Tattoo of the Kitava Warrior", trade_id: "tattoo-of-the-kitava-warrior", description: "5% increased Global Physical Damage" },
      { tattoo_name: "Tattoo of the Ngamahu Firewalker", trade_id: "tattoo-of-the-ngamahu-firewalker", description: "+6% to Fire Resistance" },
      { tattoo_name: "Tattoo of the Ngamahu Shaman", trade_id: "tattoo-of-the-ngamahu-shaman", description: "10% reduced Ignite Duration on you" },
      { tattoo_name: "Tattoo of the Ngamahu Warmonger", trade_id: "tattoo-of-the-ngamahu-warmonger", description: "5% chance to Ignite" },
      { tattoo_name: "Tattoo of the Ngamahu Warrior", trade_id: "tattoo-of-the-ngamahu-warrior", description: "5% increased Fire Damage" },
      { tattoo_name: "Tattoo of the Ngamahu Woodcarver", trade_id: "tattoo-of-the-ngamahu-woodcarver", description: "5% increased Totem Life" },
      { tattoo_name: "Tattoo of the Rongokurai Brute", trade_id: "tattoo-of-the-rongokurai-brute", description: "10% increased Stun Threshold" },
      { tattoo_name: "Tattoo of the Rongokurai Goliath", trade_id: "tattoo-of-the-rongokurai-goliath", description: "10% increased Stun Duration on Enemies" },
      { tattoo_name: "Tattoo of the Rongokurai Guard", trade_id: "tattoo-of-the-rongokurai-guard", description: "Guard Skills have 6% increased Duration" },
      { tattoo_name: "Tattoo of the Rongokurai Warrior", trade_id: "tattoo-of-the-rongokurai-warrior", description: "6% increased Armour" },
      { tattoo_name: "Tattoo of the Tasalio Bladedancer", trade_id: "tattoo-of-the-tasalio-bladedancer", description: "Attacks have 5% chance to Maim on Hit" },
      { tattoo_name: "Tattoo of the Tukohama Brawler", trade_id: "tattoo-of-the-tukohama-brawler", description: "10% chance to Knock Enemies Back on hit" },
      { tattoo_name: "Tattoo of the Tukohama Shaman", trade_id: "tattoo-of-the-tukohama-shaman", description: "Regenerate 0.3% of Life per second" },
      { tattoo_name: "Tattoo of the Tukohama Warcaller", trade_id: "tattoo-of-the-tukohama-warcaller", description: "8% increased Warcry Cooldown Recovery Rate" },
      { tattoo_name: "Tattoo of the Tukohama Warmonger", trade_id: "tattoo-of-the-tukohama-warmonger", description: "5% increased Melee Damage" },
      { tattoo_name: "Tattoo of the Tukohama Warrior", trade_id: "tattoo-of-the-tukohama-warrior", description: "Melee Hits which Stun have 5% chance to Fortify" },
      { tattoo_name: "Tattoo of the Valako Shieldbearer", trade_id: "tattoo-of-the-valako-shieldbearer", description: "+1% Chance to Block Attack Damage" },
    ],
  },
};
