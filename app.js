import express from "express";
import userRoutes from "./Routes/userRoutes.js";
import postRoutes from "./Routes/postRoutes.js";
import ExpressionOfInterestRoutes from "./Routes/ExpressionOfInterestRoutes.js";
import BiddingFormRoutes from "./Routes/BiddingFormRoutes.js";
import AdminAndOwnerRoutes from "./Routes/AdminAndOwnerRoutes.js";
import ScheduleVisitRoutes from "./Routes/ScheduleVisitRoutes.js";
import PostPropertyRequirementRoutes from "./Routes/PostPropertyRequirementRoutes.js";
import ChannelPartnerRoutes from "./Routes/ChannelPartnerRoutes.js";
import TenantPostResponseRoutes from "./Routes/TenantPostResponseRoutes.js";
import initializeCrons from "./Utils/Crons.js";
import NotifyRoutes from "./Routes/NotifyRoutes.js";
// import FavouritePostRoutes from './Routes/FavouritePostRoutes.js';
import morgan from 'morgan';

import { join } from "path";
import dotenv from 'dotenv';
import path from 'path';
import ConnectDb from "./Db/connectdb.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import cloudinary from "cloudinary";
import fileUpload from "express-fileupload";
import 'dotenv/config'
// import bodyParser  from 'body-parser';
const app = express();


if (process.env.PRODUCTION !== true) {
dotenv.config({ path: path.resolve('config', '.env') });
}

app.use(fileUpload({ useTempFiles: true }));
app.use(morgan('dev'));
// Add cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

process.on("uncaughtException", (err) => {
  process.exit(1);
});
ConnectDb();

// cors allowed two origin
// app.use(cors({
  // origin:["http://localhost:3000","http://13.234.67.84:3000","http://www.propbidding.in","https://www.propbidding.in"],
  // credentials:true,
  // optionsSuccessStatus:200,
// }))
// Middleware setup
app.use(cors()); // Enable CORS if needed
app.use(bodyParser.json()); 

// Handle OPTIONS preflight requests
// API endpoint
app.get('/user/alldata', async (req, res) => {
  try {
    // Simulating data retrieval from a database (replace with your actual logic)
    const allData = await getAllUserData(); // Assume this function fetches data
    res.status(200).json(allData); // Ensure the response is JSON
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// // response send to json()
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use(cookieParser());

// Application Routes
// app.use("/user", userRoutes);
// app.use("/post", postRoutes);

// app.use("/expression-of-interest", ExpressionOfInterestRoutes);
// app.use("/Biddingform", BiddingFormRoutes);
// app.use("/schedule-visit", ScheduleVisitRoutes);
// app.use("/property-requirement", PostPropertyRequirementRoutes);
// app.use("/channel-partner", ChannelPartnerRoutes);
// app.use("/tenant-post-response", TenantPostResponseRoutes);
// app.use("/notify", NotifyRoutes);
// app.use('/favourite-post' ,FavouritePostRoutes)

// Admin Owner
// app.use("/admin-owner", AdminAndOwnerRoutes);


// app.use(express.static(join(process.cwd(), "frontend", "build")));
// app.get("*", function (req, res) {
//   res.sendFile(join(process.cwd(), "frontend", "build", "index.html"));
// });


// ;C:\Users\hii\Desktop\Amit\PropertyProject-master\frontend\public\index.html

// server listen
// const port = process.env.PORT;
const port = process.env.PORT||5000 ;
let server = app.listen(port);



initializeCrons()
process.on("unhandledRejection", (err) => {
  server.close(() => {
    process.exit(1);
  });
});
