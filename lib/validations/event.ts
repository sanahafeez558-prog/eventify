import { z } from "zod";

export const eventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must not exceed 100 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description must not exceed 2,000 characters"),
    category_id: z
      .string()
      .min(1, "Please select a category"),
    event_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid date (YYYY-MM-DD)"),
    start_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Please enter a valid start time (HH:MM)"),
    end_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Please enter a valid end time (HH:MM)"),
    location: z
      .string()
      .trim()
      .min(3, "Location must be at least 3 characters")
      .max(200, "Location must not exceed 200 characters"),
    max_attendees: z
      .number({
        message: "Capacity must be a number",
      })
      .int("Capacity must be a whole number")
      .min(1, "Capacity must be at least 1 attendee")
      .max(10000, "Capacity cannot exceed 10,000 attendees"),
    image_url: z
      .string()
      .trim()
      .url("Please enter a valid image URL")
      .or(z.literal(""))
      .optional(),
    status: z.enum(["draft", "published", "cancelled", "completed"]),
  })
  .refine(
    (data) => {
      if (!data.start_time || !data.end_time) return true;
      return data.end_time > data.start_time;
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  );

export type EventFormValues = z.infer<typeof eventSchema>;
