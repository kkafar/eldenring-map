export type ItemCategory = {
  id: string,
  name: string,
  loadDefault: boolean,
  image?: string
}

export type MarkerDescriptionRaw = {
  id: number,
  category: string,
  name: string,
  image: string,
  imageSize: number,
  pageLink?: string,
  x: string,
  y: string,
  hasLabel: boolean,
  hasPageLink: boolean,
  hasCoordsLink: boolean,
  clickable: boolean,
  description: string,
};

export type MarkerDescription = Omit<MarkerDescriptionRaw, 'x' | 'y'> & {
  x: number,
  y: number,
}

export type CategoryId =
  'Armor' |
  'AshesOfWar' |
  'Bosses' |
  'Consumables' |
  'FlaskUpgrades' |
  'Key' |
  'Locations' |
  'Maps' |
  'Materials' |
  'NPC' |
  'NPCInvader' |
  'Remembrance' |
  'Shields' |
  'SiteofGrace' |
  'Spells' |
  'SpiritAshes' |
  'Spiritsprings' |
  'SummoningPool' |
  'Talismans' |
  'UpgradeMaterials' |
  'Waygates' |
  'Weapons';

export type CategoryMapping = Record<CategoryId, ItemCategory>;

export type Size = {
  width: number,
  height: number,
};

export type Position = {
  x: number,
  y: number,
}

export type Point = Position;

export type Frame = {
  origin: Position,
  size: Size,
}

export type GridCoords = {
  row: number,
  col: number,
}

