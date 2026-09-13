// Maps the source data's (category, icon basename) pairs onto the two-level
// taxonomy. Rules are matched in order; a rule without `icons` is the fallback
// for its category. Icons are files served from /icons.

export type RootSlug = "location" | "item" | "enemy" | "npc";

export const ROOT_CATEGORIES: Record<
  RootSlug,
  { name: string; doneVerb: string; icon: string; sortOrder: number }
> = {
  location: {
    name: "Location",
    doneVerb: "discovered",
    icon: "marker-generic-10-building.png",
    sortOrder: 0,
  },
  item: {
    name: "Item",
    doneVerb: "collected",
    icon: "marker-generic-07-chest.png",
    sortOrder: 1,
  },
  enemy: {
    name: "Enemy",
    doneVerb: "defeated",
    icon: "marker-generic-02-skull.png",
    sortOrder: 2,
  },
  npc: { name: "NPC", doneVerb: "met", icon: "npc-small.png", sortOrder: 3 },
};

export interface Classification {
  root: RootSlug;
  subcategory: string;
  icon: string;
  // Per-marker icon override (named landmarks), stored on the marker itself.
  markerIcon?: string;
}

interface Rule {
  category: string;
  icons?: string[];
  root: RootSlug;
  subcategory: string;
  icon: string;
  markerIcons?: Record<string, string>;
}

const LANDMARK_ICONS: Record<string, string> = {
  "spirit-turtle": "marker-generic-04-animal.png",
  castlemourne: "location-castle-morne.png",
  castlesol: "location-castle-sol.png",
  redmanecastle: "location-redmane-castle.png",
  stormveilcastle: "location-stormveil-castle.png",
  shadedcastle: "location-shaded-castle.png",
  cariamanor: "location-caria-manor.png",
  volcanomanor: "location-volcano-manor.png",
  leyndell: "location-leyndell-royal-capital.png",
  rayalucaria: "location-academy-of-raya-lucaria.png",
  precipice: "location-ruin-strewn-precipice.png",
  giantforge: "location-forge-of-giants.png",
  "crumbling-faromazula": "location-crumbling-farum-azula.png",
  "subterranean-shunning-grounds": "location-subterranean-shunning-grounds.png",
  studyhall: "location-carian-study-hall.png",
  fourbelfries: "location-four-belfries.png",
};

const RULES: Rule[] = [
  {
    category: "Site of Grace",
    root: "location",
    subcategory: "Site of Grace",
    icon: "location-site-of-grace.png",
  },
  {
    category: "Summoning Pool",
    root: "location",
    subcategory: "Summoning Pool",
    icon: "mp-status-coop-medium.png",
  },
  {
    category: "Spiritsprings",
    root: "location",
    subcategory: "Spiritspring",
    icon: "misc-glow-radial.png",
  },
  {
    category: "Waygates",
    root: "location",
    subcategory: "Waygate",
    icon: "location-gate.png",
  },
  {
    category: "Locations",
    icons: ["ruins", "cityruins"],
    root: "location",
    subcategory: "Ruins",
    icon: "location-ruins.png",
  },
  {
    category: "Locations",
    icons: ["church", "cathedral"],
    root: "location",
    subcategory: "Church",
    icon: "location-church.png",
    markerIcons: { cathedral: "UNKNOWN-location-cathedral.png" },
  },
  {
    category: "Locations",
    icons: ["cave"],
    root: "location",
    subcategory: "Cave",
    icon: "location-cave.png",
  },
  {
    category: "Locations",
    icons: ["catacomb"],
    root: "location",
    subcategory: "Catacombs",
    icon: "location-catacombs.png",
  },
  {
    category: "Locations",
    icons: ["herosgrave"],
    root: "location",
    subcategory: "Hero's Grave",
    icon: "location-heros-grave.png",
  },
  {
    category: "Locations",
    icons: ["tunnel"],
    root: "location",
    subcategory: "Tunnel",
    icon: "location-tunnel.png",
  },
  {
    category: "Locations",
    icons: ["evergaol"],
    root: "location",
    subcategory: "Evergaol",
    icon: "location-evergaol.png",
  },
  {
    category: "Locations",
    icons: ["shack"],
    root: "location",
    subcategory: "Shack",
    icon: "location-shack.png",
  },
  {
    category: "Locations",
    icons: ["fieldtower"],
    root: "location",
    subcategory: "Lookout Tower",
    icon: "location-lookout-tower.png",
  },
  {
    category: "Locations",
    icons: ["tower"],
    root: "location",
    subcategory: "Rise",
    icon: "location-rise-mage-tower.png",
  },
  {
    category: "Locations",
    icons: ["divinetower"],
    root: "location",
    subcategory: "Divine Tower",
    icon: "location-divine-tower.png",
  },
  {
    category: "Locations",
    icons: ["tree"],
    root: "location",
    subcategory: "Minor Erdtree",
    icon: "location-minor-erdtree.png",
  },
  {
    category: "Locations",
    icons: ["forthaight"],
    root: "location",
    subcategory: "Fort",
    icon: "location-fort.png",
  },
  {
    category: "Locations",
    icons: ["well"],
    root: "location",
    subcategory: "Well",
    icon: "location-well.png",
  },
  {
    category: "Locations",
    icons: ["walking-mausoleum"],
    root: "location",
    subcategory: "Walking Mausoleum",
    icon: "marker-generic-10-building.png",
  },
  {
    category: "Locations",
    icons: ["wagon"],
    root: "location",
    subcategory: "Caravan",
    icon: "marker-generic-07-chest.png",
  },
  {
    category: "Locations",
    icons: [
      "town",
      "sunkentown",
      "dominula",
      "sellia",
      "ordina",
      "frenziedflamevillage",
      "windmill",
    ],
    root: "location",
    subcategory: "Town",
    icon: "UNKNOWN-location-village.png",
    markerIcons: {
      dominula: "location-dominula-windmill-village.png",
      sellia: "location-sellia-town-of-sorcery.png",
      ordina: "location-ordina-liturgical-town.png",
      frenziedflamevillage: "location-frenzied-flame-village.png",
      windmill: "location-windmill-pasture.png",
    },
  },
  {
    category: "Locations",
    icons: ["stormgate", "guardians"],
    root: "location",
    subcategory: "Gate",
    icon: "location-gate.png",
  },
  {
    category: "Locations",
    icons: Object.keys(LANDMARK_ICONS),
    root: "location",
    subcategory: "Landmark",
    icon: "marker-generic-10-building.png",
    markerIcons: LANDMARK_ICONS,
  },
  {
    category: "Locations",
    root: "location",
    subcategory: "Landmark",
    icon: "marker-generic-10-building.png",
  },
  {
    category: "Weapons",
    root: "item",
    subcategory: "Weapon",
    icon: "marker-generic-01-sword.png",
  },
  {
    category: "Shields",
    root: "item",
    subcategory: "Shield",
    icon: "marker-generic-06-diamond.png",
  },
  {
    category: "Armor",
    root: "item",
    subcategory: "Armor",
    icon: "marker-generic-07-chest.png",
  },
  {
    category: "Talismans",
    root: "item",
    subcategory: "Talisman",
    icon: "marker-generic-06-diamond.png",
  },
  {
    category: "Spells",
    root: "item",
    subcategory: "Spell",
    icon: "misc-glow-radial.png",
  },
  {
    category: "Ashes of War",
    root: "item",
    subcategory: "Ash of War",
    icon: "marker-generic-01-sword.png",
  },
  {
    category: "Spirit Ashes",
    root: "item",
    subcategory: "Spirit Ash",
    icon: "marker-generic-04-animal.png",
  },
  {
    category: "Consumables",
    root: "item",
    subcategory: "Consumable",
    icon: "marker-generic-05-plant.png",
  },
  {
    category: "Materials",
    icons: ["consumable"],
    root: "item",
    subcategory: "Consumable",
    icon: "marker-generic-05-plant.png",
  },
  {
    category: "Materials",
    root: "item",
    subcategory: "Crafting Material",
    icon: "marker-generic-05-plant.png",
  },
  {
    category: "Upgrade Materials",
    icons: ["crafting"],
    root: "item",
    subcategory: "Crafting Material",
    icon: "marker-generic-05-plant.png",
  },
  {
    category: "Upgrade Materials",
    root: "item",
    subcategory: "Upgrade Material",
    icon: "marker-generic-06-diamond.png",
  },
  {
    category: "Key",
    icons: ["cookbook"],
    root: "item",
    subcategory: "Cookbook",
    icon: "marker-generic-07-chest.png",
  },
  {
    category: "Key",
    root: "item",
    subcategory: "Key Item",
    icon: "marker-quest-normal.png",
  },
  {
    category: "Flask Upgrades",
    root: "item",
    subcategory: "Flask Upgrade",
    icon: "marker-generic-05-plant.png",
  },
  {
    category: "Remembrance",
    root: "item",
    subcategory: "Remembrance",
    icon: "marker-quest-focus.png",
  },
  {
    category: "Maps",
    root: "item",
    subcategory: "Map Fragment",
    icon: "map-compass.png",
  },
  {
    category: "Bosses",
    icons: ["miniboss"],
    root: "enemy",
    subcategory: "Field Boss",
    icon: "marker-generic-02-skull.png",
  },
  {
    category: "Bosses",
    root: "enemy",
    subcategory: "Boss",
    icon: "marker-generic-02-skull.png",
  },
  {
    category: "NPC Invader",
    root: "enemy",
    subcategory: "Invader",
    icon: "character-invader-base.png",
  },
  {
    category: "NPC",
    icons: ["merchant"],
    root: "npc",
    subcategory: "Merchant",
    icon: "UNKNOWN-figure-hooded-npc.png",
  },
  { category: "NPC", root: "npc", subcategory: "NPC", icon: "npc-small.png" },
];

export function classify(sourceCategory: string, icon: string): Classification {
  for (const rule of RULES) {
    if (rule.category !== sourceCategory) continue;
    if (rule.icons && !rule.icons.includes(icon)) continue;
    const markerIcon = rule.markerIcons?.[icon];
    return markerIcon
      ? {
          root: rule.root,
          subcategory: rule.subcategory,
          icon: rule.icon,
          markerIcon,
        }
      : { root: rule.root, subcategory: rule.subcategory, icon: rule.icon };
  }
  // Unknown source category: keep it as an Item subcategory named after itself.
  return {
    root: "item",
    subcategory: sourceCategory,
    icon: ROOT_CATEGORIES.item.icon,
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
