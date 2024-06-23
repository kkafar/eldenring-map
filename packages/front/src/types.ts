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

