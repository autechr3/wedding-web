import p102_800 from './LVL040526JC1-102-800.webp';
import p102_1400 from './LVL040526JC1-102-1400.webp';
import p102_2000 from './LVL040526JC1-102-2000.webp';
import p110_800 from './LVL040526JC1-110-800.webp';
import p110_1400 from './LVL040526JC1-110-1400.webp';
import p110_2000 from './LVL040526JC1-110-2000.webp';
import p27_800 from './LVL040526JC1-27-800.webp';
import p27_1400 from './LVL040526JC1-27-1400.webp';
import p27_2000 from './LVL040526JC1-27-2000.webp';

export interface PhotoSet {
  w800: string;
  w1400: string;
  w2000: string;
}

export const PHOTOS = {
  beachPortrait: { w800: p102_800, w1400: p102_1400, w2000: p102_2000 },
  embrace: { w800: p110_800, w1400: p110_1400, w2000: p110_2000 },
  archway: { w800: p27_800, w1400: p27_1400, w2000: p27_2000 },
} satisfies Record<string, PhotoSet>;
