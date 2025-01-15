import ScheduleVisitModel from "../Model/ScheduleVisitModel.js";
import Usermodel from "../Model/userModel.js";
import { SendError } from "../Utils/error.js";
import PostModel from "../Model/postModel.js";
import { SendEmail } from "../Utils/SendEmail.js";
import AdminAndOwnerModel from "../Model/AdminOwnerModel.js";
import { SendSMS } from "../Utils/SendSms.js";

export const CreateScheduleVisit = async (req, res) => {
  try {
    const { PostData } = req.body;
    if (!PostData || !PostData.PostId) {
      let message = "Send Post Data";
      return SendError(res, 404, false, message, null);
    }
    // crate User querry document
    let finduser = await Usermodel.findById(req.userId);
    if (!finduser) {
      let message = "Internal Server Error";
      return SendError(res, 500, false, message, null);
    }
    let findPost = await PostModel.findById(PostData.PostId).populate(
      "CreatePostUser",
      "email Name ContactNumber"
    );

    if (!findPost) {
      let message = "Post is not Found";
      return SendError(res, 404, false, message, null);
    }

    if (!findPost.PostVerify) {
      let message = " This Post is not Active";
      return SendError(res, 404, false, message, null);
    }

    req.body.VisitUser = req.userId;
    const ScheduleVisitDocument = new ScheduleVisitModel(req.body);

    //  Store Data in database

    const saveScheduleVisitPromise = await ScheduleVisitDocument.save();

    if (!saveScheduleVisitPromise) {
      let message = "Your Visit is Not Scheduled  ";
      return SendError(res, 500, false, message, null);
    }
    // Property Addresh

    let FullPropertyAddresh = `${`${findPost.PropertyDetails.BHKType} BHK`} ${
      findPost.BasicDetails.ApartmentType
    } for ${findPost.LocationDetails.ProjectName} , ${
      findPost.LocationDetails.Landmark
    } ${findPost.LocationDetails.City}`;

    // subject

    //  Send To Email Property Owner  (Property Owner)

    const {
      email: OwnerEmail,
      Name: OwnerName,
      ContactNumber: OwnerContact,
    } = findPost.CreatePostUser;

    let MaskContactnumber = (ContactNumber) => {
      const phoneStr = ContactNumber.toString();
      return phoneStr.slice(0, 2) + "XXXX" + phoneStr.slice(6);
    };
    function formatDate(date) {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(date)
        .toLocaleDateString("en-GB", options)
        .replace(",", "")
        .replace(" ", "-");
    }

    function convertTo12HourFormat(timeStr) {
      let [hours, minutes] = timeStr.split(":").map(Number);
      let ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // 12:00 should be 12 PM
      return `${hours}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`;
    }

    // Buyer Email Data End

    let BuyerEmailData = ` <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visit Scheduled</title>
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
        
        .content {
            line-height: 1.6;
        }
        .content p {
            margin: 10px 0;
        }
        .highlight {
            font-weight: bold;
        }
             .content ul {
            margin-left: 10px;
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

            <p>Greetings of the day!!</p>

            <p>A visit has been scheduled for a <span class="highlight">${FullPropertyAddresh}</span>  (Property ID: <span class="highlight">${findPost._id}</span>) listed on PropertyDekho247.</p>
           

            <p>For any assistance regarding the visit, please feel free to contact your Dedicated Relationship Manager (RM):</p>
            <ul>
                <li><strong>Name:</strong> Gaurav Wadhwa</li>
                <li><strong>Contact No:</strong> 9560509397</li>
               
              <li><strong>Date & Time:</strong> 24-Dec-2024, 10.00 to 11.00 AM</li>
            </ul>
 
            <p>For further assistance, feel free to contact us at <span class="highlight">783-784-0785</span> or email us at <a href="mailto:support@propertydekho247.com">support@propertydekho247.com</a>.</p>
        </div>
        <div class="footer">
            <p>Regards,</p>
            <p>Team PropertyDekho247</p>
            <p><a href="https://www.propertydekho247.com" target="_blank">www.propertydekho247.com</a></p>
            <p> <a href="https://www.propertydekho247.com/privacy-policy" target="_blank"> Privacy Policy</a> and <a href="https://www.propertydekho247.com/terms-and-conditions" target="_blank"> Terms And Conditions</a></p>
        </div>
    </div>
</body>
</html>
`;
    let BuyerEmailSubject = "Your Vist is Schedule Done";

    // Property Owner  Data
    let PropertyOwnerEmailData = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visit Scheduled - Owner Notification</title>
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
        
        
        .content {
            line-height: 1.6;
        }
        .content p {
            margin: 10px 0;
        }
                    .content ul {
            margin-left: 10px;
        }
        .highlight {
            font-weight: bold;
        }
        .footer {
            margin-top: 20px;
           
            font-size: 14px;
            color: #666;
        }
        .footer p:nth-child(2) {
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

            <p>We are pleased to inform you that a visit has been scheduled for your <span class="highlight">${FullPropertyAddresh}</span> (Property ID: <span class="highlight">${
      findPost._id
    }</span>), listed on PropertyDekho247.</p>

            <p>Details of the prospective Buyer:</p>
            <ul>
                <li><strong>Name:</strong> ${finduser.Name}</li>
                <li><strong>Contact No:</strong> ${MaskContactnumber(
                  finduser.ContactNumber
                )}</li>
                <li><strong>Date & Time:</strong> ${formatDate(
                  req.body.VisitDate
                )}, ${convertTo12HourFormat(
      req.body.VisitTime.From
    )} to ${convertTo12HourFormat(req.body.VisitTime.To)} </li>
            </ul>

            <p>Your dedicated Relationship Manager will coordinate the visit and ensure full support to the prospective buyer during the property tour.</p>

            <p>Should you require any further assistance or have any questions, please feel free to contact us at <span class="highlight">783-784-0785</span> or email us at <a href="mailto:support@propertydekho247.com">support@propertydekho247.com</a>.</p>
        </div>
        <div class="footer">
            <p>Regards,</p>
            <p>Team PropertyDekho247</p>
            <p><a href="https://www.propertydekho247.com" target="_blank">www.propertydekho247.com</a></p>
         <p> <a href="https://www.propertydekho247.com/privacy-policy" target="_blank"> Privacy Policy</a> and <a href="https://www.propertydekho247.com/terms-and-conditions" target="_blank"> Terms and Conditions</a></p>
        </div>
    </div>
</body>
</html>
`;
    let PropertyOwnerEmailSubject = "Schedule Visit Plan On Your Property";

    //  Send Sms in Property Owner

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
    let SmsMessage = `Hi ${OwnerName}, ${finduser.Name} has scheduled a visit for your Property listed on PropertyDekho247, For more details contact your RM`;

    let smsPromise = SendSMS(
      OwnerContact,
      SmsMessage,
      process.env.S_VISIT_DLT_TEMP_ID
    );
    const [BuyerEmailResults, OwnerEmailResults, smsResponse] =
      await Promise.all([BuyerEmailPromise, OwnerEmailPromise, smsPromise]);
 
  
    res.status(200).json({
      success: true,
      message: "Your Vist is Scheduled Successfully",
    });
  } catch (error) {
    console.log(error)
    return SendError(res, 500, false, null, error);
  }
};

//  Get All ScheduleVisit Data  Post Vise (Admin-Owner)

export const GetAllScheduleVisit_AdminOwner = async (req, res) => {
  try {
    const { PostId } = req.params;

    const GetAllScheduleVisit = await ScheduleVisitModel.find({
      "PostData.PostId": PostId,
    })
      .populate("VisitUser", "Name email ContactNumber")
      .populate(
        "PostData.PostId",
        "BasicDetails PropertyDetails LocationDetails PostVerify"
      );

    let message = "Find All Schedule Visit Data Successfully";
    res
      .status(200)
      .json({ success: true, message, ScheduleVisits: GetAllScheduleVisit });
  } catch (error) {
    console.log(error);
    return SendError(res, 500, false, null, error);
  }
};

// Add Visit Status
export const ScheduleVisitDone_AdminOwner = async (req, res) => {
  try {
    const { VisitId } = req.params;
    const GetScheduleVisitDocument = await ScheduleVisitModel.findById(VisitId);

    const { VisitStatus } = req.body;

    if (!VisitStatus) {
      let message = `Send Visit Status`;
      return SendError(res, 400, false, message, null);
    }
    if (!GetScheduleVisitDocument) {
      let message = `Schedule Visit Data not Found`;
      return SendError(res, 400, false, message, null);
    }

    const AdminDetails = await AdminAndOwnerModel.findById(req.userId);
    if (!AdminDetails) {
      let message = `Internal Server Error`;
      return SendError(res, 500, false, message, null);
    }
    const updateVisitStatusObj = {
      VisitStatusData: {
        Status: VisitStatus,
        Admin: req.userId,
        Time: Date.now(),
      },
    };
    const updateVisitStatus = await ScheduleVisitModel.findByIdAndUpdate(
      VisitId,
      updateVisitStatusObj,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updateVisitStatus) {
      let message = "Vist Status not Update";
      return SendError(res, 500, false, message, null);
    }
    let message = "Visit Status Update Successfully";
    res.status(200).json({ success: true, message });
  } catch (error) {
    console.log(error);
    return SendError(res, 500, false, null, error);
  }
};
