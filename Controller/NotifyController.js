import Notifymodel from "../Model/NotifyModel.js";
import Usermodel from "../Model/userModel.js";
import { SendError } from "../Utils/error.js";
import { SendEmail } from "../Utils/SendEmail.js";

export const CreateNotifyResponse = async (req, res) => {
  try {

    let finduser = await Usermodel.findById(req.userId);
     
     if(!finduser){
      let message = "Internal Server Error";
      return SendError(res, 500, false, message, null);
     }

     req.body.User =req.userId
    // crate User querry document
    const NotifyDocument = new Notifymodel(req.body); // Assuming NotifyDocument is populated with data
console.log(req.body)
    let BuyerEmailData = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Visit Scheduled</title>
        <style>
            * { margin: 0; padding: 0; }
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
            .content ul {
                margin-left: 10px;
            }
            .footer {
                margin-top: 20px;
                font-size: 14px;
                color: #666;
            }
            .footer p:nth-child(2) {
                margin: 10px 0;
            }
            .footer p:last-child {
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="content">
                <h2>Notify Info</h2>

                <p><span class="highlight">Title:</span> ${req.body.P6rojectName}</p>
                <p><span class="highlight">Status:</span> ${req.body.BHKType}</p>
            </div>
            <div class="footer">
                <p>Regards,</p>
                <p>Team PropertyDekho247</p>
                <p><a href="https://www.propertydekho247.com" target="_blank">www.propertydekho247.com</a></p>
                <p><a href="https://www.propertydekho247.com/privacy-policy" target="_blank">Privacy Policy</a> and <a href="https://www.propertydekho247.com/terms-and-conditions" target="_blank">Terms And Conditions</a></p>
            </div>
        </div>
    </body>
    </html>
    `;
    
    
    let BuyerEmailSubject = "Notification Email for Property";
    let email="amitkumar1723p@gmail.com";
      
  
    //  Store Data in database
    const data = await NotifyDocument.save();
    if (!data) {
      let message = "Query is not Create";
      return SendError(res, 500, false, message, null);
    }
    // await Promise.all([NotifyEmailPromise, ]);
    let NotifyEmailPromise =  await SendEmail(
      email,
       BuyerEmailSubject,
       BuyerEmailData
     );
   
// console.log(NotifyEmailPromise)
    res.status(200).json({
      success: true,
      message: "Your from is submit successfully",
    });
  } catch (error) {
     
    return SendError(res, 500, false, null, error);
  }
};
