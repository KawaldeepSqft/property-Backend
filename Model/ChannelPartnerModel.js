import mongoose from "mongoose";
const ChannelPartner = mongoose.Schema({
  Name: {
    type: String,
    trim: true,
    required: [true, "Please Enter Your Name"],
  },
  ContactNumber: {
    type: Number,
    trim: true,
    required: [true, "Please Enter Your Contact Number"],
  },
  Email: {
    type: String,
    trim: true,
    required: [true, "Please Enter Your Email"],
  },

  CompanyName: {
    type: String,
    trim: true,
    required: [true, "Please Enter Your CompanyName"],
  },
  AcceptPolicy: {
    type: Boolean,
    trim: true,
    required: [true, "Accept Terms & Conditions"],
    validate: (value) => {
      if (value === false) {
        throw new Error("Accept Terms & Conditions");
      }
    },
  },
  WhatsAppUpdate: {
    type: Boolean,
    trim: true,

  },
  createAt: {
    type: Date,
    trim: true,
    default: Date.now(),
  },
});
const ChannelPartnerModel = mongoose.model("ChannelPartner", ChannelPartner);
export default ChannelPartnerModel;
