import { z } from "zod";
import { allowedMailDomains } from "./domains.config";

//  SHARED MESSAGES
export const schemaMessages = {
  required: "This field is required",
  invalid: "Invalid value provided",

  //email
  emailRequired: "Email is required",
  emailInvalid: "Invalid email format",
  emailDomain: "Email domain is not supported",
  emailTooLong: "Email must not exceed 255 characters",

  // FULL NAME
  fullnameRequired: "Full name is required",
  fullnameTooShort: "Full name must be at least 5 characters",
  fullnameTooLong: "Full name must not exceed 100 characters",
  fullnameInvalid: "Full name contains invalid characters",

  // USERNAME
  usernameTooShort: "Username must be at least 5 characters",
  usernameTooLong: "Username must not exceed 30 characters",
  usernameInvalid: "Username may only contain letters, numbers and underscores",

  // PASSWORD
  passwordRequired: "Password is required",
  passwordTooShort: "Password must be at least 8 characters long",
  passwordTooLong: "Password must not exceed 32 characters",
  passwordUpper: "Password must contain at least one uppercase letter",
  passwordLower: "Password must contain at least one lowercase letter",
  passwordNumber: "Password must contain at least one number",
  passwordSpecial: "Password must contain at least one special character",
  passwordNoSpaces: "Password must not contain spaces",
  passwordMismatch: "Passwords do not match",
  weakPassword: "Password is too weak",

  // OTP
  otpRequired: "OTP is required",
  otpInvalid: "OTP must contain exactly 6 digits",
  otpNumeric: "OTP must contain only numbers",

  //  TERMS  and conditions
  termsRequired: "You must accept the terms and conditions",

  // MESSAGE
  messageRequired: "Message is required",
  messageTooShort: "Message is too short",
  messageTooLong: "Message is too long",

  // URL validation message
  urlInvalid: "Invalid URL",

  // phone number validation message
  phoneInvalid: "Invalid phone number format",
};

//    COMMON HELPERS for trimming strings
const trimString = () => z.string().trim();

// FULL NAME rules
export const fullnameRules = trimString()
  .min(5, schemaMessages.fullnameTooShort)
  .max(100, schemaMessages.fullnameTooLong)
  .regex(/^[A-Za-z\s'-]+$/, schemaMessages.fullnameInvalid)
  .describe("Full name");

// EMAIL rules
export const emailRules = z
  .email(schemaMessages.emailInvalid)
  .trim()
  .toLowerCase()
  .min(1, schemaMessages.emailRequired)
  .refine(
    (email) => {
      const domain = email.split("@")[1];

      if (!domain) {
        return false;
      }

      return allowedMailDomains.includes(domain);
    },
    { message: schemaMessages.emailDomain },
  )
  .describe("Email");

// PASSWORD rules
export const passwordRules = trimString()
  .min(8, schemaMessages.passwordTooShort)
  .max(32, schemaMessages.passwordTooLong)
  .regex(/[A-Z]/, schemaMessages.passwordUpper)
  .regex(/[a-z]/, schemaMessages.passwordLower)
  .regex(/[0-9]/, schemaMessages.passwordNumber)
  .regex(/[^A-Za-z0-9]/, schemaMessages.passwordSpecial)
  .refine((value) => !/\s/.test(value), {
    message: schemaMessages.passwordNoSpaces,
  })
  .describe("Secure password with uppercase, lowercase, number and special character");

export const confirmPasswordRules = trimString().describe("Confirm password");

// TERMS and conditions rules
export const termsAcceptedRules = z.boolean().refine(
  (value) => value === true,

  {
    message: schemaMessages.termsRequired,
  },
);

// OTP rules
export const otpRules = trimString()
  .length(6, { message: schemaMessages.otpInvalid })
  .regex(/^\d+$/, { message: schemaMessages.otpNumeric })
  .describe("One-time password");

// MESSAGE rules
export const messageRules = trimString()
  .min(5, schemaMessages.messageTooShort)
  .max(5000, schemaMessages.messageTooLong)
  .describe("Message");

// International phone number rules
export const phoneRules = trimString()
  .regex(/^\+?[1-9]\d{7,14}$/, schemaMessages.phoneInvalid)
  .describe("International phone number");

// USERNAME rules
export const usernameRules = trimString()
  .min(5, schemaMessages.usernameTooShort)
  .max(30, schemaMessages.usernameTooLong)
  .regex(/^[a-zA-Z0-9_]+$/, schemaMessages.usernameInvalid)
  .describe("Username");

// UUID rules
export const uuidRules = z.uuid().describe("UUID");

// DATE rules
export const dateRules = z.coerce.date().describe("Date");

// PAGINATION  rules
export const pageRules = z.coerce.number().min(1).default(1);

export const limitRules = z.coerce.number().min(1).max(100).default(10);
