import mongoose from "mongoose";
const BiddingForm = mongoose.Schema({
 

  BidPrice: {
    type: Number,
    trim: true,
    required: [true, "Please Enter Your BidPrice"],
  },

  images: [
    {
      name: {
        type: String,
        trim: true,
        required: true,
      },
      public_id: {
        type: String,
        trim: true,
        required: true,
      },
      url: {
        type: String,
        trim: true,
        required: true,
      },
    },
  ],

  BidVerify: {
    type: Boolean,
    trim: true,
    default: false,
  },
  PostData :{
    PostId: {
      type: String,
      trim: true,
      ref: "PostDetail",
      required: true,
    },
    
    
    
     

     
  },

 

  Biddinguser: {
    type: mongoose.Schema.ObjectId,
    trim: true,
    ref: "UserDetail",
    required: true,
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
const BiddingFormmodel = mongoose.model("ReceiveOffer", BiddingForm);
export default BiddingFormmodel;
