import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { SendError } from "../Utils/error.js";
import AdminAndOwnerModel from "../Model/AdminOwnerModel.js";
import { SendEmail } from "../Utils/SendEmail.js";
import { CreteTokenAndSTore } from "../Utils/CreateJwt.js";
import crypto from "crypto";
import { SendSMS } from "../Utils/SendSms.js";
// Step 1:  admin_owner enters ContactNumber, generate OTP

export const CreateOtpForAdmin_Onwer = async (req, res) => {
  const { Name, ContactNumber } = req.body;
  // console.log("ContactNumber",req.body);

  let CreateOtpData;
  try {
    let find_admin_owner = await AdminAndOwnerModel.findOne({
      ContactNumber: ContactNumber,
      CRTVerifyAdmin: true,
    });

    if (find_admin_owner) {
      let message = `${Name} ${find_admin_owner.Role} Is Allready Exit`;
      return SendError(res, 400, false, message, null);
    }

    // Generate OTP
    // const otp = crypto.randomBytes(3).toString("hex"); // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
    console.log(otp);
    const OtpHash = crypto
      .createHash("sha256", process.env.OTP_SECRET)
      .update(otp.toString())
      .digest("hex");
    const Documnet = {
      OtpHash: OtpHash,
      OtpExpire: Date.now() + 15 * 60 * 1000, // Otp Valid for Fifteen minutes
      Name: Name,
      ContactNumber: ContactNumber,
    };

    const AdminAndOwnerDocument = new AdminAndOwnerModel(Documnet);

    CreateOtpData = await AdminAndOwnerDocument.save();

    if (!CreateOtpData) {
      let message = `${Name} Id is not Create (mongodb)`;
      return SendError(res, 500, false, message, null);
    }

    let SmsMessage = `${otp} is your OTP to continue on PropertyDekho247 (a unit of Propfuture AI Technologies) - Propertydekho247`; // Your SMS content
    let response = await SendSMS(
      ContactNumber,
      SmsMessage,
      process.env.DLT_TEMP_ID
    );
    if (!response.ok) {
      await AdminAndOwnerModel.findByIdAndDelete(CreateOtpData._id);
      let message = `HTTP error! Status: ${response.status}`;
      return SendError(res, 500, false, message, null);
      // throw new Error();
    }
    const data = await response.json();
    if (data.code != 200) {
      await AdminAndOwnerModel.findByIdAndDelete(CreateOtpData._id);
      let message = `Otp Not Send This Region - ${data.status} status code - ${data.code}`;
      return SendError(res, 500, false, message, null);
    }
    res.status(200).json({
      success: true,
      AdminProfileCreateOtp: true,
      message: `${Name} Otp is Send to  This ContactNumber id :- ${ContactNumber}`,
    });
  } catch (error) {
    if (CreateOtpData) {
      await AdminAndOwnerModel.findByIdAndDelete(CreateOtpData._id);
    }
    return SendError(res, 500, false, null, error);
  }
};

// Step 2  Veriy true
export const VerifyOtpCreteAdmin_Owner = async (req, res) => {
  try {
    const { ContactNumber, Otp, Role } = req.body;

    let find_admin_owner = await AdminAndOwnerModel.findOne({
      ContactNumber: ContactNumber,
      CRTVerifyAdmin: true,
    });

    if (find_admin_owner) {
      let message = `${find_admin_owner.Role} Is Allready Exit`;
      return SendError(res, 400, false, message, null);
    }
    // check user
    // find_admin_owner = await AdminAndOwnerModel.findOne({ ContactNumber });
    // if (!find_admin_owner) {
    //   let message = "Your Data is not Exit";
    //   return SendError(res, 400, false, message, null);
    // }

    const OtpHash = crypto
      .createHash("sha256", process.env.OTP_SECRET)
      .update(Otp.toString())
      .digest("hex");

    let verifyopt = await AdminAndOwnerModel.findOne({
      ContactNumber: ContactNumber,
      OtpHash: OtpHash,
    });

    if (!verifyopt) {
      let message = "Your have entered invalid Otp";
      return SendError(res, 500, false, message, null);
    }

    if (verifyopt.OtpExpire <= new Date(Date.now())) {
      let message = "This Otp is Expired. Plase send again";
      return SendError(res, 500, false, message, null);
    }

    verifyopt.OtpHash = undefined;
    verifyopt.OtpExpire = undefined;
    verifyopt.CRTVerifyAdmin = true;

    if (
      [9718451723, 9053608395, 9560509397].includes(verifyopt.ContactNumber)
    ) {
      verifyopt.Role = "Owner";
      verifyopt.OwnerVerify = true;
    } else {
      console.log(Role);
      if (Role == "Admin") {
        verifyopt.Role = "Admin";
        verifyopt.AdminVerify = false;
      } else if (Role == "Agent") {
        verifyopt.Role = "Agent";
        verifyopt.AgentVerify = false;
      }
    }

    let verify_admin_owner = await verifyopt.save();
    if (!verify_admin_owner) {
      let message = "Crete Otp Again  Internal Server Error";
      return SendError(res, 500, false, message, null);
    }
    //  Delete Fake document
    let Delte_admin_owner = await AdminAndOwnerModel.find({
      ContactNumber: verifyopt.ContactNumber,
      CRTVerifyAdmin: false,
    });
    if (verify_admin_owner.Role == "Owner") {
      CreteTokenAndSTore(verifyopt._id, res);
    }
    if (Delte_admin_owner.length > 0) {
      Delte_admin_owner.forEach(async (element) => {
        await AdminAndOwnerModel.findByIdAndDelete(element._id);
      });
    }

    res.status(200).json({
      success: true,
      ProfileCreateVerifyOtp: true,
      message: `${verify_admin_owner.Name} Your Otp is Verify `,
      admin_owner: { Role: verify_admin_owner.Role },
    });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// Step Three createa admin_owner

export const LoginAdmin_Owner = async (req, res) => {
  try {
    const { ContactNumber } = req.body;

    let find_admin_owner = await AdminAndOwnerModel.findOne({
      ContactNumber,
      CRTVerifyAdmin: true,
    });

    if (!find_admin_owner) {
      let message = "Admin Login fail";
      return SendError(res, 400, false, message, null);
    }
    if (find_admin_owner.Role == "Admin" && !find_admin_owner.AdminVerify) {
      let message = "Admin Asign but Admin Role is not Verify";
      return SendError(res, 400, false, message, null);
    }
    if (find_admin_owner.Role == "Agent" && !find_admin_owner.AgentVerify) {
      let message = "Agent Asign but Agent Role is not Verify";
      return SendError(res, 400, false, message, null);
    }
    if (find_admin_owner.Role == "Owner" && !find_admin_owner.OwnerVerify) {
      let message =
        "Go to Developer team you are not access this application beacaue owner is not verify";
      return SendError(res, 400, false, message, null);
    }

    // Generate OTP
    // const otp = crypto.randomBytes(3).toString("hex"); // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
    console.log(otp);
    const OtpHash = crypto
      .createHash("sha256", process.env.OTP_SECRET)
      .update(otp.toString())
      .digest("hex");

    let SmsMessage = `${otp} is your OTP to continue on PropertyDekho247 (a unit of Propfuture AI Technologies) - Propertydekho247`; // Your SMS content

    find_admin_owner.OtpHash = OtpHash;
    find_admin_owner.OtpExpire = Date.now() + 15 * 60 * 1000; // Otp Valid for Fifteen minutes

    let data = await find_admin_owner.save();
    if (!data) {
      let message = `Otp not Send Try Again`;
      return SendError(res, 500, false, message, null);
    }
    let response = await SendSMS(
      ContactNumber,
      SmsMessage,
      process.env.DLT_TEMP_ID
    );
    // let emailSend = await SendEmail(req.body.email, subject, html);

    //   if (!emailSend) {
    //   let message = `Otp not Send Try Again`;
    //   return SendError(res, 500, false, message, null);
    // }

    if (!response.ok) {
      let message = `HTTP error! Status: ${response.status}`;
      return SendError(res, 500, false, message, null);
    }
    const Smsdata = await response.json();
    if (Smsdata.code != 200) {
      let message = `Otp Not Send This Region - ${data.status} status code - ${data.code}`;
      return SendError(res, 500, false, message, null);
    }

    res.status(200).json({
      success: true,
      message: `${find_admin_owner.Name} Opt Send This ContactNumber :- ${ContactNumber}`,
      // user: { Name: find_admin_owner.Name },
      LoginAdminOwnerOtp: true,
    });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// Login Admin And Owner
export const VerifyOtpForLoginAdmin_Owner = async (req, res) => {
  try {
    const { ContactNumber, Otp } = req.body;
    const OtpHash = crypto
      .createHash("sha256", process.env.OTP_SECRET)
      .update(Otp.toString())
      .digest("hex");
    let findAdmin = await AdminAndOwnerModel.findOne({
      ContactNumber: ContactNumber,
      OtpHash: OtpHash,
      CRTVerifyAdmin: true,
      // AdminVerify: true,
    });

    if (!findAdmin) {
      let message = "Invalid Otp";
      return SendError(res, 404, false, message, null);
    }
    // console.log(findAdmin)

    // let findOwner = await AdminAndOwnerModel.findOne({
    //   ContactNumber: ContactNumber,
    //   CRTVerifyAdmin: true,
    //   OwnerVerify: true,
    // });
    // let findAgent = await AdminAndOwnerModel.findOne({
    //   ContactNumber: ContactNumber,
    //   CRTVerifyAdmin: true,
    //   AgentVerify: true,
    // });

    // if (!findAdmin && !findOwner && !findAgent) {
    //   let message = "You Are Data is not Found";
    //   return SendError(res, 404, false, message, null);
    // }

    if (!findAdmin) {
      let message = "Invalid Otp";
      return SendError(res, 500, false, message, null);
    }
    if (findAdmin.OtpExpire <= new Date(Date.now())) {
      let message = "Otp is Expire";
      return SendError(res, 500, false, message, null);
    }

    findAdmin.OtpHash = undefined;
    findAdmin.OtpExpire = undefined;

    let verify_admin_owner = await findAdmin.save();
    if (!verify_admin_owner) {
      let message = "Internal Server Error Tri Again";
      return SendError(res, 500, false, message, null);
    }

    CreteTokenAndSTore(verify_admin_owner._id, res);
    res.status(200).json({
      success: true,
      message: `${verify_admin_owner.Name}  Login SuccessFully`,
      // user: { Name: verify_admin_owner.Name },
      AdminOwnerLoginVerifyOtp: true,
    });

    // if (findOwner) {
    //   let findOwner = await AdminAndOwnerModel.findOne({
    //     ContactNumber: ContactNumber,
    //     OtpHash: OtpHash,
    //     CRTVerifyAdmin: true,
    //     OwnerVerify: true,
    //   });
    //   if (!findOwner) {
    //     let message = "Invalid Otp";
    //     return SendError(res, 500, false, message, null);
    //   }
    //   if (findOwner.OtpExpire <= new Date(Date.now())) {
    //     let message = "Otp is Expire";
    //     return SendError(res, 500, false, message, null);
    //   }

    //   findOwner.OtpHash = undefined;
    //   findOwner.OtpExpire = undefined;

    //   let verify_admin_owner = await findOwner.save();
    //   if (!verify_admin_owner) {
    //     let message = "Internal Server Error Tri Again";
    //     return SendError(res, 500, false, message, null);
    //   }

    //   CreteTokenAndSTore(verify_admin_owner._id, res);
    //   res.status(200).json({
    //     success: true,
    //     message: `${verify_admin_owner.Name}  Login SuccessFully`,
    //     // user: { Name: verify_admin_owner.Name },
    //     AdminOwnerLoginVerifyOtp: true,
    //   });
    // }

    // let findOwner = await AdminAndOwnerModel.findOne({
    //   ContactNumber: ContactNumber,
    //   OtpHash: OtpHash,
    //   CRTVerifyAdmin: true,
    //   OwnerVerify: true,
    // });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// Get All Admin And Agent Data
export const GetAllAdmin = async (req, res) => {
  try {
    const Keyword = req.query;

    let AdminData = [];

    if (Object.keys(Keyword).length > 0) {
      if (!Keyword.Role) {
        Keyword.Role = { $ne: "Owner" }; // Exclude documents with Role "Owner"
      }
      if (Keyword.Role != "Owner") {
        AdminData = await AdminAndOwnerModel.find(Keyword);
      }
    } else {
      let All_Admin_Agent = await AdminAndOwnerModel.find({
        Role: { $ne: "Owner" },
      });
      let alldoc = All_Admin_Agent.filter((e) => {
        return (
          (e.CRTVerifyAdmin == false && e.OtpExpire < new Date(Date.now())) ||
          e.CRTVerifyAdmin == true
        );
      });
      console.log(alldoc.length);
      AdminData = alldoc;
    }

    let message = "Admin Find Successfully";
    return res.status(200).json({ success: true, message, Admin: AdminData });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// VerifyAdmin And Agent
export const VerifyAdmin = async (req, res) => {
  try {
    const { AdminVerify, AgentVerify } = req.body;
    const { adminId } = req.params;

    if (AdminVerify == undefined && AgentVerify == undefined) {
      let message = "Send  Verification Data";
      return SendError(res, 404, false, message, null);
    }
  
    let findAdmin = await AdminAndOwnerModel.findById(adminId);
    if (!findAdmin) {
      let message = "Admin Data Not Found";
      return SendError(res, 404, false, message, null);
    }
    if (findAdmin.Role == "Admin") {
      findAdmin.AdminVerify = AdminVerify;
    }
    if (findAdmin.Role == "Agent") {
      findAdmin.AgentVerify = AgentVerify;
    }
    // let findAdmin = await AdminAndOwnerModel.findOne({
    //   _id: adminId,
    //   Role: "Admin",
    // });
    // if (!findAdmin) {
    //   let message = "Admin Data Not Found";
    //   return SendError(res, 404, false, message, null);
    // }

    // findAdmin.AdminVerify = AdminVerify;
    let updaterole = await findAdmin.save();

    if (!updaterole) {
      let message = "Role not Updated";
      return SendError(res, 404, false, message, null);
    }

    let message = "Update Role SuccessFully";
    return res.status(200).json({ success: true, message });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};
// update Admin profile for Assigend task or peoperty
export const updateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    // Ensure body is not empty
    if (Object.keys(req.body).length === 0) {
      let message = "Please Select at least One property!";
      return SendError(res, 400, false, message, null);
    }

    // Find the admin by ID
    const findAdmin = await AdminAndOwnerModel.findOne({ _id: adminId });
    if (!findAdmin) {
      let message = "Admin Data Not Found";
      return SendError(res, 404, false, message, null);
    }

    const propertyIds = req.body; // Assuming it's an array of property IDs
    const assignedProperties = findAdmin.AssignedPropertyId || [];

    // Check if any of the requested properties are already assigned
    const newProperties = propertyIds.filter(propId => !assignedProperties.includes(propId));

    if (newProperties.length === 0) {
      return SendError(res, 400, false, "All selected properties are already assigned", null);
    }

    // Add new properties to the admin's assigned properties
    const updatedAdmin = await AdminAndOwnerModel.findByIdAndUpdate(
      adminId, 
      { $push: { AssignedPropertyId: { $each: newProperties } } }, 
      { new: true }
    );

    let message = "Properties Assigned Successfully";
    return res.status(200).json({ success: true, message, data: updatedAdmin });

  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};


// Remove assigned property
export const RemoveAssignedProperty = async (req, res) => {
  try {
    const { userId, postId } = req.body;
    // console.log(req.body)
    if (!userId || !postId) {
      let message = "Admin Data Not Found !";
      return SendError(res, 404, false, message, null);
    }
    const admin = await AdminAndOwnerModel.findById(userId);
    // console.log(admin)
    if (!admin) {
      let message = "Admin Data Not Found";
      return SendError(res, 404, false, message, null);
    }
    const removed = await AdminAndOwnerModel.findOneAndUpdate(
      { _id: userId, AssignedPropertyId: postId },
      { $pull: { AssignedPropertyId: postId } },
      { new: true }
    );
    let message = "Remove SuccessFully !";
    return res.status(200).json({ success: true, message });
  } catch (error) {
    return SendError(res, 500, false, null, error);
  }
};

// export const findAdminproperty= async (req, res) => {
//   const { adminId } = req.params; // assuming you are getting the adminId from the login request
//    console.log(adminId,"sdj")
//   // Find the admin and populate AssignedPropertyId with the PostDetail data
//   const admin = await AdminAndOwnerModel.findById(adminId)
//     .populate({
//       path: 'AssignedPropertyId', // This will populate the post details
//       model: 'PostDetail', // Link to the PostDetail model
//     });

//   if (!admin) {
//     return res.status(404).json({ message: 'Admin not found' });
//   }

//   // Send back the populated admin details with the full PostDetail data
//   res.status(200).json({
//     AssignedPropertyId: admin.AssignedPropertyId, // This will return the full PostDetail objects
//   });
// };
