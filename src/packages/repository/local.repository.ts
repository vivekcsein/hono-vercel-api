import { User } from "../../types/auth";
import { passwords, users } from "../db/local.db";
import { DefaultUser } from "../utils/defualt-user.utils";

// INITIALIZE DEFAULT USER
export const initializeDefaultUser = async (defaultUser: DefaultUser): Promise<void> => {
  users.set(defaultUser.id, defaultUser);
  passwords.set(defaultUser.id, defaultUser.password);
};

// FIND USER BY EMAIL
export const findUserByEmail = (email: string): User | undefined => {
  return Array.from(users.values()).find(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );
};

// FIND USER BY ID
export const findUserById = (id: string): User | undefined => {
  return users.get(id);
};

// CREATE USER
export const createUser = async ({
  user,
  hashedPassword,
}: {
  user: User;
  hashedPassword: string;
}): Promise<User> => {
  users.set(user.id, user);
  passwords.set(user.id, hashedPassword);
  return user;
};

// UPDATE USER
export const updateUser = async (user: User): Promise<User> => {
  users.set(user.id, user);
  return user;
};

// DELETE USER
export const deleteUser = async (userId: string): Promise<void> => {
  users.delete(userId);
  passwords.delete(userId);
};

// GET USER PASSWORD
export const getUserPassword = (userId: string): string | undefined => {
  return passwords.get(userId);
};

// UPDATE USER PASSWORD
export const updateUserPassword = async ({
  userId,
  hashedPassword,
}: {
  userId: string;

  hashedPassword: string;
}): Promise<void> => {
  passwords.set(userId, hashedPassword);
};

// GET ALL USERS
export const getAllUsers = (): User[] => {
  return Array.from(users.values());
};
