import { z } from "zod";

import { emailRules, passwordRules, fullnameRules } from "../configs/schemas.config";

// SCHEMA
export const signUpSchema = z
  .object({
    fullname: fullnameRules.optional(),
    email: emailRules,
    password: passwordRules,
  })
  .describe("Registration form");

export const signInSchema = z.object({
  email: emailRules,
  password: passwordRules,
  remember: z.boolean().optional(),
});

export const forgetPasswordSchema = z.object({
  email: emailRules,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: passwordRules,
  confirmPassword: passwordRules,
});

export const updatePasswordSchema = z.object({
  password: passwordRules,
  confirmPassword: passwordRules,
});

export const updateProfileSchema = z.object({
  fullname: fullnameRules,
  email: emailRules,
});

export const contactSchema = z.object({
  fullname: fullnameRules,
  email: emailRules,
  topic: z.string().trim().min(5, "Topic is required"),
  message: z.string().trim().min(5, "Message is required"),
  newsletter: z.boolean().optional(),
});

//  SCHEMA OUTPUT
export type SignUpBody = z.infer<typeof signUpSchema>;

export type SignInBody = z.output<typeof signUpSchema>;
