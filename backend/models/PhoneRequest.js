import mongoose from "mongoose";

const phoneRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Ensure one pending request per requester-owner pair
phoneRequestSchema.index({ requester: 1, owner: 1, status: 1 });

const PhoneRequest = mongoose.model("PhoneRequest", phoneRequestSchema);
export default PhoneRequest;

