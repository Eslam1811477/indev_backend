import mongoose from "mongoose";
import bcrypt from "bcrypt";
import {User} from "../models/user.model";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ MongoDB connected");

    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL!;
    const adminUsername = process.env.DEFAULT_ADMIN_USER!;
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD!;

    if (!adminEmail || !adminUsername || !adminPassword) {
      throw new Error("❌ Missing default admin environment variables");
    }

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await User.create({
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
      });

      console.log("👑 Default admin user created");
    } else {
      console.log("👑 Default admin already exists");
    }

  } catch (err) {
    console.error("❌ MongoDB error", err);
    process.exit(1);
  }
};
