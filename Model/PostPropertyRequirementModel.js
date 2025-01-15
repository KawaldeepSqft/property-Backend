import mongoose from "mongoose";
const PostPropertyRequirement = mongoose.Schema({
  ProjectName: {
    type: String,
    trim: true,
    required: [true, "Please Enter Your Name"],
  },
  FloorPreference: {
    type: String,
    trim: true,
    required: [true, "Floor Preference is Required"],
  },

  BHKType: {
    type: Number,
    trim: true,
    required: [true, "Please Enter Bhktype"],
  },
  Budget: {
    type: Number,
    trim: true,
    required: [true, "Please Enter Budget"],
  },

  WhatsAppUpdate: {
    type: Boolean,
    trim: true,
  },
  RequirementUser :{
    type: mongoose.Schema.ObjectId,
        trim: true,
        ref: "UserDetail",
        required: true,
  } ,
  createAt: {
    type: Date,
    trim: true,
    default: Date.now(),
  },
});
const PostPropertyRequirementModel = mongoose.model(
  "PropertyRequirement",
  PostPropertyRequirement
);
export default PostPropertyRequirementModel;
