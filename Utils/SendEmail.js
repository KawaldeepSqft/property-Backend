
import nodeMailer from 'nodemailer'
export const SendEmail =  (email, subject, html) => {
    
 console.log(email,subject)
        //   Send Eamil 

        const transporter = nodeMailer.createTransport({
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT,
            service: process.env.SMPT_SERVICE,
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_MAIL_PASSWORD
            }
        })

        

        const mailOptions = {
            from: process.env.SMPT_MAIL,
            to: email,
            subject: subject,
            html: html

        }

        return transporter.sendMail(mailOptions)


        
     

    }
    
 