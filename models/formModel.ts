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
      lowercase: true,
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



export default mongoose.model("Form", FormSchema);
