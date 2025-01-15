import express from "express";

import { CreatePostPropertyRequirement } from "../Controller/PostPropertyRequirementController.js";
import { checkFieldError } from "../Middelware/checkFielderror.js";
import { body } from "express-validator";
import { UserAuthenticate } from "../Middelware/userAuthenticate.js";

const Routes = express.Router();

// User Routes

Routes.post("/create", UserAuthenticate, CreatePostPropertyRequirement);

export default Routes;
