import PostPropertyRequirementModel from "../Model/PostPropertyRequirementModel.js";
import Usermodel from "../Model/userModel.js";

import { SendError } from "../Utils/error.js";

export const CreatePostPropertyRequirement = async (req, res) => {
  try {
    let finduser = await Usermodel.findById(req.userId);
    if (!finduser) {
      let message = "Internal Server Error";
      return SendError(res, 500, false, message, null);
    }
    req.body.RequirementUser = req.userId;
    const PostPropertyRequirementDocument = new PostPropertyRequirementModel(
      req.body
    );
    //  Store Data in database
    const data = await PostPropertyRequirementDocument.save();

    if (!data) {
      let message = "Requirement is not Create";
      return SendError(res, 500, false, message, null);
    }

    res.status(200).json({
      success: true,
      message: "Your from is submit successfully",
    });
  } catch (error) {
    console.log(error);
    return SendError(res, 500, false, null, error);
  }
};
