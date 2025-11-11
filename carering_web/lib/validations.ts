import { z } from 'zod';

// Circle schemas
export const createCircleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateCircleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

// Circle Membership schemas
export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'CAREGIVER', 'FAMILY_MEMBER', 'VIEWER']),
  permissions: z.record(z.boolean()).optional(),
});

// Care Plan schemas
export const createCarePlanSchema = z.object({
  circleId: z.string().cuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  goals: z.array(z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    targetDate: z.string().datetime().optional(),
  })),
});

// Medication schemas
export const createMedicationSchema = z.object({
  carePlanId: z.string().cuid(),
  name: z.string().min(1).max(200),
  dosage: z.string().min(1).max(100),
  frequency: z.string().min(1).max(100),
  instructions: z.string().max(1000).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
});

export const logMedicationSchema = z.object({
  medicationId: z.string().cuid(),
  takenAt: z.string().datetime(),
  takenBy: z.string().optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(['TAKEN', 'SKIPPED', 'DELAYED', 'PARTIAL']),
});

// Vital Reading schemas
export const createVitalReadingSchema = z.object({
  type: z.enum([
    'BLOOD_PRESSURE_SYSTOLIC',
    'BLOOD_PRESSURE_DIASTOLIC',
    'HEART_RATE',
    'BLOOD_GLUCOSE',
    'TEMPERATURE',
    'WEIGHT',
    'OXYGEN_SATURATION',
    'RESPIRATORY_RATE',
  ]),
  value: z.number(),
  unit: z.string().min(1).max(20),
  notes: z.string().max(500).optional(),
  recordedAt: z.string().datetime().optional(),
  source: z.string().max(50).optional(),
  metadata: z.record(z.any()).optional(),
});

// Task schemas
export const createTaskSchema = z.object({
  carePlanId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  dueAt: z.string().datetime().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().cuid().optional(),
  dueAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

// Schedule schemas
export const createScheduleSlotSchema = z.object({
  userId: z.string().cuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  type: z.string().min(1).max(50),
  notes: z.string().max(500).optional(),
});
