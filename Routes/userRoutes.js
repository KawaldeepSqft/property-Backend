import express from "express";
import {
  getUserDetails,
  userLogout,
  AddFavouritePost,
  CreateOtpForRegisterUser,
  VerifyOtpCreteUser,
  CompleteUserProfile,
  editProfile,
  updateProfile,
  data,
  // SendSMS
} from "../Controller/userController.js";
import { checkFieldError } from "../Middelware/checkFielderror.js";
import { body } from "express-validator";
import { UserAuthenticate } from "../Middelware/userAuthenticate.js";
import { reportFormRequest } from "../Controller/reportController.js";

const Routes = express.Router();

Routes.post(
  "/create",
  body("Name", "Name is Required").notEmpty(),
  body("Role", "Role is Required").notEmpty(),
  body("email", "Enter Your Valid Email").isEmail(),
  body("ContactNumber", "Enter Your Valid Contact Number")
    .isMobilePhone()
    .isLength({ min: 10, max: 10 }),
  checkFieldError,
  CompleteUserProfile
);
Routes.post(
  "/genrate-otp",
  body("ContactNumber", "Enter Your Valid Contact Number")
    .isMobilePhone()
    .isLength({ min: 10, max: 10 }),
  checkFieldError,
  CreateOtpForRegisterUser
);

Routes.post(
  "/verify-otp",
  body("Otp", "Otp  Length is 6 Digit").isLength({ min: 6, max: 6 }),
  body("ContactNumber", "Enter Your Valid Contact Number")
    .isMobilePhone()
    .isLength({ min: 10, max: 10 }),
  checkFieldError,
  VerifyOtpCreteUser
);

// Routes.post("/login", LoginUser);
Routes.get("/data", UserAuthenticate, getUserDetails);

Routes.get("/logout", userLogout);
Routes.post("/add-favourite-post", UserAuthenticate, AddFavouritePost);

// Amit Routes
// Routes for edit user profile
Routes.post('/editProfile',
  body("ContactNumber","Enter Valid Contact Number")
.isMobilePhone()
.isLength({min:10,max:10}),
checkFieldError,
UserAuthenticate,
editProfile)
//Routes for update user profile
 
//Routes for update user profile
Routes.put(
  "/updateProfile",
    body("Otp", "Otp Length is digit ").isLength({ min: 6, max: 6 }),
    UserAuthenticate,
  updateProfile
);
// Routes.post("/sms",  SendSMS)

Routes.post("/report", UserAuthenticate, reportFormRequest);

Routes.get("/alldata",data)
    




export default Routes;
