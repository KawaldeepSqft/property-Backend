import mongoose from "mongoose";
const AdminAndOwnerDetails = mongoose.Schema({
  Name: {
    type: String,
    trim: true,
  },
  ContactNumber: {
    type: Number,
    trim: true,
    required: [true, "Please Enter Your Number"],
  },

  Role: {
    type: String,
    trim: true,
    enum: ["Owner", "Admin", "Agent"],
  },
  AdminVerify: {
    type: Boolean,
    trim: true,
  },
  OwnerVerify: {
    type: Boolean,
    trim: true,
  },
  AgentVerify: {
    type: Boolean,
    trim: true,
  },
  CRTVerifyAdmin: {
    type: Boolean,
    trim: true,
    default: false,
  },

  OtpHash: {
    type: String,
    trim: true,
  },
  OtpExpire: {
    type: Date,
    trim: true,
  },
  createdAt: {
    type: Date,
    trim: true,
    default: Date.now,
  },
  // Added by aC
  AssignedPropertyId: [
    {
      type: String,
      trim: true,
      // type: mongoose.Schema.Types.ObjectId,
      // ref:"PostDetail"
    },
  ],
});
const AdminAndOwnerModel = mongoose.model(
  "AdminAndOwnerDetail",
  AdminAndOwnerDetails
);
export default AdminAndOwnerModel;
