// CreatePost
import { SendError } from "../Utils/error.js";
import PostModel from "../Model/postModel.js";
import Usermodel from "../Model/userModel.js";
import AdminAndOwnerModel from "../Model/AdminOwnerModel.js";
import BiddingFormmodel from "../Model/BiddingFormModel.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import { GetUserIdIfExit } from "../Utils/GetUserIdIfExit.js";
import ProjectNameModel from "../Model/ProjectNameModel.js";

export const CreatePost = async (req, res) => {
  let PostImage = [];
  let imageLink = [];

  try {
    // req.body._id="12k4Kk44"
    // let finduser = await Usermodel.findById(req.userId);
    let finduser = await Usermodel.findById(req.userId);
    let findadmin = await AdminAndOwnerModel.findById(req.userId);
    if (findadmin) {
      let message = `You are not Access this routes`;
      return SendError(res, 400, false, message, null);
    }

    if (!finduser) {
      let message = "Internal Server Error";
      return SendError(res, 500, false, message, null);
    }

    req.body.CreatePostUser = req.userId;

    req.body.BasicDetails = JSON.parse(req.body.BasicDetails);
    req.body.LocationDetails = JSON.parse(req.body.LocationDetails);
    req.body.PropertyDetails = JSON.parse(req.body.PropertyDetails);
    req.body.AreaDetails = JSON.parse(req.body.AreaDetails);
    req.body.FloorDetails = JSON.parse(req.body.FloorDetails);
    req.body.AmenitiesDetails = JSON.parse(req.body.AmenitiesDetails);
    req.body.PricingDetails = JSON.parse(req.body.PricingDetails);

    if (!req.files) {
      let message = "Image File is Required";
      return SendError(res, 500, false, message, null);
    }
    if (!req.files["PropertyImages"]) {
      let message = "Image File is Required";
      return SendError(res, 400, false, message, null);
    }

    if (req.files["PropertyImages"].length == undefined) {
      PostImage.push(req.files["PropertyImages"].tempFilePath);
    } else {
      PostImage = req.files["PropertyImages"].map((imagedata) => {
        return imagedata.tempFilePath;
      });
    }

    // Upload Image on Cloudnry

    for (let i = 0; i < PostImage.length; i++) {
      const postClound = await cloudinary.v2.uploader.upload(PostImage[i], {
        folder: "Post Folder",
        transformation: [
          {
            overlay: {
              font_family: "Arial",
              font_size: 30,
              text: "PropertyDekho247",
              font_weight: "bold",
            },
            gravity: "south_east",
            x: 10,
            y: 10,
            opacity: 50,
            color: "white",
          },
          {
            quality: "50",
          },
        ],
      });

      //  Image Name Store

      imageLink.push({
        name:
          req.files["PropertyImages"].length == undefined
            ? req.files["PropertyImages"].name
            : req.files["PropertyImages"][i].name,
        public_id: postClound.public_id,
        url: postClound.url,
      });
    }

    req.body.PropertyImages = imageLink;

    const Postdocument = new PostModel(req.body);

    // post save in database
    let CreatePost = await Postdocument.save();

    if (!CreatePost) {
      let message = "Post not Create";

      //  Delete Image in cloudinary

      if (imageLink.length > 0) {
        for (let i = 0; i < imageLink.length; i++) {
          await cloudinary.v2.uploader.destroy(imageLink[i].public_id);
        }
      }

      return SendError(res, 500, false, message, null);
    }

    let message = "Create Post Successfully";
    res.status(200).json({ success: true, message });
  } catch (error) {
    if (imageLink.length > 0) {
      for (let i = 0; i < imageLink.length; i++) {
        await cloudinary.v2.uploader.destroy(imageLink[i].public_id);
      }
    }

    return SendError(res, 500, false, null, error);
  }
};

export const UpdatePost = async (req, res) => {
  let PostImage = [];
  let imageLink = [];
  let RemovePost;
  try {
    const { postId } = req.params;

    let findPost = await PostModel.findById(postId);
    if (!findPost) {
      let message = "This Post is not find";
      return SendError(res, 404, false, message, null);
    }

    let findadmin = await AdminAndOwnerModel.findById(req.userId);
    if (!findadmin) {
      if (String(findPost.CreatePostUser) !== req.userId) {
        let message = "This Post is not Your Post";
        return SendError(res, 404, false, message, null);
      }
      if (findPost.BasicDetails.PropertyAdType == "Sale") {
        let message = "Sale Post is not update Contact to Management team";
        return SendError(res, 404, false, message, null);
      }
    }

    const {
      BasicDetails,
      LocationDetails,
      PropertyDetails,
      FloorDetails,

      AreaDetails,
      AmenitiesDetails,

      PricingDetails,
    } = req.body;
    // if (
    //   !BasicDetails ||
    //   !LocationDetails ||
    //   !PropertyDetails ||
    //   !FloorDetails ||
    //   !AreaDetails ||
    //   !AmenitiesDetails ||
    //   !PricingDetails
    // ) {
    //   let message = "Field is Missing";
    //   return SendError(res, 400, false, message, null);
    // }

    req.body.BasicDetails = JSON.parse(BasicDetails);
    req.body.LocationDetails = JSON.parse(LocationDetails);
    req.body.PropertyDetails = JSON.parse(PropertyDetails);
    req.body.FloorDetails = JSON.parse(FloorDetails);
    req.body.AreaDetails = JSON.parse(AreaDetails);
    req.body.AmenitiesDetails = JSON.parse(AmenitiesDetails);
    req.body.PricingDetails = JSON.parse(PricingDetails);

    // Remove Existing Photo

    if (!req.files) {
      if (req.body.PropertyImages) {
        let PropertyImages = JSON.parse(req.body.PropertyImages);
        if (PropertyImages.length < findPost.PropertyImages.length) {
          let imageNames = PropertyImages.map((item) => item.name);

          let filteredArray = findPost.PropertyImages.filter((item) => {
            if (imageNames.includes(item.name) == true) {
              (async () => {
                await cloudinary.v2.uploader.destroy(item.public_id);
                // Your code here
              })();
            }
            return !imageNames.includes(item.name);
          });

          req.body.PropertyImages = filteredArray;
        }
      }
    }

    //  Add new photo and remove old photo

    if (req.files) {
      if (req.body.PropertyImages) {
        let PropertyImages = JSON.parse(req.body.PropertyImages);

        let imageNames = PropertyImages.map((item) => item.name);
        let filteredArray = findPost.PropertyImages.filter((item) => {
          if (imageNames.includes(item.name) == true) {
            (async () => {
              await cloudinary.v2.uploader.destroy(item.public_id);
              // Your code here
            })();
          } else {
            return !imageNames.includes(item.name);
          }
        });

        RemovePost = filteredArray;
      }
      if (RemovePost) {
        imageLink = RemovePost;
      } else {
        imageLink = findPost.PropertyImages;
      }

      if (req.files["PropertyImages"].length == undefined) {
        // overwrite Single Image
        let filteredArray = imageLink.filter((item) => {
          if (item.name === req.files["PropertyImages"].name) {
            (async () => {
              await cloudinary.v2.uploader.destroy(item.public_id);
              // Your code here
            })();
          } else {
            return item.name !== req.files["PropertyImages"].name;
          }
        });
        imageLink = filteredArray;

        PostImage.push(req.files["PropertyImages"].tempFilePath);
      } else {
        let imageNames = req.files["PropertyImages"].map((item) => item.name);

        let filteredArray = imageLink.filter((item) => {
          if (imageNames.includes(item.name) == true) {
            (async () => {
              await cloudinary.v2.uploader.destroy(item.public_id);
            })();
          } else {
            return !imageNames.includes(item.name);
          }
        });

        imageLink = filteredArray;

        PostImage = req.files["PropertyImages"].map((imagedata) => {
          return imagedata.tempFilePath;
        });
      }

      for (let i = 0; i < PostImage.length; i++) {
        const postClound = await cloudinary.v2.uploader.upload(PostImage[i], {
          folder: "Post Folder",
          transformation: [
            {
              overlay: {
                font_family: "Arial",
                font_size: 30,
                text: "PropertyDekho247",
                font_weight: "bold",
              },
              gravity: "south_east",
              x: 10,
              y: 10,
              opacity: 50,
              color: "white",
            },
            {
              quality: "50",
            },
          ],
        });

        imageLink.push({
          name:
            req.files["PropertyImages"].length == undefined
              ? req.files["PropertyImages"].name
              : req.files["PropertyImages"][i].name,
          public_id: postClound.public_id,
          url: postClound.url,
        });
      }

      req.body.PropertyImages = imageLink;
    }
    //  req.body ==req.body
    //  findPost =req.body
    //   await findPost.save()
    // const updatepost = await PostModel.findByIdAndUpdate(postId, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    Object.keys(req.body).forEach((key) => {
      findPost[key] = req.body[key];
    });
    const updatepost = await findPost.save();
    if (!updatepost) {
      let message = "This Post is not updated";
      return SendError(res, 500, false, message, null);
    }
    let message = "Your Post is updated Successfully";
    res.status(200).json({ success: true, message });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// Delete Post

export const DeletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const findPost = await PostModel.findById(postId);

    if (!findPost) {
      let message = "This Post is not find";
      return SendError(res, 404, false, message, null);
    }

    //  deletePost in cloudinary

    for (let i = 0; i < findPost.PropertyImages.length; i++) {
      await cloudinary.v2.uploader.destroy(
        findPost.PropertyImages[i].public_id
      );
    }

    const deletePost = await PostModel.findByIdAndDelete(postId);

    if (!deletePost) {
      let message = "This Post is not Deleted";
      return SendError(res, 500, false, message, null);
    }

    let message = "This Post Deleted Successfully";
    res.status(200).json({ success: true, message });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

//  Get All Post Rent and Sale  This Post data show Frontend PostCard
export const GetAllPost = async (req, res) => {
  // const PostType = req.query.PostType;

  try {
    let keyword = req.query;

    if (keyword["LocationDetails.ProjectName"]) {
      const regex = new RegExp(
        `^${keyword["LocationDetails.ProjectName"]}$`,
        "i"
      );

      keyword["LocationDetails.ProjectName"] = regex;
    }
    if (!keyword["BasicDetails.PropertyAdType"]) {
      delete keyword["BasicDetails.PropertyAdType"];
    }
    if (!keyword["LocationDetails.ProjectName"]) {
      delete keyword["LocationDetails.ProjectName"];
    }
    if (!keyword["PropertyDetails.BHKType"]) {
      delete keyword["PropertyDetails.BHKType"];
    }
    if (!keyword["BasicDetails.ApartmentType"]) {
      delete keyword["BasicDetails.ApartmentType"];
    }
    if (!keyword["BasicDetails.PropertyStatus"]) {
      delete keyword["BasicDetails.PropertyStatus"];
    }
    if (!keyword["AmenitiesDetails.Furnishing"]) {
      delete keyword["AmenitiesDetails.Furnishing"];
    }
    if (
      !keyword["LocationDetails.ProjectName"] ||
      !keyword["BasicDetails.PropertyAdType"]
    ) {
      let message =
        "Project Name Add PropertyAdType is Required For Search Property";
      return SendError(res, 404, false, message, null);
      // return res.status(404).json({ success: false });
    }
    
    keyword.PostVerify = true;

    let GetAllPost = await PostModel.find(keyword).populate(
      "CreatePostUser",
      "name"
    );

    let message = "Get All Post Post Successfully";
    return res
      .status(200)
      .json({ success: true, message, allPost: GetAllPost });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// Get Login All User Post

export const GetLoginUserPost = async (req, res) => {
  try {
    const loginUserPost = await PostModel.find({ CreatePostUser: req.userId });

    let message = "Get Login User All Post Successfully";
    res.status(200).json({ success: true, message, Post: loginUserPost });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// Get Single User Post

export const GetSinglePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const findPost = await PostModel.findById(postId);
    if (!findPost) {
      let message = "This Post is not find";
      return SendError(res, 404, false, message, null);
    }

    if (findPost.BasicDetails.PropertyAdType == "Sale") {
      let UserBid = await BiddingFormmodel.find({
        "PostData.PostId": postId,
        BidVerify: true,
      })
        .sort({ BidPrice: -1 })
        .exec();
      let BidData = {
        NumberOfBid: UserBid.length,
        BidHighPrice: UserBid[0]?.BidPrice,
      };

      let message = "Single Post Find";
      return res
        .status(200)
        .json({ success: true, message, SinglePost: findPost, BidData });
    } else {
      let message = "Single Post Find";
      return res.status(200).json({
        success: true,
        message,
        SinglePost: findPost,
      });
    }

    // const userId = GetUserIdIfExit(req);

    // const find_admin_owner = await AdminAndOwnerModel.findById(userId);

    // if (
    //   userId &&find_admin_owner &&(find_admin_owner.OwnerVerify || find_admin_owner.AdminVerify)
    // ) {
    //   let BiddingDocument = await BiddingFormmodel.find({
    //     "PostData.PostId": postId,
    //   })
    //     .populate("")
    //     .populate("Biddinguser", "Name email Role ContactNumber")
    //     // .populate("PostData.PostId", "ReservePrice")
    //     .sort({ BidPrice: -1 })
    //     .exec();
    //   let message = "Single Post Find";

    //   return res.status(200).json({
    //     success: true,
    //     message,
    //     SinglePost: findPost,
    //     BiddingDocument,
    //   });
    // }
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// Get all Post include aprove and not aprove
// Get Rent and Sale post

export const GetAllPost_AdminOwner = async (req, res) => {
  try {
    const GetAllPost = await PostModel.find(req.query).populate("PostVerifyData.PostVerifyUser", "Name").populate("CreatePostUser", "Name ContactNumber");
      
    // const GetAllPost = await PostModel.find(req.query).populate("PostVerifyData.PostVerifyUser", "name").populate("CreatePostUser", "Name email ContactNumber")  
// console.log(GetAllPost, "get All");


    let message = "User All Post Successfully";
    res.status(200).json({ success: true, message, Post: GetAllPost });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// Verify Post

export const VerifyPost_AdminOwner = async (req, res) => {
  try {
    const { PostVerify } = req.body;
    const { postId } = req.params;

    if (PostVerify == undefined) {
      let message = "Send Post Verification Data";
      return SendError(res, 404, false, message, null);
    }

    const findPost = await PostModel.findById(postId);
    if (!findPost) {
      let message = "PostData Not Found";
      return SendError(res, 404, false, message, null);
    }

    // findPost.PostVerify = PostVerify ;

    let PostVerifyData = { PostVerifyUser: req.userId };
    if (PostVerify) {
      PostVerifyData.Time = Date.now();
    }

    let updateData = {
      PostVerify,
      PostVerifyData,
    };

    if (PostVerify && findPost.PostExpired?.ExpiredStatus == true) {
      let message = "This Post is Expired Firstly Recall This Post";
      return SendError(res, 404, false, message, null);
    }

    if (!PostVerify && findPost.PostExpired?.ExpiredStatus == true) {
      let message =
        "Please Refresh Page This Post is Expired and allready Mark un-Verify";
      return SendError(res, 404, false, message, null);
    }

    const updatepost = await PostModel.findByIdAndUpdate(postId, updateData, {
      new: true,
      runValidators: true,
    });
    // let updatepost = await findPost.save();
    if (!updatepost) {
      let message = "Post is not verify";
      return SendError(res, 404, false, message, null);
    }

    let message = `Post ${PostVerify ? "Active" : "Un-Active"} SuccessFully`;
    return res.status(200).json({ success: true, message });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// Get All Project Name

export const GetProjectName = async (req, res) => {
  try {
    const AllProjectName = await ProjectNameModel.find();

    let message = "Get All Project Name Successfully";
    res
      .status(200)
      .json({ success: true, message, AllProjectName: AllProjectName });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// Get Single Project Name

export const GetSinglePostProjectName = async (req, res) => {
  try {
    const { ProjectName } = req.body;
 
    const SingleProjectNameData = await ProjectNameModel.findOne({
      "Project Name": { $regex: `^\\s*${ProjectName.trim()}\\s*$`, $options: "i" },
    });
    
  // console.log(SingleProjectNameData)
    if (!SingleProjectNameData) {
      let message = "Single Project Name Data Not Found";
      return SendError(res, 404, false, message, null);
    }
    let message = "Single Project Name Data Find Successfully";
    res.status(200).json({
      success: true,
      message,
      SingleProjectName: SingleProjectNameData,
    });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// Re-Open Post

export const ReOpenPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const findPost = await PostModel.findById(postId);
    if (!findPost) {
      let message = "PostData Not Found";
      return SendError(res, 404, false, message, null);
    }

    if (!findPost.PostExpired?.ExpiredStatus) {
      let message = "This Post is Not Expired";
      return SendError(res, 404, false, message, null);
    }

    const updateData = {
      PostExtend: { PostExtendStatus: true, PostExtendTime: Date.now() },
      $unset: { PostExpired: {} },
    };

    const updatepost = await PostModel.findByIdAndUpdate(postId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatepost) {
      let message = "Post is not ReOpen";
      return SendError(res, 404, false, message, null);
    }
    let message = "ReOpen Post Successfullly";
    return res.status(200).json({ success: true, message });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};
