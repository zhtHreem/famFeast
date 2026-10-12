// Normalises free-text ingredient names into comparable keys and matches them against a pantry.

const NOISE = new Set([
  'fresh', 'freshly', 'large', 'small', 'medium', 'big', 'chopped', 'finely', 'roughly', 'diced', 'minced',
  'sliced', 'grated', 'crushed', 'peeled', 'cooked', 'raw', 'dried', 'frozen', 'canned', 'tinned', 'whole',
  'boneless', 'skinless', 'ripe', 'optional', 'to', 'taste', 'of', 'a', 'an', 'the', 'and', 'or', 'for',
  'plus', 'extra', 'more', 'little', 'bunch', 'handful', 'pinch', 'dash', 'some', 'good', 'quality', 'cut',
  'into', 'pieces', 'piece', 'chunks', 'cubes', 'strips', 'lean', 'thick', 'thin', 'soft', 'hard', 'packed',
  'heaped', 'level', 'sifted', 'melted', 'softened', 'beaten', 'halved', 'quartered', 'shredded', 'toasted',
  'unsalted', 'salted', 'organic', 'plain', 'self', 'raising',
]);

const UNITS = new Set([
  'g', 'kg', 'mg', 'ml', 'l', 'cl', 'dl', 'oz', 'lb', 'lbs', 'tsp', 'tbsp', 'tbs', 'cup', 'cups', 'teaspoon',
  'teaspoons', 'tablespoon', 'tablespoons', 'gram', 'grams', 'kilo', 'kilos', 'litre', 'litres', 'liter',
  'liters', 'ounce', 'ounces', 'pound', 'pounds', 'clove', 'cloves', 'slice', 'slices', 'can', 'cans', 'tin',
  'tins', 'stick', 'sticks', 'sprig', 'sprigs', 'leaf', 'leaves', 'head', 'heads', 'pack', 'packet', 'jar',
  'sheet', 'sheets', 'knob', 'inch', 'cm',
]);

const SYNONYMS = {
  'scallion': 'spring onion', 'green onion': 'spring onion', 'spring onions': 'spring onion',
  'cilantro': 'coriander', 'coriander leaf': 'coriander', 'fresh coriander': 'coriander',
  'aubergine': 'eggplant', 'courgette': 'zucchini', 'capsicum': 'bell pepper', 'red pepper': 'bell pepper',
  'green pepper': 'bell pepper', 'yellow pepper': 'bell pepper', 'sweet pepper': 'bell pepper',
  'orange pepper': 'bell pepper', 'red bell pepper': 'bell pepper', 'green bell pepper': 'bell pepper',
  'chilli': 'chili', 'chile': 'chili', 'chilli pepper': 'chili', 'red chili': 'chili', 'green chili': 'chili',
  'red chilli': 'chili', 'green chilli': 'chili', 'chilli powder': 'chili powder', 'chilli flake': 'chili flake',
  'prawn': 'shrimp', 'king prawn': 'shrimp', 'garbanzo bean': 'chickpea', 'garbanzo': 'chickpea',
  'caster sugar': 'sugar', 'granulated sugar': 'sugar', 'white sugar': 'sugar', 'icing sugar': 'powdered sugar',
  'confectioner sugar': 'powdered sugar', 'plain flour': 'flour', 'all purpose flour': 'flour',
  'wheat flour': 'flour', 'bicarbonate of soda': 'baking soda', 'bicarbonate soda': 'baking soda',
  'double cream': 'cream', 'heavy cream': 'cream', 'single cream': 'cream', 'whipping cream': 'cream',
  'natural yogurt': 'yogurt', 'greek yogurt': 'yogurt', 'yoghurt': 'yogurt', 'minced beef': 'ground beef',
  'beef mince': 'ground beef', 'mince': 'ground beef', 'pork mince': 'ground pork', 'minced pork': 'ground pork',
  'lamb mince': 'ground lamb', 'minced lamb': 'ground lamb', 'chicken breast': 'chicken',
  'chicken thigh': 'chicken', 'chicken leg': 'chicken', 'chicken drumstick': 'chicken',
  'plum tomato': 'tomato', 'cherry tomato': 'tomato', 'garlic clove': 'garlic', 'egg yolk': 'egg',
  'egg white': 'egg', 'vegetable stock': 'stock', 'chicken stock': 'stock', 'beef stock': 'stock',
  'stock cube': 'stock', 'bouillon': 'stock', 'broth': 'stock', 'extra virgin olive oil': 'olive oil',
  'sunflower oil': 'vegetable oil', 'canola oil': 'vegetable oil', 'rapeseed oil': 'vegetable oil',
  'cooking oil': 'vegetable oil', 'oil': 'vegetable oil', 'black pepper': 'pepper', 'ground black pepper': 'pepper',
  'white pepper': 'pepper', 'sea salt': 'salt', 'table salt': 'salt', 'kosher salt': 'salt',
  'jeera': 'cumin', 'haldi': 'turmeric', 'dahi': 'yogurt', 'atta': 'flour', 'ghee': 'butter',
};

// Compound items that must only ever match exactly (so "butter" never satisfies "peanut butter").
const INDIVISIBLE = new Set([
  'peanut butter', 'coconut milk', 'soy sauce', 'fish sauce', 'baking powder', 'baking soda', 'tomato paste',
  'tomato sauce', 'sour cream', 'ice cream', 'cream cheese', 'olive oil', 'sesame oil', 'vegetable oil',
  'coconut oil', 'sweet potato', 'bell pepper', 'black bean', 'kidney bean', 'white bean', 'green bean',
  'brown sugar', 'powdered sugar', 'oyster sauce', 'worcestershire sauce', 'hot sauce', 'chili sauce',
  'coconut cream', 'curry powder', 'chili powder', 'garlic powder', 'onion powder', 'cocoa powder',
  'corn flour', 'cornflour', 'cornstarch', 'rice vinegar', 'wine vinegar', 'balsamic vinegar', 'spring onion',
  'ground beef', 'ground pork', 'ground lamb', 'butternut squash', 'ground almond', 'ground ginger',
  'ground cumin', 'ground coriander', 'coriander seed', 'cumin seed', 'mustard seed', 'puff pastry',
  'chili flake', 'black pepper', 'peanut oil',
]);

// Items most kitchens have; optionally treated as available.
export const STAPLES = ['salt', 'pepper', 'water', 'vegetable oil', 'olive oil'];

const NO_SINGULAR = /(ss|us|is|ous)$/;
const IRREGULAR = { leaves: 'leaf', loaves: 'loaf', halves: 'half', knives: 'knife' };

const singular = (w) => {
  if (IRREGULAR[w]) return IRREGULAR[w];
  if (w.length <= 3 || NO_SINGULAR.test(w)) return w;
  if (/ies$/.test(w)) return w.slice(0, -3) + 'y';
  if (/(oes|ches|shes|xes)$/.test(w)) return w.slice(0, -2);
  if (/s$/.test(w)) return w.slice(0, -1);
  return w;
};

export const normalizeIngredient = (raw) => {
  if (typeof raw !== 'string') return '';
  const s = raw.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[^a-z\s-]/g, ' ').replace(/-/g, ' ');
  const words = s
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !NOISE.has(w) && !UNITS.has(w))
    .map(singular);
  const key = words.join(' ').trim();
  return SYNONYMS[key] || key;
};

export const normalizeList = (list) => [...new Set((list || []).map(normalizeIngredient).filter(Boolean))];

// Does a pantry item satisfy a recipe key?
export const satisfies = (pantryKey, recipeKey) => {
  if (pantryKey === recipeKey) return true;
  if (INDIVISIBLE.has(pantryKey) || INDIVISIBLE.has(recipeKey)) return false;
  if (STAPLES.includes(pantryKey) || STAPLES.includes(recipeKey)) return false; // salt/pepper/water/oil: exact only
  const p = pantryKey.split(' ');
  const r = recipeKey.split(' ');
  // "chicken" satisfies "chicken breast" (and vice versa) when the shorter is a single word
  // contained in a short compound, or both share the head noun.
  const sharesHead = (a, b) => a.length < b.length && a.every((w) => b.includes(w)) && a[a.length - 1] === b[b.length - 1];
  const singleInside = (a, b) => a.length === 1 && b.length <= 3 && b.includes(a[0]);
  return sharesHead(p, r) || sharesHead(r, p) || singleInside(p, r) || singleInside(r, p);
};

/**
 * Compare a pantry against a recipe's ingredient keys.
 * score = fraction of (non-staple) ingredients the pantry covers.
 */
export const matchRecipe = (pantryKeys, recipeKeys, { assumeStaples = true } = {}) => {
  const pantry = assumeStaples ? [...new Set([...pantryKeys, ...STAPLES])] : pantryKeys;
  const have = [];
  const missing = [];
  for (const key of recipeKeys) (pantry.some((p) => satisfies(p, key)) ? have : missing).push(key);
  const isStaple = (k) => assumeStaples && STAPLES.includes(k);
  const countable = recipeKeys.filter((k) => !isStaple(k));
  const score = countable.length ? have.filter((k) => !isStaple(k)).length / countable.length : 0;
  return { have, missing, score };
};
