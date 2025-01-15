import express from "express";
import { CreateScheduleVisit } from "../Controller/ScheduleVisitController.js";
import { checkFieldError } from "../Middelware/checkFielderror.js";
import { body } from "express-validator";
import { UserAuthenticate } from "../Middelware/userAuthenticate.js";

const Routes = express.Router();

// User Routes

Routes.post(
  "/create",
  // body("Email", "Enter Your Valid Email").isEmail(),
  // body("ContactNumber", "Enter Your Valid Contact Number").isMobilePhone().isLength({min:10 ,max:10}), 
   UserAuthenticate ,
  checkFieldError,
  CreateScheduleVisit
);

  export default Routes;
