 
import AdminAndOwnerModel from "../Model/AdminOwnerModel.js";
import Usermodel from "../Model/userModel.js";
import { SendError } from "../Utils/error.js";

export const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      const UserDetails = await AdminAndOwnerModel.findById(req.userId);
      const userdata = await Usermodel.findById(req.userId);

 
      const role = UserDetails?.Role || userdata?.Role;

      if (UserDetails) {
        if (UserDetails.Role === "Owner" && !UserDetails.OwnerVerify) {
          // res.clearCookie("token");
          const message = `Role: ${UserDetails.Role} is not verified.`;
         
          return res.status(403).json({ message, success:false , AdminVerify:false});
          
          // return SendError(res, 403, false, message, null);
        }

        if (UserDetails.Role === "Admin" && !UserDetails.AdminVerify) {
          // res.clearCookie("token");
          const message = `Role: ${UserDetails.Role} is not verified.`;
          return res.status(403).json({ message, success:false , AdminVerify:false});
        }
        if(UserDetails.Role ==="Agent" && !UserDetails.AgentVerify){
          const message = `Role: ${UserDetails.Role} is not verified.`;
          return res.status(403).json({ message, success:false , AgentVerify:false});
        }
      }
  
      if (!roles.includes(role)) {
        const message = `Role: ${role} is not allowed to access this resource.`;
        return res.status(403).json({ message, success:false });
      }

      next();
    } catch (error) {
      return SendError(res, 500, false, null, error);
    }
  };
};
