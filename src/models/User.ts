import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  provider: "credentials" | "google" | "facebook";
  providerId?: string;
  avatar?: string;
  role: "customer" | "admin";
  emailVerified: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: String,
    password: String,
    provider: { type: String, default: "credentials", enum: ["credentials", "google", "facebook"] },
    providerId: String,
    avatar: String,
    role: { type: String, default: "customer", enum: ["customer", "admin"] },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
