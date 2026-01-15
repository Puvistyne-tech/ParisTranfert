import { z } from "zod";

// Server-safe phone validation function
function isValidPhoneNumber(phone: string): boolean {
  // Basic phone validation - accepts international format
  // Matches: +1234567890, +33 6 12 34 56 78, etc.
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  // Remove spaces, dashes, and parentheses for validation
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  return phoneRegex.test(cleaned) && cleaned.length >= 10;
}

// Base reservation schema (pickup and destination are optional - validated via service fields)
export const reservationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .refine((val) => isValidPhoneNumber(val), {
      message: "Please enter a valid phone number",
    }),
  pickup: z.string().optional(), // Validated via service fields if needed
  destination: z.string().optional(), // Validated via service fields if needed
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  service: z.string().min(1, "Service selection is required"),
  vehicle: z.string().optional(),
  passengers: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) ? 1 : num;
    })
    .pipe(z.number().min(1, "Number of passengers must be at least 1")),
  childSeat: z.boolean().optional(),
  meetGreet: z.boolean().optional(),
  waitingTime: z.boolean().optional(),
  flightTracking: z.boolean().optional(),
  notes: z.string().optional(),
});

// Schema for validating service-specific fields
export const createServiceFieldSchema = (
  serviceFields: Array<{
    fieldKey: string;
    label: string;
    required: boolean;
    fieldType: string;
  }>,
) => {
  const serviceFieldSchema: Record<string, z.ZodTypeAny> = {};

  serviceFields.forEach((field) => {
    if (field.required) {
      switch (field.fieldType) {
        case "number":
          serviceFieldSchema[field.fieldKey] = z
            .union([z.number(), z.string()])
            .transform((val) => {
              const num = typeof val === "string" ? parseFloat(val) : val;
              return isNaN(num) ? 0 : num;
            })
            .pipe(z.number().min(1, `${field.label} is required`));
          break;
        case "date":
          serviceFieldSchema[field.fieldKey] = z
            .string()
            .min(1, `${field.label} is required`);
          break;
        case "time":
          serviceFieldSchema[field.fieldKey] = z
            .string()
            .min(1, `${field.label} is required`);
          break;
        default:
          serviceFieldSchema[field.fieldKey] = z
            .string()
            .min(1, `${field.label} is required`);
      }
    }
  });

  return z.object(serviceFieldSchema);
};

// Schema for validating location fields (pickup and destination must be different for airport transfers)
export const locationSchema = z
  .object({
    pickup: z.string().min(1, "Pickup location is required"),
    destination: z.string().min(1, "Destination is required"),
  })
  .refine(
    (data) =>
      data.pickup.toLowerCase().trim() !==
      data.destination.toLowerCase().trim(),
    {
      message: "Pickup and destination locations cannot be the same",
      path: ["destination"],
    },
  );

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || isValidPhoneNumber(val), {
      message: "Please enter a valid phone number",
    }),
  message: z.string().min(1, "Message is required"),
});

export type ReservationFormData = z.infer<typeof reservationSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
