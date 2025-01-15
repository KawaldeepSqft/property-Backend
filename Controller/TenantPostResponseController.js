 
import Tenant_PostResponseModel from "../Model/TenantPostResponseModel.js";
import PostModel from "../Model/postModel.js";
import { SendError } from "../Utils/error.js";
import Usermodel from "../Model/userModel.js";
import { response } from "express";

export const CreateTenant_PostResponse = async (req, res) => {
  try {
     const {PostData} = req.body;
      if(!PostData || !PostData.PostId ){
        let message = "Send Post Data";
        return SendError(res, 404, false, message, null);
      }
    // crate User querry document
    let finduser = await Usermodel.findById(req.userId);
    if (!finduser) {
      let message = "Internal Server Error";
      return SendError(res, 500, false, message, null);
    }

    let findPost = await PostModel.findById(PostData.PostId);

    if (!findPost) {
      let message = "Post is not Found";
      return SendError(res, 404, false, message, null);
    }

    if (String(findPost.CreatePostUser) === String(req.userId)) {
      let message = "You are not eligible Create this Response";
      return SendError(res, 404, false, message, null);
    }

    if (findPost.BasicDetails.PropertyAdType != "Rent") {
      let message = "Invalid Post type";
      return SendError(res, 404, false, message, null);
    }
    req.body.Tenant = req.userId;
    const Tenant_PostResponseDocument = new Tenant_PostResponseModel(req.body);

     

    //  Store Data in database
    const data = await Tenant_PostResponseDocument.save();

    if (!data) {
      let message = "Your Response not Create Try Again";
      return SendError(res, 500, false, message, null);
    }

    res.status(200).json({
      success: true,
      message: "Your Response Create Successfully",
    });
  } catch (error) {
 
    return SendError(res, 500, false, null, error);
  }
};

 
export const GetTenant_PostResponse = async (req, res) => {
  try {
 
    let mypost = await PostModel.find({ CreatePostUser: req.userId });
 
    let responses = await Promise.all(
      mypost.map(post =>
        Tenant_PostResponseModel.find({ "PostData.PostId": post._id })
      )
    );
    let myAllPostResponse = responses.flat();

    let message = "me Response find Successfully";
    return res
      .status(200)
      .json({ success: true, message, TenantResponse:myAllPostResponse });

 
  } catch (error) {
    
    return SendError(res, 500, false, null, error);
  }
};
