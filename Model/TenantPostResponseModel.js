import mongoose from "mongoose";
const Tenant_PostResponse = mongoose.Schema({
  Name: {
    type: String,
    trim: true,
    required: [true, "Please Enter Your Name"],
  },
  Email: {
    type: String,
    trim: true,
    required: [true, "Please Enter Your Email"],
  },
  ContactNumber: {
    type: Number,
    trim: true,
    required: [true, "Please Enter Your Contact Number"],
  },
  PostData: {
    PostId: {
      type:String,
      trim: true,
      ref: "PostDetail",
      required: true,
    },
  },
   Tenant: {
    type: mongoose.Schema.ObjectId,
    trim: true,
    ref: "UserDetail",
    required: true,
  },
  PostFullAddress:{
    type: String,
    trim: true,
    required: [true, "Enter Post Full Address"],
  } ,
  createAt: {
    type: Date,
    trim: true,
    default: Date.now(),
  },
});
const Tenant_PostResponseModel = mongoose.model("TenantPostResponse", Tenant_PostResponse);
export default Tenant_PostResponseModel;
