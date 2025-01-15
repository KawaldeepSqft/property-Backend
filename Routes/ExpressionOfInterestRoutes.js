import express from "express";
import {
    CreateExpressionOfInterest
} from "../Controller/ExpressionOfInterestController.js";
import { checkFieldError } from "../Middelware/checkFielderror.js";
import { body } from "express-validator";
 

const Routes = express.Router();

// User Routes

Routes.post(
  "/create",
  body("Email", "Enter Your Valid Email").isEmail(),
  body("ContactNumber", "Enter Your Valid Contact Number").isMobilePhone().isLength({min:10 ,max:10}),
  checkFieldError,
  CreateExpressionOfInterest
);
 
 
export default Routes;
