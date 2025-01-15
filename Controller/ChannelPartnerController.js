 
import ChannelPartnerModel from "../Model/ChannelPartnerModel.js";
import { SendError } from "../Utils/error.js";

export const ChannelPartner = async (req, res) => {
  try {

    const ChannelPartnerDocument = new ChannelPartnerModel(req.body);
    const data = await ChannelPartnerDocument.save();

    if (!data) {
      let message = "ChannelPartner is not Create";
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
