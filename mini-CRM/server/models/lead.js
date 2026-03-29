import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    source: {
      type: String,
      default: "website"
    },
    status: {
      type: String,
      enum: ["new", "contacted", "converted"],
      default: "new"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);