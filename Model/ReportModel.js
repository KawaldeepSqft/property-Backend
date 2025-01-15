import mongoose from "mongoose";

const Reportform = new mongoose.Schema(
  {
    reason: {
      type: String,
      trim: true,
      required: true,
    },

    postId: {
      type: String,
      trim: true,
      ref: "PostDetail",
      required: true,
    },

    reportUserId: {
      type: mongoose.Schema.ObjectId,
      trim: true,
      ref: "UserDetail",
      required: true,
    },
  },
  { timestamps: true }
);
const ReportModel = mongoose.model("ReportData", Reportform);
export default ReportModel;
