import mongoose from "mongoose";
const Notify = mongoose.Schema({
  BHKType: {
    type: Number,
    trim: true,
    required: [true, "Please Enter Bhktype"],
  },
  Room: {
    type: [String],
  },
  // Name: {
  //   type: String,
  //   trim: true,
  //   required: [true, "Please Enter Your Name"],
  // },
  FloorPreference: {
    type: String,
    trim: true,
    required: [true, "Please Enter Your FloorPreference"],
  },
  // Email: {
  //   type: String,
  //   trim: true,
  //   required: [true, "Please Enter Your Email Id"],
  // },
  // ContactNumber: {
  //   type: Number,
  //   trim: true,
  //   required: [true, "Please Enter Your Contact Number"],
  // },
  ProjectName: {
    type: String,
    trim: true,
    required: [true, "Please Enter Your Name"],
  },
  User: {
    type: mongoose.Schema.ObjectId,
    trim: true,
    ref: "UserDetail",
    required: true,
  },

  createAt: {
    type: Date,
    trim: true,
    default: Date.now(),
  },
});
const NotifyModel = mongoose.model("Notify", Notify);
export default NotifyModel;
