import mongoose from "mongoose";
 
const ExpressionOfInterest = mongoose.Schema({
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

  Message: {
    type: String,
    trim: true,
    required: [true, "Please Enter Your message"],
    minlength: [10, "At-least Enter minimum 10 characters"],
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
const ExpressionOfInterestmodel = mongoose.model("ExpressionOfInterest", ExpressionOfInterest);
export default ExpressionOfInterestmodel;
