import express from "express";
import {
    CreateNotifyResponse
} from "../Controller/NotifyController.js";
import { checkFieldError } from "../Middelware/checkFielderror.js";
import { body } from "express-validator";
import { UserAuthenticate } from "../Middelware/userAuthenticate.js";
 

const Routes = express.Router();

// User Routes

Routes.post(
  "/create",
  body("Email", "Enter Your Valid Contact Number").isEmail(),
  checkFieldError,
  UserAuthenticate ,
  CreateNotifyResponse
);
 
 
export default Routes;
