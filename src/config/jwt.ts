import jwt from "jsonwebtoken";
import "dotenv/config";


const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not defined");
}

export type JwtPayload = {
  userId: string;
  email: string;
};

export const signToken = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
