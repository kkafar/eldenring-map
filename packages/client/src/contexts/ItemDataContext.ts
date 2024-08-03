import React from 'react';
import { preprocessItemData } from '../core/tools';
import data from '../data/items.json';
import { MarkerDescription } from '../types';

export const preprocessedItemData = preprocessItemData(data);

const ItemDataContext = React.createContext<MarkerDescription[]>(preprocessedItemData);

export default ItemDataContext;

