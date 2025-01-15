import jwt from "jsonwebtoken";
import Usermodel from "../Model/userModel.js";
export const UserAuthenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        IsAuthenticated: false,
        message: `Please Login to access this resource - (jwt Token not Found)`,
      });
    }

    let token_secret = process.env.JWT_TOKEN_SECRET;

    let { id } = jwt.verify(token, token_secret);

    if (!id) {
      return res.status(401).json({
        success: false,
        IsAuthenticated: false,
        message: "Please Login to access this resource - (user Id not Found)",
      });
    }

    req.userId = id;
   

    next();
  } catch (error) {
     
    return res.status(401).json({
      success: false,
      IsAuthenticated: false,
      message: `Please Login to access this resource - (${error.message}) `,
    });
  }
};
