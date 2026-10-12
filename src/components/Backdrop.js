import React from 'react';
import { Box } from '@mui/material';
import { keyframes } from '@emotion/react';
import { LEAF_CREAM, LEAF_GOLD, LEAF_OLIVE } from './leafImages';
import useImagesReady from '../hooks/useImagesReady';

const BIG_LEAVES = require('../images/leaves.opt.webp');
const GOLD_DUST = require('../images/gold.opt.webp');

// Soft, fixed artwork behind every page so the whole site flows like the home header
// (same black canvas, same leaves and gold dust) instead of changing style page to page.
const drift = keyframes`
  0%   { transform: translateY(-12vh) translateX(0) rotate(0deg); opacity: 0; }
  10%  { opacity: 0.55; }
  50%  { transform: translateY(55vh) translateX(-24px) rotate(160deg); }
  100% { transform: translateY(112vh) translateX(14px) rotate(320deg); opacity: 0; }
`;

const LEAVES = [
  { left: '8%', delay: '-3s', size: 46, src: LEAF_GOLD, dur: 26 },
  { left: '84%', delay: '-11s', size: 40, src: LEAF_OLIVE, dur: 30 },
  { left: '52%', delay: '-18s', size: 36, src: LEAF_CREAM, dur: 34 },
];

export default function Backdrop() {
  // the big faint artwork fades in once both files are ready, never one at a time
  const ready = useImagesReady([BIG_LEAVES, GOLD_DUST]);
  return (
    <Box aria-hidden sx={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none', userSelect: 'none', backgroundColor: '#000' }}>
      <Box component="img" alt="" src={BIG_LEAVES} sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', top: '8%', right: '-14%', width: '44%', opacity: ready ? 0.1 : 0, transition: 'opacity 1s ease', transform: 'rotate(8deg)' }} />
      <Box component="img" alt="" src={GOLD_DUST} sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', bottom: '-6%', left: '-10%', width: '40%', opacity: ready ? 0.12 : 0, transition: 'opacity 1s ease' }} />
      {LEAVES.map((l) => (
        <Box key={l.left} component="img" alt="" src={l.src} sx={{ position: 'absolute', top: 0, left: l.left, width: l.size, height: l.size, opacity: 0, animation: `${drift} ${l.dur}s linear infinite`, animationDelay: l.delay }} />
      ))}
    </Box>
  );
}
