import express from "express";
import {
  CreateBiddingFormCollection,
  GetAllBiddingDocument_AdminOwner,
  VerifyBid_AdminOwner,
} from "../Controller/BiddingFormController.js";
import { checkFieldError } from "../Middelware/checkFielderror.js";
import { UserAuthenticate } from "../Middelware/userAuthenticate.js";
import { authorizeRoles } from "../Middelware/Role.js";
import { body } from "express-validator";

const Routes = express.Router();

// User Routes

Routes.post(
  "/create",
  UserAuthenticate,
  checkFieldError,
  CreateBiddingFormCollection
);
Routes.get(
  "/get-bidding-data/:PostId",
  UserAuthenticate,
  authorizeRoles("Admin", "Owner"),
  GetAllBiddingDocument_AdminOwner
);
Routes.post("/bid/verify/:BidId",
  UserAuthenticate,
  authorizeRoles("Admin", "Owner"),
  VerifyBid_AdminOwner
);

export default Routes;
