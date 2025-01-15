import express from "express";

import {
  CreateOtpForAdmin_Onwer,
  VerifyOtpCreteAdmin_Owner,
  LoginAdmin_Owner,
  VerifyOtpForLoginAdmin_Owner,
  GetAllAdmin,
  VerifyAdmin,
  updateAdmin,
  RemoveAssignedProperty,
} from "../Controller/AdminOwnerController.js";

import {
  // AddPrice,
  GetAllPost_AdminOwner,
  ReOpenPost,
  VerifyPost_AdminOwner,
} from "../Controller/postController.js";

import { checkFieldError } from "../Middelware/checkFielderror.js";
import { body } from "express-validator";
import { UserAuthenticate } from "../Middelware/userAuthenticate.js";
import { authorizeRoles } from "../Middelware/Role.js";
import {
  GetAllScheduleVisit_AdminOwner,
  ScheduleVisitDone_AdminOwner,
} from "../Controller/ScheduleVisitController.js";

const Routes = express.Router();

Routes.post(
  "/create/generate-otp",
  body("Name", "Name is Required").notEmpty(),
  body("ContactNumber", "Enter Your Valid Contact Number").isMobilePhone().isLength({ min: 10, max: 10 }),
  checkFieldError,
  CreateOtpForAdmin_Onwer
);
Routes.post(
  "/create/verify-otp",
  body("Otp", "Otp  Length is 6 Digit").isLength({ min: 6, max: 6 }),
  body("ContactNumber", "Enter Your Valid Contact Number").isMobilePhone().isLength({ min: 10, max: 10 }),
  checkFieldError,
  VerifyOtpCreteAdmin_Owner
);
Routes.post(
  "/login",
  body("ContactNumber", "Enter Your Valid Contact Number").isMobilePhone().isLength({ min: 10, max: 10 }),
  checkFieldError,
  LoginAdmin_Owner
);

Routes.post(
  "/login/verify-otp",
  body("Otp", "Otp  Length is 6 Digit").isLength({ min: 6, max: 6 }),
  body("ContactNumber", "Enter Your Valid Contact Number").isMobilePhone().isLength({ min: 10, max: 10 }),
  checkFieldError,
  VerifyOtpForLoginAdmin_Owner
);

// This is only Owner Routes
Routes.get(
  "/admin-data",
  UserAuthenticate,
  authorizeRoles("Owner"),
  GetAllAdmin
);
Routes.post(
  "/admin-verify/:adminId",
  UserAuthenticate,
  authorizeRoles("Owner"),
  VerifyAdmin
);
Routes.get(
  "/all-post",
  UserAuthenticate, authorizeRoles("Admin", "Owner"),GetAllPost_AdminOwner
);
Routes.post(
  "/verify-post/:postId",
  UserAuthenticate,
  authorizeRoles("Admin", "Owner"),
  VerifyPost_AdminOwner
);
Routes.put(
  "/reopen-post/:postId",
  UserAuthenticate,
  authorizeRoles("Admin", "Owner"),
  ReOpenPost
);

Routes.get(
  "/all-schedulevisits/:PostId",
  UserAuthenticate,
  authorizeRoles("Admin", "Owner"),
  GetAllScheduleVisit_AdminOwner
);
Routes.post(
  "/schedulevisit/status/:VisitId",
  UserAuthenticate,
  authorizeRoles("Admin", "Owner"),
  ScheduleVisitDone_AdminOwner
);

Routes.put("/updated-propertyId/:adminId",UserAuthenticate, authorizeRoles("Admin", "Owner"),updateAdmin)
Routes.put("/remove-propertyId",UserAuthenticate, authorizeRoles("Admin", "Owner"),RemoveAssignedProperty)
// Routes.post("/find/:adminId",findAdminproperty)
export default Routes;
