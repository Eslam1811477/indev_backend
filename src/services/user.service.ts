import bcrypt from "bcryptjs";
import { User } from "../models/user.model";

export const createUser = async (email: string, password: string) => {
  const exists = await User.findOne({ email });
  if (exists) return null;

  const hashed = await bcrypt.hash(password, 10);
  return User.create({ email, password: hashed });
};

export const findUserByEmail = (email: string) => {
  return User.findOne({ email });
};
