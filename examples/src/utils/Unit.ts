import * as z from 'zod';

// mm
// ================================
export type MM = z.infer<typeof MM>;
export const MM = z.number().brand<'MM'>();

export const mkMM = (mm: number): MM => {
  return MM.parse(mm);
};

// cm
// ================================
export type CM = z.infer<typeof CM>;
export const CM = z.number().brand<'CM'>();

export const mkCM = (cm: number): CM => {
  return CM.parse(cm);
};

// trans
// ================================
export const cm2mm = (cm: CM): MM => {
  return mkMM(cm * 10);
};

export const mm2cm = (mm: MM): CM => {
  return mkCM(mm / 10);
};
