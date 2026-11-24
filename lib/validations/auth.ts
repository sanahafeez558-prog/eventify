import { z } from "zod"

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Please enter your username or Gmail"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .regex(/^[a-zA-Z\s]+$/, "Full name must contain only alphabets (numbers are not allowed)"),
    username: z
      .string()
      .min(4, "Username must be 4 to 22 characters")
      .max(22, "Username cannot exceed 22 characters")
      .regex(
        /^[A-Za-z]{4,22}$/,
        "Username must contain ONLY alphabets (A-Z, a-z). No numbers, symbols, or spaces allowed."
      ),
    email: z
      .string()
      .min(1, "Please enter valid Gmail with @")
      .refine((val) => val.includes("@"), {
        message: "Please enter valid Gmail with @",
      })
      .refine(
        (val) =>
          /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(val.trim()),
        {
          message: "Please enter a valid Gmail address (e.g. yourname@gmail.com)",
        }
      ),
    country_code: z.string().min(1, "Please select a country code"),
    phone: z
      .string()
      .regex(/^\d{11}$/, "Phone number must be exactly 11 digits (e.g. 03001234567)"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/,
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special sign (!@#$%^&*)"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type SignupFormData = z.infer<typeof signupSchema>

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter valid Gmail with @")
    .refine((val) => val.includes("@"), {
      message: "Please enter valid Gmail with @",
    })
    .refine(
      (val) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(val.trim()),
      {
        message: "Please enter a valid Gmail address",
      }
    ),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/,
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special sign (!@#$%^&*)"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .regex(/^[a-zA-Z\s]+$/, "Full name must contain only alphabets (numbers are not allowed)"),
  username: z
    .string()
    .min(4, "Username must be 4 to 22 characters")
    .max(22, "Username cannot exceed 22 characters")
    .regex(/^[A-Za-z]{4,22}$/, "Username must contain ONLY alphabets (A-Z, a-z)")
    .or(z.literal("")),
  country_code: z.string().optional(),
  phone: z
    .string()
    .regex(/^\d{11}$/, "Phone number must be exactly 11 digits")
    .or(z.literal("")),
  avatar_url: z.string().url("Please enter a valid URL").or(z.literal("")),
})

export type ProfileFormData = z.infer<typeof profileSchema>
