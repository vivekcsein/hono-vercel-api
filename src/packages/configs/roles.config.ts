export const UserRoles = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export const UserRolesValues = Object.values(UserRoles);

export type UserRole = keyof typeof UserRoles;
