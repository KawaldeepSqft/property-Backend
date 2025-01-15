import mongoose from "mongoose";
const ScheduleVisit = mongoose.Schema({
  // Name: {
  //   type: String,
  //   trim: true,
  //   required: [true, "Please Enter Your Name"],
  // },
  // Email: {
  //   type: String,
  //   trim: true,
  //   required: [true, "Please Enter Your Email"],
  // },
  // ContactNumber: {
  //   type: Number,
  //   trim: true,
  //   required: [true, "Please Enter Your Contact Number"],
  // },
  PostData: {
    PostId: {
      type: String,
      trim: true,
      ref: "PostDetail",
      required: true,
    },
  
  },

  VisitUser: {
    type: mongoose.Schema.ObjectId,
    trim: true,
    ref: "UserDetail",
    required: true,
  },

  VisitDate: {
    type: Date,
    trim: true,
    required: [true, "Please Enter Vist Date"],
    validate: (value) => {
      if (value) {
        const selectedDate = new Date(value);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        if (selectedDate < currentDate) {
          throw new Error("Enter a Valid Date (today or in the future)");
        }
      }
    },
  },
  VisitTime: {
    From: {
      type: String,
      trim: true,
      required: [true, "Please Enter Visit Time"],
    },

    To: {
      type: String,
      trim: true,
      required: [true, "Please Enter Visit Time"],
    },
  },

  VisitStatusData: {
    Status: {
      type: String,
      trim: true,
      enum: ["Re-Plan", "Done", "Plan"],
      default: "Plan",
    },
    Admin: {
      type: mongoose.Schema.ObjectId,
      trim: true,
      ref: "AdminAndOwnerDetail",
    },
    Time: {
      type: Date,
      trim: true,
      default: undefined,
    },
  },

  createAt: {
    type: Date,
    trim: true,
    default: Date.now(),
  },
});
const ScheduleVisitModel = mongoose.model("ScheduleVisit", ScheduleVisit);
export default ScheduleVisitModel;
