import { z } from "zod";

export const vehicleSchema = z.object({
  name: z.string().min(1, "Vehicle name is required"),
  model: z.string().min(1, "Model is required"),
  type: z.enum(["MOTORCYCLE", "CAR", "SCOOTER", "OTHER"]).default("MOTORCYCLE"),
  make: z.string().optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  registrationNumber: z.string().optional(),
  vin: z.string().optional(),
  color: z.string().optional(),
  fuelType: z.enum(["PETROL", "DIESEL", "ELECTRIC", "CNG", "HYBRID"]).default("PETROL"),
  tankCapacity: z.coerce.number().positive().optional(),
  currentOdometer: z.coerce.number().nonnegative("Odometer cannot be negative"),
  isDefault: z.boolean().default(false),
});

export const fuelLogSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  date: z.string().or(z.date()).default(() => new Date().toISOString()),
  odometer: z.coerce.number().positive("Odometer must be greater than 0"),
  liters: z.coerce.number().positive("Liters must be greater than 0"),
  pricePerLiter: z.coerce.number().positive("Price per liter must be greater than 0"),
  totalCost: z.coerce.number().positive("Total cost must be greater than 0"),
  isFullTank: z.boolean().default(true),
  missedRefuel: z.boolean().default(false),
  stationName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const maintenanceTaskSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  title: z.string().min(1, "Title is required"),
  category: z.enum(["ROUTINE", "OIL", "TIRES", "BRAKES", "CHAIN", "ELECTRICAL", "REPAIR", "INSPECTION"]).default("ROUTINE"),
  status: z.enum(["PENDING", "DUE_SOON", "OVERDUE", "COMPLETED"]).default("PENDING"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueOdometer: z.coerce.number().positive().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  intervalKm: z.coerce.number().positive().optional().nullable(),
  intervalMonths: z.coerce.number().int().positive().optional().nullable(),
  lastCompletedOdometer: z.coerce.number().optional().nullable(),
  lastCompletedDate: z.string().optional().nullable(),
  cost: z.coerce.number().nonnegative().optional().nullable(),
  serviceCenter: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const vehicleDocumentSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  title: z.string().min(1, "Document title is required"),
  type: z.enum(["RC", "INSURANCE", "PUC", "LICENSE", "FITNESS", "OTHER"]).default("RC"),
  documentNumber: z.string().optional().nullable(),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  provider: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  fileUrl: z.string().optional().nullable(),
});

export const expenseSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  date: z.string().or(z.date()).default(() => new Date().toISOString()),
  category: z.enum(["FUEL", "SERVICE", "PARTS", "INSURANCE", "TOLL", "PARKING", "ACCESSORIES", "WASH", "FINE", "OTHER"]).default("OTHER"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  title: z.string().min(1, "Expense title is required"),
  notes: z.string().optional().nullable(),
  odometer: z.coerce.number().optional().nullable(),
  referenceId: z.string().optional().nullable(),
});
