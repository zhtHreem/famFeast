import { useEffect, useState } from 'react';

// Starts loading + decoding images and reports when ALL of them are ready, so decorative art can be
// revealed in one piece instead of popping in layer by layer as each file finishes downloading.
const cache = new Map();
const load = (src) => {
  if (!cache.has(src)) {
    const img = new Image();
    img.src = src;
    cache.set(src, img.decode ? img.decode().catch(() => {}) : new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; }));
  }
  return cache.get(src);
};

export const preloadImages = (urls) => urls.forEach(load);

export default function useImagesReady(urls, timeoutMs = 15000) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => alive && setReady(true), timeoutMs); // never leave the art hidden forever
    Promise.all(urls.map(load)).then(() => {
      if (alive) {
        clearTimeout(timer);
        setReady(true);
      }
    });
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ready;
}
