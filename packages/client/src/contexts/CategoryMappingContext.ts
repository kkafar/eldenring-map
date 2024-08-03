import React from "react";
import { preprocessCategoryData } from "../core/tools";
import { CategoryMapping } from "../types";
import categories from '../data/categories.json';

export const categoryMapping = preprocessCategoryData(categories);

const CategoryMappingContext = React.createContext<CategoryMapping>(categoryMapping);

export default CategoryMappingContext;

