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
  role: z.enum(['ADMIN', 'CAREGIVER', 'FAMILY_MEMBER', 'VIEWER'] as const),
  permissions: z.record(z.string(), z.boolean()).optional(),
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
  imageUrl: z.string().url().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
});

export const updateMedicationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  dosage: z.string().min(1).max(100).optional(),
  frequency: z.string().min(1).max(100).optional(),
  instructions: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional().nullable(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const logMedicationSchema = z.object({
  medicationId: z.string().cuid(),
  takenAt: z.string().datetime(),
  takenBy: z.string().optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(['TAKEN', 'SKIPPED', 'DELAYED', 'PARTIAL']),
});

export const createMedicationReminderSchema = z.object({
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1).max(7).default([0, 1, 2, 3, 4, 5, 6]),
  enabled: z.boolean().default(true),
  snoozeMinutes: z.number().int().min(1).max(60).default(15),
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
  metadata: z.record(z.string(), z.any()).optional(),
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
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).optional(),
});

// Schedule schemas
export const createScheduleSlotSchema = z.object({
  userId: z.string().cuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  type: z.string().min(1).max(50),
  notes: z.string().max(500).optional(),
});

// Appointment schemas
export const createAppointmentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['DOCTOR', 'DENTIST', 'THERAPY', 'LAB', 'IMAGING', 'SPECIALIST', 'OTHER']),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().max(500).optional(),
  provider: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  reminders: z.array(z.object({
    type: z.enum(['EMAIL', 'PUSH', 'SMS']),
    minutesBefore: z.number().int().min(0),
  })).optional(),
});

// Message schemas
export const createMessageSchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['TEXT', 'IMAGE', 'FILE', 'SYSTEM']).default('TEXT'),
  attachments: z.array(z.object({
    type: z.string(),
    url: z.string().url(),
    name: z.string().optional(),
    size: z.number().optional(),
  })).optional(),
  replyToId: z.string().cuid().optional(),
});
