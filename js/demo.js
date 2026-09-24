/**
 * Raid Loot Demo — client-side assign simulation for Intelligence guild.
 * Placeholder classic-style items. Weights and gear notes are demo data.
 */
(function () {
  "use strict";

  var RARITY_COST = { epic: 40, rare: 25, uncommon: 10 };

  // Demo loot: classic-feeling placeholder names (not real Blizzard item text)
  var LOOT = [
    {
      id: "shld-obs",
      name: "Obsidian Pauldrons of the Vanguard",
      slot: "Shoulders",
      rarity: "epic",
      cost: 40,
      weights: { Warrior: 1.0, Paladin: 0.85, DeathKnight: 0.9, Hunter: 0.2, Rogue: 0.15, Mage: 0.1, Priest: 0.1, Warlock: 0.1, Druid: 0.55, Shaman: 0.5 },
      note: "Plate threat / mitigation shoulders"
    },
    {
      id: "cape-ash",
      name: "Ashen Cloak of Silent Steps",
      slot: "Back",
      rarity: "epic",
      cost: 40,
      weights: { Rogue: 1.0, Hunter: 0.9, Warrior: 0.55, DeathKnight: 0.5, Druid: 0.7, Mage: 0.45, Warlock: 0.45, Priest: 0.2, Paladin: 0.4, Shaman: 0.55 },
      note: "Agility / crit cloak"
    },
    {
      id: "ring-arc",
      name: "Ring of Arcane Confluence",
      slot: "Finger",
      rarity: "epic",
      cost: 40,
      weights: { Mage: 1.0, Warlock: 0.95, Priest: 0.75, Druid: 0.7, Shaman: 0.65, Paladin: 0.5, Hunter: 0.25, Rogue: 0.15, Warrior: 0.1, DeathKnight: 0.1 },
      note: "Caster spellpower ring"
    },
    {
      id: "helm-fury",
      name: "Helm of Relentless Fury",
      slot: "Head",
      rarity: "epic",
      cost: 40,
      weights: { Warrior: 0.95, DeathKnight: 1.0, Paladin: 0.8, Hunter: 0.35, Rogue: 0.3, Druid: 0.5, Shaman: 0.4, Mage: 0.1, Priest: 0.1, Warlock: 0.1 },
      note: "Strength / hit plate helm"
    },
    {
      id: "boot-tide",
      name: "Tidecaller Sabatons",
      slot: "Feet",
      rarity: "rare",
      cost: 25,
      weights: { Shaman: 1.0, Hunter: 0.85, Warrior: 0.4, Paladin: 0.35, DeathKnight: 0.3, Rogue: 0.55, Druid: 0.6, Mage: 0.2, Priest: 0.25, Warlock: 0.2 },
      note: "Mail haste boots"
    },
    {
      id: "glv-silk",
      name: "Silkweave Gloves of Insight",
      slot: "Hands",
      rarity: "rare",
      cost: 25,
      weights: { Priest: 1.0, Mage: 0.9, Warlock: 0.85, Druid: 0.7, Shaman: 0.45, Paladin: 0.4, Hunter: 0.15, Rogue: 0.1, Warrior: 0.05, DeathKnight: 0.05 },
      note: "Cloth healing / intellect gloves"
    },
    {
      id: "belt-shadow",
      name: "Belt of Shadowed Intent",
      slot: "Waist",
      rarity: "epic",
      cost: 40,
      weights: { Rogue: 1.0, Hunter: 0.75, Warrior: 0.35, DeathKnight: 0.3, Druid: 0.65, Mage: 0.2, Warlock: 0.25, Priest: 0.15, Paladin: 0.25, Shaman: 0.4 },
      note: "Leather agility belt"
    },
    {
      id: "neck-valor",
      name: "Pendant of Shared Valor",
      slot: "Neck",
      rarity: "rare",
      cost: 25,
      weights: { Warrior: 0.8, Paladin: 0.85, DeathKnight: 0.8, Hunter: 0.7, Rogue: 0.65, Mage: 0.7, Priest: 0.75, Warlock: 0.7, Druid: 0.8, Shaman: 0.75 },
      note: "Hybrid stamina / secondary neck — broad use"
    }
  ];

  // Roster with points, class, main-spec slot notes, upgrade deltas (demo)
  var ROSTER = [
    { name: "Kaelith", class: "Mage", points: 180, mainSpec: true, gear: { Shoulders: { name: "Tier-ish Cloth", score: 40 }, Back: { name: "Quest Cloak", score: 18 }, Finger: { name: "Dungeon Ring", score: 28 }, Head: { name: "Crafted Cloth", score: 35 }, Feet: { name: "Mail? (wrong)", score: 12 }, Hands: { name: "Blue Gloves", score: 30 }, Waist: { name: "Leather belt", score: 22 }, Neck: { name: "Green Amulet", score: 15 } } },
    { name: "Vexara", class: "Warlock", points: 165, mainSpec: true, gear: { Shoulders: { name: "Raid Cloth", score: 55 }, Back: { name: "Caster Cloak", score: 42 }, Finger: { name: "Old Ring", score: 22 }, Head: { name: "Raid Helm", score: 50 }, Feet: { name: "Cloth Boots", score: 38 }, Hands: { name: "Quest Gloves", score: 20 }, Waist: { name: "Cloth Belt", score: 36 }, Neck: { name: "Dungeon Neck", score: 32 } } },
    { name: "Thornak", class: "Warrior", points: 210, mainSpec: true, gear: { Shoulders: { name: "Pre-raid Plate", score: 25 }, Back: { name: "Tank Cloak", score: 40 }, Finger: { name: "Hit Ring", score: 38 }, Head: { name: "Blue Helm", score: 28 }, Feet: { name: "Plate Boots", score: 45 }, Hands: { name: "Plate Gloves", score: 44 }, Waist: { name: "Plate Belt", score: 42 }, Neck: { name: "Stam Neck", score: 40 } } },
    { name: "Sylwen", class: "Priest", points: 155, mainSpec: true, gear: { Shoulders: { name: "Heal Shoulders", score: 48 }, Back: { name: "Spirit Cloak", score: 36 }, Finger: { name: "Heal Ring", score: 40 }, Head: { name: "Cloth Helm", score: 46 }, Feet: { name: "Cloth Boots", score: 40 }, Hands: { name: "Green Gloves", score: 14 }, Waist: { name: "Cloth Belt", score: 38 }, Neck: { name: "Spirit Neck", score: 35 } } },
    { name: "Draxen", class: "Rogue", points: 190, mainSpec: true, gear: { Shoulders: { name: "Leather Shldr", score: 44 }, Back: { name: "Green Cloak", score: 16 }, Finger: { name: "Agi Ring", score: 36 }, Head: { name: "Leather Helm", score: 42 }, Feet: { name: "Leather Boots", score: 40 }, Hands: { name: "Leather Glove", score: 41 }, Waist: { name: "Quest Belt", score: 19 }, Neck: { name: "Agi Neck", score: 34 } } },
    { name: "Mirael", class: "Hunter", points: 140, mainSpec: true, gear: { Shoulders: { name: "Mail Shldr", score: 38 }, Back: { name: "Agi Cloak", score: 34 }, Finger: { name: "Hit Ring", score: 30 }, Head: { name: "Mail Helm", score: 40 }, Feet: { name: "Quest Boots", score: 18 }, Hands: { name: "Mail Gloves", score: 36 }, Waist: { name: "Mail Belt", score: 35 }, Neck: { name: "Hit Neck", score: 28 } } },
    { name: "Oruun", class: "Shaman", points: 120, mainSpec: true, gear: { Shoulders: { name: "Mail Shldr", score: 36 }, Back: { name: "Caster Cloak", score: 32 }, Finger: { name: "SP Ring", score: 34 }, Head: { name: "Mail Helm", score: 38 }, Feet: { name: "Green Boots", score: 14 }, Hands: { name: "Mail Gloves", score: 33 }, Waist: { name: "Mail Belt", score: 34 }, Neck: { name: "SP Neck", score: 30 } } },
    { name: "Belric", class: "Paladin", points: 175, mainSpec: true, gear: { Shoulders: { name: "Plate Shldr", score: 42 }, Back: { name: "Tank Cloak", score: 38 }, Finger: { name: "Str Ring", score: 36 }, Head: { name: "Blue Helm", score: 30 }, Feet: { name: "Plate Boots", score: 40 }, Hands: { name: "Plate Gloves", score: 39 }, Waist: { name: "Plate Belt", score: 41 }, Neck: { name: "Stam Neck", score: 37 } } },
    { name: "Nyxara", class: "DeathKnight", points: 200, mainSpec: true, gear: { Shoulders: { name: "Plate Shldr", score: 46 }, Back: { name: "Str Cloak", score: 40 }, Finger: { name: "Str Ring", score: 38 }, Head: { name: "Quest Helm", score: 22 }, Feet: { name: "Plate Boots", score: 44 }, Hands: { name: "Plate Gloves", score: 43 }, Waist: { name: "Plate Belt", score: 45 }, Neck: { name: "Str Neck", score: 36 } } },
    { name: "Fenn", class: "Druid", points: 130, mainSpec: true, gear: { Shoulders: { name: "Leather Shldr", score: 34 }, Back: { name: "Caster Cloak", score: 30 }, Finger: { name: "SP Ring", score: 28 }, Head: { name: "Leather Helm", score: 36 }, Feet: { name: "Leather Boots", score: 32 }, Hands: { name: "Leather Glove", score: 31 }, Waist: { name: "Leather Belt", score: 33 }, Neck: { name: "SP Neck", score: 26 } } },
    // Side-spec sandbox: high points but side-spec use — should lose to main-spec longer use
    { name: "Kaelith-OS", class: "Mage", points: 220, mainSpec: false, displayAs: "Kaelith (off-spec)", gear: { Shoulders: { name: "OS Cloth", score: 20 }, Back: { name: "OS Cloak", score: 15 }, Finger: { name: "OS Ring", score: 12 }, Head: { name: "OS Helm", score: 18 }, Feet: { name: "OS Boots", score: 10 }, Hands: { name: "OS Gloves", score: 14 }, Waist: { name: "OS Belt", score: 16 }, Neck: { name: "OS Neck", score: 11 } } }
  ];

  // Item upgrade scores (demo: how good the drop is for a full upgrade)
  var ITEM_SCORE = {
    "shld-obs": 72,
    "cape-ash": 70,
    "ring-arc": 68,
    "helm-fury": 74,
    "boot-tide": 55,
    "glv-silk": 52,
    "belt-shadow": 66,
    "neck-valor": 48
  };

  var WEIGHT_THRESHOLD = 0.55; // best-weighted candidates
  var SIDE_SPEC_FACTOR = 0.55;
  var MICRO_THRESHOLD = 8; // delta below this is micro — heavily penalized

  var assigned = {};
  var running = false;

  function el(id) { return document.getElementById(id); }

  function rarityBadge(r) {
    if (r === "epic") return '<span class="badge badge-epic">Epic</span>';
    if (r === "rare") return '<span class="badge badge-rare">Rare</span>';
    return '<span class="badge badge-demo">' + r + '</span>';
  }

  function topWeights(weights, n) {
    return Object.keys(weights)
      .map(function (c) { return { c: c, w: weights[c] }; })
      .sort(function (a, b) { return b.w - a.w; })
      .slice(0, n || 4);
  }

  function renderLoot() {
    var grid = el("loot-grid");
    if (!grid) return;
    grid.innerHTML = LOOT.map(function (item) {
      var state = assigned[item.id] ? "assigned" : "pending";
      var winner = assigned[item.id];
      var chips = topWeights(item.weights, 5).map(function (t) {
        return '<span class="weight-chip' + (t.w >= WEIGHT_THRESHOLD ? " best" : "") + '">' +
          shortClass(t.c) + " " + t.w.toFixed(2) + "</span>";
      }).join("");
      return (
        '<article class="loot-item ' + state + '" data-id="' + item.id + '">' +
          "<h4>" + item.name + "</h4>" +
          '<div class="slot">' + item.slot + " · " + rarityBadge(item.rarity) +
            ' · <span class="mono">' + item.cost + " pts</span></div>" +
          '<div class="loot-meta"><span>' + item.note + "</span></div>" +
          '<div class="weights">' + chips + "</div>" +
          (winner
            ? '<p class="text-sm" style="margin-top:0.65rem;color:var(--success)">→ ' + winner.winnerLabel +
              " <span class=\"mono\">(Δ +" + winner.delta + ")</span></p>"
            : "") +
        "</article>"
      );
    }).join("");
  }

  function shortClass(c) {
    var map = { DeathKnight: "DK", Paladin: "Pal", Warrior: "War", Hunter: "Hunt", Rogue: "Rog", Mage: "Mage", Priest: "Pri", Warlock: "Lock", Druid: "Dru", Shaman: "Sha" };
    return map[c] || c;
  }

  function renderRoster() {
    var body = el("roster-body");
    if (!body) return;
    var mains = ROSTER.filter(function (m) { return m.mainSpec; });
    body.innerHTML = mains.map(function (m) {
      var sh = m.gear.Shoulders;
      var points = getLivePoints(m);
      return (
        "<tr>" +
          "<td><strong>" + m.name + "</strong></td>" +
          '<td><span class="class-tag">' + m.class + "</span></td>" +
          '<td class="mono">' + points + "</td>" +
          "<td class=\"text-sm muted\">" + sh.name + " <span class=\"mono\">(" + sh.score + ")</span></td>" +
        "</tr>"
      );
    }).join("");
  }

  function getLivePoints(member) {
    // Start from base; subtract costs of items they won in this demo run
    var pts = member.points;
    Object.keys(assigned).forEach(function (id) {
      if (assigned[id].memberKey === memberKey(member)) {
        pts -= assigned[id].cost;
      }
    });
    return pts;
  }

  function memberKey(m) {
    return m.displayAs || m.name;
  }

  function upgradeDelta(member, item) {
    var current = member.gear[item.slot];
    var curScore = current ? current.score : 0;
    var newScore = ITEM_SCORE[item.id] || 50;
    return Math.max(0, newScore - curScore);
  }

  function candidateScore(member, item) {
    var weight = item.weights[member.class] || 0;
    if (weight < WEIGHT_THRESHOLD) return null;

    var delta = upgradeDelta(member, item);
    var points = getLivePoints(member);
    var specFactor = member.mainSpec ? 1.0 : SIDE_SPEC_FACTOR;

    // Anti-micro: penalize tiny upgrades so the algorithm favors lasting roster gains
    var deltaFactor = delta < MICRO_THRESHOLD ? 0.25 : 1.0 + Math.min(delta, 60) / 40;

    // Composite: points matter, but weight + longest-use (delta) dominate winner pick among candidates
    var score = (points * 0.35 + weight * 100 * 0.35 + delta * 2.2 * 0.3) * specFactor * deltaFactor;
    return { score: score, weight: weight, delta: delta, points: points, specFactor: specFactor };
  }

  function pickWinner(item) {
    var best = null;
    var bestMeta = null;
    var runners = [];

    ROSTER.forEach(function (m) {
      var meta = candidateScore(m, item);
      if (!meta) return;
      runners.push({ member: m, meta: meta });
      if (!best || meta.score > bestMeta.score) {
        best = m;
        bestMeta = meta;
      }
    });

    runners.sort(function (a, b) { return b.meta.score - a.meta.score; });
    return { winner: best, meta: bestMeta, runners: runners.slice(0, 3) };
  }

  function whyText(item, pick) {
    var w = pick.winner;
    var m = pick.meta;
    var label = memberKey(w);
    var parts = [];
    parts.push(label + " (" + w.class + (w.mainSpec ? ", main spec" : ", side spec") + ")");
    parts.push("class weight " + m.weight.toFixed(2));
    if (m.delta >= MICRO_THRESHOLD) {
      parts.push("largest lasting upgrade Δ +" + m.delta + " on " + item.slot);
    } else {
      parts.push("note: micro Δ +" + m.delta + " — deprioritized by anti-micro rule");
    }
    if (!w.mainSpec) {
      parts.push("side-spec factor applied (" + SIDE_SPEC_FACTOR + ")");
    }
    if (pick.runners.length > 1) {
      var second = pick.runners[1];
      parts.push("edged " + memberKey(second.member) + " (Δ +" + second.meta.delta + ", " + second.meta.points + " pts)");
    }
    return parts.join(" · ");
  }

  function announce(item, pick) {
    var box = el("announcements");
    if (!box) return;
    var empty = el("announce-empty");
    if (empty) empty.remove();
    var w = pick.winner;
    var m = pick.meta;
    var before = m.points;
    var after = before - item.cost;
    var card = document.createElement("article");
    card.className = "announce-card";
    var deltaClass = m.delta >= MICRO_THRESHOLD ? "delta-big" : "delta-micro";
    card.innerHTML =
      '<div class="title">Assigned: ' + item.name + " → " + memberKey(w) + "</div>" +
      '<div class="why">' + whyText(item, pick) + "</div>" +
      '<div class="announce-stats">' +
        "<span>Points <strong class=\"mono\">" + before + " → " + after + "</strong></span>" +
        "<span>Cost <strong class=\"mono\">−" + item.cost + "</strong></span>" +
        "<span>Upgrade <strong class=\"mono " + deltaClass + "\">Δ +" + m.delta + "</strong></span>" +
        "<span>Weight <strong class=\"mono\">" + m.weight.toFixed(2) + "</strong></span>" +
      "</div>";
    box.insertBefore(card, box.firstChild);
  }

  function setStatus(text) {
    var s = el("demo-status");
    if (s) s.textContent = text;
  }

  function assignOne(item) {
    if (assigned[item.id]) return false;
    var pick = pickWinner(item);
    if (!pick.winner) {
      setStatus("No eligible candidate for " + item.name);
      return false;
    }
    assigned[item.id] = {
      memberKey: memberKey(pick.winner),
      winnerLabel: memberKey(pick.winner),
      cost: item.cost,
      delta: pick.meta.delta,
      before: pick.meta.points,
      after: pick.meta.points - item.cost
    };
    announce(item, pick);
    return true;
  }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  async function runAssign(sequential) {
    if (running) return;
    running = true;
    var btn = el("btn-run");
    var resetBtn = el("btn-reset");
    if (btn) btn.disabled = true;
    if (resetBtn) resetBtn.disabled = true;

    var remaining = LOOT.filter(function (i) { return !assigned[i.id]; });
    if (remaining.length === 0) {
      setStatus("All 8 items already assigned. Reset to run again.");
      running = false;
      if (btn) btn.disabled = false;
      if (resetBtn) resetBtn.disabled = false;
      return;
    }

    setStatus("Assigning " + remaining.length + " drops (~60s narrative pace in live raids; demo is faster)…");

    for (var i = 0; i < remaining.length; i++) {
      assignOne(remaining[i]);
      renderLoot();
      renderRoster();
      setStatus("Assigned " + (Object.keys(assigned).length) + " / " + LOOT.length + " — " + remaining[i].name);
      if (sequential) await sleep(450);
    }

    setStatus("Complete. " + LOOT.length + " items assigned. Review announcement cards — winners favor weight + lasting upgrade Δ, not micro-churn.");
    running = false;
    if (btn) btn.disabled = false;
    if (resetBtn) resetBtn.disabled = false;
  }

  function resetDemo() {
    if (running) return;
    assigned = {};
    var box = el("announcements");
    if (box) {
      box.innerHTML = '<p class="text-sm muted" id="announce-empty">No assigns yet. Hit <strong style="color:var(--text-muted)">Run assign</strong>.</p>';
    }
    renderLoot();
    renderRoster();
    setStatus("Ready. Press “Run assign” to resolve all demo drops.");
  }

  function init() {
    if (!el("loot-grid")) return;
    renderLoot();
    renderRoster();
    setStatus("Ready. Press “Run assign” to resolve all demo drops.");

    var btn = el("btn-run");
    var resetBtn = el("btn-reset");
    if (btn) btn.addEventListener("click", function () { runAssign(true); });
    if (resetBtn) resetBtn.addEventListener("click", resetDemo);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
