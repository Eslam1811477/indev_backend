import mongoose, { Schema, Document } from "mongoose";

export interface IUserLicense extends Document {
  code: string;
  itemId?: number;
  itemName?: string;
  buyerUsername?: string;
  licenseType?: string;
  soldAt?: Date;
  supportedUntil?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

const UserLicenseSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    itemId: { type: Number },
    itemName: { type: String },
    buyerUsername: { type: String },
    licenseType: { type: String },
    soldAt: { type: Date },
    supportedUntil: { type: Date },
    active: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUserLicense>("ThemeLicense", UserLicenseSchema);
