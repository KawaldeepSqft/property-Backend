import BiddingFormmodel from "../Model/BiddingFormModel.js";
import Usermodel from "../Model/userModel.js";
import { SendError } from "../Utils/error.js";
import cloudinary from "cloudinary";
import PostModel from "../Model/postModel.js";
import { SendEmail } from "../Utils/SendEmail.js";
import { SendSMS } from "../Utils/SendSms.js";

export const CreateBiddingFormCollection = async (req, res) => {
  let BiddingImage = [];
  let imageLink = [];

  try {
    req.body = JSON.parse(req.body.BiddingFormData);
    const { PostData } = req.body;
    // const fndUserExitAllBid = await BiddingFormmodel.find({PostData ,BidVerify:true})

    if (!PostData || !PostData.PostId) {
      let message = "Send Post Data";
      return SendError(res, 404, false, message, null);
    }
    // Get LOgin User Details
    let finduser = await Usermodel.findById(req.userId);
    if (!finduser) {
      let message = "Internal Server Error";
      return SendError(res, 500, false, message, null);
    }

    req.body.Biddinguser = req.userId;
    let findPost = await PostModel.findById(PostData.PostId).populate(
      "CreatePostUser",
      "email Name ContactNumber"
    );
  
    if (!findPost) {
      let message = "Post is not Found";
      return SendError(res, 404, false, message, null);
    }
     if(!findPost.PostVerify){
      let message = " This Post is not Active";
      return SendError(res, 404, false, message, null);
     }
    if (findPost.BasicDetails.PropertyAdType != "Sale") {
      let message = "Invalid Post type";
      return SendError(res, 404, false, message, null);
    }

    if (!req.files) {
      let message = "Image File is Required";
      return SendError(res, 500, false, message, null);
    }
    if (!req.files["images"]) {
      let message = "Image File is Required";
      return SendError(res, 400, false, message, null);
    }

    if (req.files["images"].length == undefined) {
      BiddingImage.push(req.files["images"].tempFilePath);
    } else {
      BiddingImage = req.files["images"].map((imagedata) => {
        return imagedata.tempFilePath;
      });
    }

    for (let i = 0; i < BiddingImage.length; i++) {
      const BidClound = await cloudinary.v2.uploader.upload(BiddingImage[i], {
        folder: "BiddingImage",
        transformation: [
          //   {
          //     overlay: {
          //       font_family: "Arial",
          //       font_size: 30,
          //       text: "Square feet Prop",
          //       font_weight: "bold",
          //     },
          //     gravity: "south_east",
          //     x: 10,
          //     y: 10,
          //     opacity: 50,
          //     color: "white",
          //   },
          {
            quality: "50",
          },
        ],
      });

      //  Image Name Store

      imageLink.push({
        name:
          req.files["images"].length == undefined
            ? req.files["images"].name
            : req.files["images"][i].name,
        public_id: BidClound.public_id,
        url: BidClound.url,
      });
    }
    req.body.images = imageLink;
    // let data

    // if(getBiddingDocument){
    //    req.body.BidVerify =false
    //    req.body.createAt = new Date(Date.now())
    //    Object.assign(getBiddingDocument, req.body);
    //
    //   data = await getBiddingDocument.save();
    // } else{
    const BiddingDocument = new BiddingFormmodel(req.body);

    //  Store Data in database
    let CreateBidData = await BiddingDocument.save();
    // }

    if (!CreateBidData) {
      if (imageLink.length > 0) {
        for (let i = 0; i < imageLink.length; i++) {
          await cloudinary.v2.uploader.destroy(imageLink[i].public_id);
        }
      }
      let message = "Query is not Create";
      return SendError(res, 500, false, message, null);
    }

    let FullPropertyAddresh = `${`${findPost.PropertyDetails.BHKType} BHK`} ${
      findPost.BasicDetails.ApartmentType
    } for ${findPost.LocationDetails.ProjectName} , ${findPost.LocationDetails.Landmark} ${findPost.LocationDetails.City}`;

    const PropertyOwnerEmailSubject = "Offer Received on Your Property";

    let MaskContactnumber = (ContactNumber) => {
      const phoneStr = ContactNumber.toString();
      return phoneStr.slice(0, 2) + "XXXX" + phoneStr.slice(6);
    };
    const formatBidPrice = (price) => {
      if (price >= 10000000) {
        return `₹ ${(Math.floor(price / 100000) / 100).toFixed(2)} Cr`;
      } else if (price >= 100000) {
        return `₹ ${(Math.floor(price / 1000) / 100).toFixed(2)} L`;
      } else if (price >= 1000) {
        return `₹ ${(Math.floor(price / 10) / 100).toFixed(2)} K`;
      } else {
        return `₹ ${price.toFixed(2)}`;
      }
    };
    const PropertyOwnerEmailData = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Offer Received - Notification</title>
   <style>
      *{ margin: 0;
        padding: 0;}
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f9f9f9;
        color: #111;
        
      }
      .email-container {
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 20px;
        padding-top :10px;
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
      .header h1 {
        color: #4caf50;
      }
      .content {
        line-height: 1.6;
      }
      .content p {
        margin: 10px 0;
      }
      .highlight {
        font-weight: bold;
      }
      .footer {
        margin-top: 20px;
   
        font-size: 14px;
        color: #666;
      }
      .footer p:nth-child(2){
             margin: 10px 0;
        }
        .footer p:last-child{
        margin: 10px 0;
       }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="content">
        <p>Dear Owner,</p>

        <p>Greetings of the day!!</p>

        <p>
          You have received an offer on your property listed with
          PropertyDekho247,
          <span class="highlight"
            > ${FullPropertyAddresh}</span
          >
          (Property ID: <span class="highlight">${findPost._id}</span>).
        </p>

        <p>Details of the prospective Buyer:</p>
        <ul>
          <li><strong>Name:</strong>  ${finduser.Name}</li>
          <li><strong>Contact No:</strong>${MaskContactnumber(
            finduser.ContactNumber
          )}</li>
          <li><strong>Offered Amount:</strong> ${formatBidPrice(
            req.body.BidPrice
          )}</li>
        </ul>

        <p>
          If you are interested in accepting the offer, kindly reach out to your
          Relationship Manager (RM) for verification of this lead and to
          schedule a meeting for the next steps.
        </p>

        <p>
          For further assistance, feel free to contact us at
          <span class="highlight">783-784-0785</span> or mail us at
          <a href="mailto:support@propertydekho247.com"
            >support@propertydekho247.com</a
          >.
        </p>
      </div>
      <div class="footer">
        <p>Regards,</p>
        <p>Team PropertyDekho247</p>
        <p>
          <a href="https://www.propertydekho247.com" target="_blank"
            >www.propertydekho247.com</a
          >

          <p> <a href="https://www.propertydekho247.com/privacy-policy" target="_blank"> Privacy Policy</a> and <a href="https://www.propertydekho247.com/terms-and-conditions" target="_blank"> Terms and Conditions</a></p>

        </p>
      </div>
    </div>
  </body>
</html>
`;
    const {
      email: OwnerEmail,
      Name: OwnerName,
      ContactNumber: OwnerContact,
    } = findPost.CreatePostUser;

    const BuyerEmailSubject = `Your Offer Receipt`;
    let BuyerEmailData = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offer Acknowledgment</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            color: #111;
        }
        .email-container {
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 20px;
            padding-top: 10px;
        }
      
        .content {
            line-height: 1.6;
        }
        .content p {
            margin: 10px 0;
        }
        .highlight {
            font-weight: bold;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #666;
        }
        .footer p:nth-child(2){
             margin: 10px 0;
        }
              .footer p:last-child{
        margin: 10px 0;
       }
    </style>
</head>
<body>
    <div class="email-container">
    
        <div class="content">
            <p>Dear User,</p>

            <p>Greetings of the day!</p>
            <p>We would like to acknowledge the receipt of your offer of <span class="highlight">${formatBidPrice(
              req.body.BidPrice
            )}</span> for the <span class="highlight"> ${`${findPost.PropertyDetails.BHKType} BHK`} ${
      findPost.BasicDetails.ApartmentType
    } </span> listed with PropertyDekho247 at <span class="highlight"> ${
      findPost.LocationDetails.ProjectName
    }, ${
      findPost.LocationDetails.Landmark
    } ${
      findPost.LocationDetails.City
    } </span> (Property ID: <span class="highlight">${findPost._id}</span>).</p>

            <p>We have forwarded your offer to the property owner for their review. Should the owner accept your offer, your dedicated Relationship Manager (RM) will contact you to guide you through the next steps of the process.</p>

            <p>If you have any questions or need further assistance, please feel free to reach out to us at <span class="highlight">783-784-0785</span> or via email at <a href="mailto:support@propertydekho247.com">support@propertydekho247.com</a>.</p>

            <p>Thank you for choosing PropertyDekho247.</p>
        </div>
        <div class="footer">
            <p>Best regards,</p>
            <p>Team PropertyDekho247</p>
            <p><a href="https://www.propertydekho247.com" target="_blank">www.propertydekho247.com</a></p>
            <p> <a href="https://www.propertydekho247.com/privacy-policy" target="_blank"> Privacy Policy</a> and <a href="https://www.propertydekho247.com/terms-and-conditions" target="_blank"> Terms And Conditions</a></p>
        </div>
    </div>
</body>
</html>
`;

    let BuyerEmailPromise = SendEmail(
      finduser.email,
      BuyerEmailSubject,
      BuyerEmailData
    );
    let OwnerEmailPromise = SendEmail(
      OwnerEmail,
      PropertyOwnerEmailSubject,
      PropertyOwnerEmailData
    );
  
    // let SmsMessage = `Hi ${OwnerName}, ${finduser.Name} has scheduled a visit for your Property listed on PropertyDekho247, For more details contact your RM`;
    let SmsMessage = `Hi ${OwnerName}, ${
      finduser.Name
    }, has made an offer of ${formatBidPrice(
      req.body.BidPrice
    )} for your property listed on propertydekho247, for more info, Contact your RM - Propertydekho247`;
    let smsPromise = SendSMS(
      OwnerContact,
      SmsMessage,
      process.env.MAKE_OFFER_DLT_TEMP_ID
    );
    const [BuyerEmailResults, OwnerEmailResults, smsResponse] =
      await Promise.all([BuyerEmailPromise, OwnerEmailPromise, smsPromise]);
      

    res.status(200).json({
      success: true,
      BidCreate: true,
      message: "Bid Create Successfully",
    });
  } catch (error) {
    console.log(error)
    if (imageLink.length > 0) {
      for (let i = 0; i < imageLink.length; i++) {
        await cloudinary.v2.uploader.destroy(imageLink[i].public_id);
      }
    }

    return SendError(res, 500, false, null, error);
  }
};

// get Post vise Bidding Document

export const GetAllBiddingDocument_AdminOwner = async (req, res) => {
  try {
    const { PostId } = req.params;

    const GetAllBidDocument = await BiddingFormmodel.find({
      "PostData.PostId": PostId,
    })
      .populate("Biddinguser", "Name ContactNumber email")
      .sort({ BidPrice: -1 })
      .exec();

    let message = "get All Bid Document";
    res
      .status(200)
      .json({ success: true, message, BidDocument: GetAllBidDocument });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// export Bid Verfy  and unverify
export const VerifyBid_AdminOwner = async (req, res) => {
  try {
    const { BidVerify } = req.body;
    const { BidId } = req.params;

    if (BidVerify == undefined) {
      let message = "Send Bid Verification Data";
      return SendError(res, 404, false, message, null);
    }

    const findBid = await BiddingFormmodel.findById(BidId).populate(
      "PostData.PostId",
      "PricingDetails.ExpectedPrice"
    );

    if (!findBid) {
      let message = "BidData Not Found";
      return SendError(res, 404, false, message, null);
    }
    if (!findBid.PostData.PostId && BidVerify) {
      let message = "post is not exit";
      return SendError(res, 404, false, message, null);
    }
    if (
      findBid.BidPrice < findBid.PostData.PostId.PricingDetails.ExpectedPrice &&
      BidVerify
    ) {
      let message = "this bid price smaller to reserveprice";
      return SendError(res, 404, false, message, null);
    }
    if (BidVerify) {
      const findUserExitAllBid = await BiddingFormmodel.updateMany(
        {
          Biddinguser: findBid.Biddinguser,
          BidVerify: true,
          _id: { $ne: findBid._id },
        },
        { $set: { BidVerify: false } }
      );
    }

    findBid.BidVerify = BidVerify;
    let updaterole = await findBid.save();
    // let updateBid = await findBid.save();
    if (!updaterole) {
      let message = `Bid is not ${BidVerify ? "verify" : "un-verify"}`;
      return SendError(res, 404, false, message, null);
    }

    let message = `Bid ${BidVerify ? "verify" : "un-verify"} SuccessFully`;
    return res.status(200).json({ success: true, message });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};
