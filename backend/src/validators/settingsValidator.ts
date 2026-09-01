import { z } from 'zod';

export const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  currency: z.string().min(1).max(10).optional(),
  securityLockEnabled: z.boolean().optional(),
});
