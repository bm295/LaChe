export interface IngredientAvailability {
  ingredientName: string;
  unitsRequiredPerPortion: number;
  packCount: number;
  unitsPerPack: number;
}

/**
 * Returns the number of complete portions possible from the limiting ingredient.
 */
export function calculateMaximumPortions(ingredients: IngredientAvailability[]): number {
  if (ingredients.length === 0) {
    throw new Error('At least one ingredient is required.');
  }

  return Math.min(...ingredients.map(calculatePortionsForIngredient));
}

function calculatePortionsForIngredient(ingredient: IngredientAvailability): number {
  const { ingredientName, unitsRequiredPerPortion, packCount, unitsPerPack } = ingredient;
  const requiredQuantities = [unitsRequiredPerPortion, unitsPerPack];

  if (requiredQuantities.some((quantity) => !Number.isInteger(quantity) || quantity <= 0)) {
    throw new Error(`Ingredient ${ingredientName} must use positive whole-number recipe and pack quantities.`);
  }

  if (!Number.isInteger(packCount) || packCount < 0) {
    throw new Error(`Ingredient ${ingredientName} must use a non-negative whole-number pack count.`);
  }

  return Math.floor((packCount * unitsPerPack) / unitsRequiredPerPortion);
}
