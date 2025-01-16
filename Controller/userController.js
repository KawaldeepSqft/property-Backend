import { SendError } from "../Utils/error.js";
import Usermodel from "../Model/userModel.js";
import AdminAndOwnerModel from "../Model/AdminOwnerModel.js";
import PostModel from "../Model/postModel.js";
import crypto from "crypto";
// import { SendEmail } from "../Utils/SendEmail.js";
import { SendSMS } from "../Utils/SendSms.js";
import { CreteTokenAndSTore } from "../Utils/CreateJwt.js";
// import fetch from "node-fetch";
// Create Otp and save
export const CreateOtpForRegisterUser = async (req, res) => {
  const { ContactNumber } = req.body;
  let CreateOtpDocument;
  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
    const OtpHash = crypto
      .createHash("sha256", process.env.OTP_SECRET)
      .update(otp.toString()) // Convert OTP to string before hashing
      .digest("hex");
    console.log(otp);
    const Documnet = {
      ContactNumber: ContactNumber,
      OtpHash: OtpHash,
      OtpExpire: Date.now() + 3 * 60 * 1000, // OTP valid for 3 minutes
      OtpVerify: false,
    };

    let finduser = await Usermodel.findOne({
      ContactNumber: ContactNumber,
    });
    // let data;
    if (finduser) {
      // finduser.ContactNumber = Documnet.ContactNumber;
      finduser.OtpHash = Documnet.OtpHash;
      finduser.OtpExpire = Documnet.OtpExpire;
      finduser.OtpVerify = Documnet.OtpVerify;
      CreateOtpDocument = await finduser.save();
    } else {
      let UserDocument = new Usermodel(Documnet);
      CreateOtpDocument = await UserDocument.save();
    }

    let SmsMessage = `${otp} is your OTP to continue on PropertyDekho247 (a unit of Propfuture AI Technologies) - Propertydekho247`; // Your SMS content

    let response = await SendSMS(
      ContactNumber,
      SmsMessage,
      process.env.DLT_TEMP_ID
    );

    if (!response.ok) {
      await Usermodel.findOneAndDelete({
        _id: CreateOtpDocument._id,
        CRTVerifyUser: false,
      });
      let message = `HTTP error! Status: ${response.status}`;
      return SendError(res, 500, false, message, null);
      // throw new Error();
    }
    const data = await response.json();

    if (data.code != 200) {
      await Usermodel.findOneAndDelete({
        _id: CreateOtpDocument._id,
        CRTVerifyUser: false,
      });
      let message = `Otp Not Send This Region - ${data.status} status code - ${data.code}`;
      return SendError(res, 500, false, message, null);
    }

    res.status(200).json({
      success: true,
      UserProfileCreateOtp: true,
      OtpExpire: CreateOtpDocument.OtpExpire,
      message: `OTP has been sent to this ContactNumber: ${ContactNumber}`,
    });
  } catch (error) {
    if (CreateOtpDocument) {
      await Usermodel.findOneAndDelete({
        _id: CreateOtpDocument._id,
        CRTVerifyUser: false,
      });
    }
    return SendError(res, 500, false, null, error);
  }
};

// Verify Otp and check user is registered | Login User
export const VerifyOtpCreteUser = async (req, res) => {
  try {
    const { ContactNumber, Otp } = req.body;
    let finduser = await Usermodel.findOne({
      ContactNumber,
    });
    if (!finduser) {
      let message = "Your Data is not Found";
      return SendError(res, 400, false, message, null);
    }
    const OtpHash = crypto
      .createHash("sha256", process.env.OTP_SECRET)
      .update(Otp.toString())
      .digest("hex");
    let verifyopt = await Usermodel.findOne({
      ContactNumber: ContactNumber,
      OtpHash: OtpHash,
    });
    if (!verifyopt) {
      let message = "You have entered an invalid OTP";
      return SendError(res, 500, false, message, null);
    }
    if (verifyopt.OtpExpire <= new Date(Date.now())) {
      let message = "This OTP has expired. Please request a new one.";
      return SendError(res, 500, false, message, null);
    }
    verifyopt.OtpHash = undefined;
    verifyopt.OtpExpire = undefined;
    verifyopt.OtpVerify = true;

    let verifyuser = await verifyopt.save();
    if (!verifyuser) {
      let message = "Internal Server Error. Please try again.";
      return SendError(res, 500, false, message, null);
    }
    let IsExitUser = await Usermodel.findOne({
      ContactNumber: ContactNumber,
      CRTVerifyUser: true,
    });
    if (IsExitUser) {
      CreteTokenAndSTore(verifyopt._id, res);
      res.status(200).json({
        success: true,
        LoginVerifyOtp: true,
        message: `${IsExitUser.Name} Your OTP is verified and login is successful.`,
      });
    } else {
      res.status(200).json({
        success: true,
        CreateUserProfileVerifyOtp: true,
        message: `Your OTP is verified. Please create your profile.`,
      });
    }
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// If user is not registered, create profile
export const CompleteUserProfile = async (req, res) => {
  try {
    const { Name, email, Role, ContactNumber } = req.body;

    let isUserCompleteProfile = await Usermodel.findOne({
      ContactNumber: req.body.ContactNumber,
      CRTVerifyUser: true,
    });

    if (isUserCompleteProfile) {
      let message = "Your profile has already been created.";
      return SendError(res, 400, false, message, null);
    }
    let finduser = await Usermodel.findOne({
      ContactNumber: ContactNumber,
      OtpVerify: true,
    });

    if (!finduser) {
      let message = "ContactNumber is not verified.";
      return SendError(res, 400, false, message, null);
    }
    let ifExitEmail = await Usermodel.findOne({
      email: email,
      CRTVerifyUser: true,
    });
    if (ifExitEmail) {
      let message = "This Email is Allready Exit";
      return SendError(res, 400, false, message, null);
    }
    finduser.Name = Name;
    finduser.Role = Role;
    finduser.email = email;
    finduser.CRTVerifyUser = true;

    const data = await finduser.save();

    if (!data) {
      let message = "Internal Server Error.";
      return SendError(res, 500, false, message, null);
    }

    CreteTokenAndSTore(data._id, res);
    res.status(200).json({
      UserCompleteProfile: true,
      success: true,
      message: `${data.Name} - Your profile was created successfully.`,
    });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// Get User Details, Admin Details, and Owner Details
export const getUserDetails = async (req, res) => {
  try {
    let user = await Usermodel.findById(req.userId).populate(
      "FavouritePost.PostData.PostId"
    );

    let adminOwner = await AdminAndOwnerModel.findById(req.userId);

    if (!user && !adminOwner) {
      let message = "Internal Server Error (user not found)";
      return res
        .status(500)
        .json({ success: false, message, IsAuthenticated: false });
    }

    let message = "Your data was found successfully.";
    if (user) {
      res
        .status(200)
        .json({ success: true, message, user, IsAuthenticated: true });
    }
    if (adminOwner) {
      res.status(200).json({
        success: true,
        message,
        user: adminOwner,
        IsAuthenticated: true,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: error.message, IsAuthenticated: false });
  }
};
// User Logout || Admin and Owner Logout
export const userLogout = async (req, res) => {
  try {
    res.clearCookie("token");
    let message = "You have been logged out successfully.";
    res.status(200).json({ success: true, message: message });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};
export const AddFavouritePost = async (req, res) => {
  try {
    let user = await Usermodel.findById(req.userId);
    const { PostData } = req.body;
    if (!user) {
      let message = "Internal Server Error.";
      return res
        .status(500)
        .json({ success: false, message, IsAuthenticated: false });
    }
    if (!PostData || !PostData.PostId) {
      let message = "Send Post Data.";
      return SendError(res, 404, false, message, null);
    }
    let findPost = await PostModel.findById(PostData.PostId);
    if (!findPost) {
      let message = "Post not found.";
      return SendError(res, 404, false, message, null);
    }
    // Check if the post is already in the user's favourites
    const isAlreadyFavourite = user.FavouritePost.some(
      (fav) => String(fav.PostData.PostId) === String(PostData.PostId)
    );
    // Add or remove the post from favourites
    if (isAlreadyFavourite) {
      user.FavouritePost = user.FavouritePost.filter(
        (fav) => String(fav.PostData.PostId) !== String(PostData.PostId)
      );
    } else {
      user.FavouritePost.push({ PostData });
    }
    const AddFavourite = await Usermodel.findByIdAndUpdate(
      req.userId,
      { FavouritePost: user.FavouritePost },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!AddFavourite) {
      let message = "Internal Server Error. Please try again.";
      return SendError(res, 500, false, message, null);
    }
    let message = `Post marked as ${
      !isAlreadyFavourite ? "Favourite" : "U-Favourite"
    } successfully.`;
    res.status(200).json({ success: true, message: message });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// Amit code start form here

export const editProfile = async (req, res) => {
  try {
    const id = req.userId;
    const { ContactNumber } = req.body;

    if (!id || !ContactNumber) {
      let message = "Please provide Contact Number";
      return res
        .status(400)
        .json({ success: false, message, IsAuthenticated: false });
    }
    // Fetch all users
    const userDetail = await Usermodel.findOne({ _id: id });
    if (!userDetail || userDetail.length === 0) {
      let message = "User Not found!";
      return res
        .status(400)
        .json({ success: false, message, IsAuthenticated: false });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    const OtpHash = crypto
      .createHash("sha256", process.env.OTP_SECRET)
      .update(otp.toString()) // Convert OTP to string before hashing
      .digest("hex");

    let SmsMessage = `${otp} is your OTP to continue on PropertyDekho247 (a unit of Propfuture AI Technologies) - Propertydekho247`; // SMS content

    // Send OTP via SMS
    const response = await SendSMS(
      ContactNumber,
      SmsMessage,
      process.env.DLT_TEMP_ID
    );
    if (response.status !== 200) {
      let message = `HTTP error with status code: ${response.status}!`;
      return SendError(res, 500, message);
    }

    // Save OTP in the database with expiration time (3 minutes)
    const Document = {
      OtpHash: OtpHash,
      OtpExpire: Date.now() + 3 * 60 * 1000, // OTP valid for 3 minutes
      OtpVerify: false,
    };

    const data = await Usermodel.findByIdAndUpdate({ _id: id }, Document);

    // If OTP is saved successfully

    if (data) {
      let message = "Check Your mobile number for the OTP";
      return res.status(200).json({ success: true, message });
    } else {
      let message = "Failed to update the user details";
      return SendError(res, 500, false, message, null);
    }
  } catch (err) {
    return SendError(res, 500, false, null, err);
  }
};

// export const updateProfile = async (req, res) => {
//   try {
//     const id = req.userId;
//     const { Otp, ContactNumber, email, Name } = req.body;
//     console.log("body", req.body);

//     if (!Otp || !ContactNumber || !email || !Name) {
//       let message = "Please provide Contact Number";
//       return res
//         .status(400)
//         .json({ success: false, message,});
//     }

//     let OtpHash;
//     if (Otp) {
//       OtpHash = crypto
//         .createHash("sha256", process.env.OTP_SECRET)
//         .update(Otp.String())
//         .digest("hex");

//       const verifyOtp = await Usermodel.findOne({ _id: id, OtpHash: OtpHash });
// console.log(verifyOtp)
//       if (!verifyOtp) {
//         let message = "Please provide the correct otp !";

//         return SendError(res, 400, message, null, err);
//       }
//     }
//     const Document = {
//       ContactNumber,
//       email,
//       Name,
//       OtpHash,
//     };

//     console.log("Doumet", Document);

//     //  update number
//     const data = await Usermodel.findByIdAndUpdate({ _id: id }, Document);

//     if (data) {
//       let message = "Your Profile successfully updated !";
//       res.status(200).json({ success: true, message });
//     }
//   } catch (err) {
//     return SendError(res, 500, message, null, err);
//   }
// };



export const updateProfile=async(req,res)=>{
  try {
     
    const id=req.userId;
    const{Otp,ContactNumber,email,Name}=req.body;
  // console.log(req.body,id)
    if(!Otp || !ContactNumber || !email || !Name){
      let message = "Please provide Contact Number";
      return res.status(400).json({ success: false, message, IsAuthenticated: false });
    }

// console.log(id,Otp)

let OtpHash;
if(Otp){
    OtpHash = crypto
    .createHash("sha256", process.env.OTP_SECRET)
    .update(Otp)
    .digest("hex");

    const verifyOtp=await Usermodel.findOne({ _id:id , OtpHash:OtpHash})
      // console.log(verifyOtp,"fh")
 if(!verifyOtp){
  let message="Please provide the correct otp !";
  // console.log("ddjfnkj")
  return SendError(res,400,message,null,err)

 }
}
const Document = {
  ContactNumber,
  email,
  Name,
  OtpHash
};
// console.log(Document ,"hello");

//  update number
const data=await Usermodel.findByIdAndUpdate({_id:id},Document)
// console.log(data,"done")
if(data){
  let message='Your Profile successfully updated !'
  res.status(200).json({success: true, message})
}
  } catch (err) {
    return SendError(res,500,message,null,err)
  }
}

export const data=async(req,res)=>{
  res.send("hello i am start")
}