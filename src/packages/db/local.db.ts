// TEMP USERS STORE LOCALLY
// REPLACE WITH:
// - DRIZZLE
// - POSTGRES

import { User } from "../../types/auth";

// - SUPABASE
export const users = new Map<string, User>();

// TEMP PASSWORD STORE
// NEVER STORE RAW PASSWORDS
export const passwords = new Map<string, string>();
