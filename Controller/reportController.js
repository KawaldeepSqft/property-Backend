import ReportModel from "../Model/ReportModel.js";
import Usermodel from "../Model/userModel.js";
import { SendError } from "../Utils/error.js";

export const reportFormRequest=async(req,res)=>{
        const{reason , postId}=req.body;
        const reportUserId=req.userId
        // checking all the field getting or not 
        if(!reason || !postId || !reportUserId){
            let message = "Login before Submit!";
        return SendError(res, 400, false, message,null); 
        } 
        // checking if the same user try to submit report for same property 
        const checkExistingReport=await ReportModel.find({postId:postId,reportUserId:reportUserId})
        if(checkExistingReport){
            let message = "You already submitted for this property!";
            return SendError(res, 400, false, message,null); 
        }
        // create new object
        const createReport=new ReportModel({
            reason,
            postId,
            reportUserId
        })
        try {
            await createReport.save(); // Save to the database
            res.status(201).json({
                success: true,
                message: "Report created successfully",
                data: createReport // Return the created report
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating the report",
                error: error.message
            });
    }
}