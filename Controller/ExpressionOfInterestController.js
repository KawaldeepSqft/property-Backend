import ExpressionOfInterestmodel from "../Model/ExpressionOfInteresetModel.js";

import { SendError } from "../Utils/error.js";

export const CreateExpressionOfInterest = async (req, res) => {
  try {
    // crate User querry document
    const ExpressionOfInterestDocument = new ExpressionOfInterestmodel(req.body);
     

    //  Store Data in database
    const data = await ExpressionOfInterestDocument.save();

    if (!data) {
      let message = "Query is not Create";
      return SendError(res, 500, false, message, null);
    }

    res.status(200).json({
      success: true,
      message: "Your from is submit successfully",
    });
  } catch (error) {
     
    return SendError(res, 500, false, null, error);
  }
};
