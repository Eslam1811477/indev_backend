import { Schema, model } from "mongoose";

const templateSchema = new Schema(
  {
    templateName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    plugins: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Template = model("Template", templateSchema);
