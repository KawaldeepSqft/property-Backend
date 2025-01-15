import jwt from "jsonwebtoken";
 export const CreteTokenAndSTore =(UserId ,res)=>{
    const jwtToken = jwt.sign(
        { id: UserId },
        process.env.JWT_TOKEN_SECRET
      );
      const option = {
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      };
      res.cookie("token", jwtToken, option);
}