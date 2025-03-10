import mongoose from "mongoose";

const FormSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
    },
    files: {
      type: [String],
      required: [true, "Files are required"],
    }
  },
  { timestamps: true }
);

export default mongoose.models.Form || mongoose.model("Form", FormSchema);