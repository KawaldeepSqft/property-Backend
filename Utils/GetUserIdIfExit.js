import jwt from "jsonwebtoken";
export const GetUserIdIfExit = (req) => {
  try {
    let token = req.cookies.token;
    if (token) {
      let token_secret = process.env.JWT_TOKEN_SECRET;

      let { id } = jwt.verify(token, token_secret);
      return id;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};
