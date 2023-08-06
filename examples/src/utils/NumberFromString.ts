import { z } from 'zod';

export const NumberFromString = z
  .string()
  .regex(/^[+-]?\d*\.?\d+$/, { message: 'Please enter a number' })
  .transform(Number);
