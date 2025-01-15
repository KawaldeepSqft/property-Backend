import mongoose from "mongoose";
const UserDetail = mongoose.Schema({
  Name: {
    type: String,
    trim: true,
    // required: [true, "Please Enter Your Name"],
  },
  email: {
    type: String,
    trim: true,
  },
  // password: {
  //   type: String,
  //   trim: true,
  //   required: [true, "Please Enter Your Password"],
  //   select: false,
  // },

  Role: {
    type: String,
    trim: true,
    // required: [true, "Role is Required"],
  },
  OtpHash: {
    type: String,
    trim: true,
  },
  OtpExpire: {
    type: Date,
    trim: true,
  },
  CRTVerifyUser: {
    type: Boolean,
    trim: true,
    default: false,
  },
  OtpVerify: {
    type: Boolean,
    trim: true,
    default: false,
  },
  ContactNumber: {
    type: Number,
    trim: true,
    required: [true, "Please Enter Your Contact Number"],
  },
  FavouritePost: [
    {
      PostData: {
        PostId: {

          type: String,
          trim: true,
          ref: "PostDetail",
          required: true,
        },
      },
    },
  ],
},{ timestamps: true});
 
const Usermodel = mongoose.model("UserDetail", UserDetail);
export default Usermodel;
