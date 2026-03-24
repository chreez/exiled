# Tattoo Port Selector — Requirements Document
**Project:** Kingsmarch Shipping Optimizer (Phase 1 — Tattoo Strategy)  
**Status:** Draft  
**Version:** 1.0

---

## 1. Purpose

This tool helps a Path of Exile player determine which tattoo port to send a shipment to right now, based on current market prices. The output is a ranked comparison of the three tattoo ports by expected average chaos value per tattoo received.

---

## 2. Game Mechanic Context (Sacred — Do Not Skip)

This section is mandatory background. The tool cannot be built correctly without understanding these mechanics.

### 2.1 Kingsmarch Shipping Overview

Kingsmarch is a passive resource management system in Path of Exile (introduced in Settlers of Kalguur, 3.25; core as of 3.28 Mirage league). The player loads a ship with resources and sends it to a port. The port returns rewards based on what was shipped.

**In 3.28 specifically:**
- **Ores and bars** → return **currency items**
- **Crops** → return **equipment**

This is a full swap from pre-3.28 behaviour. Any guide or knowledge referencing the old system (crops for currency) is obsolete.

### 2.2 The Six Ports

There are six ports, split into two categories:

| Port | Category | Reward Type |
|---|---|---|
| Riben Fell | Kalguuran | DEX Runegrafts |
| Pondium | Kalguuran | INT Runegrafts |
| Kalguur | Kalguuran | STR Runegrafts |
| Moti Aro | Karui | INT Tattoos |
| Te Onui | Karui | DEX Tattoos |
| Ngakanu | Karui | STR Tattoos |

**This tool covers the three Karui ports only (Phase 1).**

### 2.3 Favoured Resources (Port Quotas)

Each port maintains a live list of requested resources (its "quota"). Shipping resources that match the quota applies a multiplier of +20% to +100% (in 10% increments) to both the shipment value contribution and effective quantity of matching resources. Completing a quota also awards a bonus unique item.

- Quotas can be **rerolled for 15,000 Gold**
- The 50,000,000 shipment value cap applies **before** quota multiplier
- Dust does **not** count toward quota

### 2.4 Shipment Value

Shipment value is the primary scoring mechanism. It determines the quantity and rarity of rewards returned.

**Ore and Bar values (per unit):**

| Resource | Ore Value | Bar Value |
|---|---|---|
| Crimson Iron | 4 | 16 |
| Orichalcum | 5 | 22 |
| Petrified Amber | 7 | 30 |
| Bismuth | 12 | 50 |
| Verisium | 22 | 90 |

Bars count **5× toward Port Quota** but have their own separate shipment value (not simply 5× ore).

**Crop values (per unit):**

| Crop | Value |
|---|---|
| Wheat | 12 |
| Corn | 15 |
| Pumpkin | 18 |
| Orgourd | 21 |
| Blue Zanthimum | 24 |

**Hard caps:**
- Minimum shipment value to send: 50,000
- Maximum shipment value: 50,000,000
- Maximum currency items returned: 800 (drops to 500 if only one resource type is sent — always send 2+ types)

### 2.5 Thaumaturgic Dust

Dust is a wildcard resource that inflates shipment value. It is obtained by disenchanting items and from Mirage league ore-hourglass encounters (which can yield 100,000+ dust in a single map).

**Dust math (authoritative — from OP u/EnriadHodor):**

Starting from a base shipment value of X (non-dust resources only):
- Adding up to X dust adds value at a **1:1 ratio** (doubling effective value)
- Beyond X dust, returns diminish following a logarithmic/square root curve

**Practical rule:** Match dust 1:1 to your bar/ore value. Half the target shipment value should be bars/ore, half dust. Dust beyond the matching amount returns diminishing value.

**Critical constraint:** Dust does **not** count toward Port Quotas and does **not** affect the number or rarity of Tattoos or Runegrafts received. Dust only inflates currency rewards.

### 2.6 Tattoo Mechanics (Core to Phase 1)

- **1 tattoo returned per 100,000 non-dust shipment value**
- Dust value is entirely excluded from this calculation
- Hard cap: **39 tattoos per shipment** (reached at 3,900,000 non-dust value)
- No benefit to sending more than 3,900,000 non-dust value to a tattoo port if the goal is maximising tattoo count
- Which specific tattoo drops appears to be random within the pool available at that port (equal weight assumed — unconfirmed by GGG)
- Port choice (Moti Aro / Te Onui / Ngakanu) determines the attribute class (INT / DEX / STR) of all tattoos returned

### 2.7 Runegraft Mechanics (Phase 2 — noted for future)

- **1 runegraft per 400,000 non-dust shipment value**
- Same dust exclusion rule applies
- Port determines attribute class (Kalguuran ports only)

### 2.8 Risk

Shipment risk scales with value vs total crew rank. A full crew of rank-5 workers reduces risk to 0% at most ports. **Kalguur and Moti Aro have a hardcoded minimum 10% risk regardless of crew.** Crew members can be permanently killed on a failed shipment. Ships can also be commandeered by pirates mid-voyage regardless of risk %.

### 2.9 Currency Port Bias

As of 3.28, **no port has a bias toward specific currency types.** Port choice is irrelevant for currency shipments — only total shipment value matters.

---

## 3. Scope — Phase 1

**In scope:**
- Tattoo port comparison (Moti Aro, Te Onui, Ngakanu)
- Price data contract (API integration point)
- Expected value calculation per port
- Ranked display with full tattoo list and individual prices

**Out of scope (future phases):**
- Runegraft ports (Riben Fell, Pondium, Kalguur)
- Shipment value optimiser / dust calculator
- 50m currency shipment optimiser
- Port quota reroll advisor

---

## 4. Data Model

### 4.1 Static Data — Tattoo Pool Per Port

The tattoo pool for each port must be fully enumerated as static data in the application. This is the cheatsheet foundation. Each entry:

```
{
  port: "moti_aro" | "te_onui" | "ngakanu",
  attribute: "INT" | "DEX" | "STR",
  tattoo_name: string,       // exact in-game name
  trade_id: string           // identifier used by price API
}
```

**Note:** The specific tattoos available at each port must be researched and populated before the tool is functional. The wiki link provided by OP (u/EnriadHodor) is the authoritative source: https://www.poewiki.net/wiki/Kingsmarch#Table_of_rewards

### 4.2 Price Data — API Contract

The tool consumes a price feed. The integration point must accept the following interface:

**Input:** list of `trade_id` strings  
**Output:** per trade_id — `{ chaos_value: number | null, divine_value: number | null }`  
**Also required:** current divine:chaos ratio as a separate field

A `null` price means the item has no recent trade data. The tool must handle nulls explicitly (see section 6.2).

---

## 5. Calculation Logic

For each port:

1. Fetch prices for all tattoos in that port's pool
2. Exclude tattoos with `null` prices from the average calculation (flag them separately — see 6.2)
3. **Average chaos value per tattoo** = sum of all non-null chaos prices ÷ count of non-null tattoos
4. **Average divine value per tattoo** = average chaos value ÷ current divine:chaos ratio
5. Rank ports by average chaos value descending

**Assumption:** All tattoos in a port's pool have equal drop probability. This is unconfirmed. The tool should surface this assumption visibly to the user.

---

## 6. Outputs

### 6.1 Primary View — Port Ranking

Three port cards, ranked by average chaos value per tattoo (highest first). Each card shows:

- Port name
- Attribute class (INT / DEX / STR)
- Average chaos per tattoo
- Average divine per tattoo
- Full tattoo list with individual chaos prices

### 6.2 Null Price Handling

Tattoos with no price data must be displayed in the tattoo list labelled **"negligible"** rather than hidden. They are excluded from the average calculation but must remain visible so the user knows the average may be understated.

### 6.3 Assumption Disclosure

The interface must display a visible notice: *"Drop weights assumed equal across all tattoos in pool. Actual distribution unconfirmed."*

---

## 7. Open Questions

| # | Question | Impact |
|---|---|---|
| 1 | Are tattoo drop weights truly equal within a port's pool? | If no, average calculation is wrong |
| 2 | Is the 1 tattoo per 100k value rate confirmed for 3.28 specifically? | Affects whether shipment value input is needed |
| 3 | Does fulfilling a Port Quota affect tattoo count or type? | Could add a quota-aware calculation path |

---

## 8. Out of Scope Decisions Logged

- Shipment value is **not** a user input in Phase 1. The tool assumes the player is sending the maximum effective tattoo shipment (3,900,000 non-dust value = 39 tattoos cap). The exact composition of that shipment is the player's responsibility.
- No recommendation engine — the tool surfaces data and the player makes the call.
- No historical price tracking in Phase 1.