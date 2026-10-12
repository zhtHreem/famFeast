// TheMealDB serves each photo in several sizes (/small 200px, /medium 350px, /large 700px).
// Using the right one cuts image weight by ~4x compared with the original file.
const MEALDB = /^https:\/\/www\.themealdb\.com\/images\/media\/meals\/[^/]+\.(jpg|jpeg|png)$/i;

export const isMealDb = (url) => typeof url === 'string' && MEALDB.test(url);

export const imageSrc = (url, size = 'medium') => (isMealDb(url) ? `${url}/${size}` : url);

export const imageSrcSet = (url) => (isMealDb(url) ? `${url}/small 200w, ${url}/medium 350w, ${url}/large 700w` : undefined);
