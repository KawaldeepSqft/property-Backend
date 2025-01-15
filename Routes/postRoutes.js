import express from "express";
import { UserAuthenticate } from "../Middelware/userAuthenticate.js";
import { authorizeRoles } from "../Middelware/Role.js";
import {
  CreatePost,
  GetLoginUserPost,
  UpdatePost,
  DeletePost,
  GetAllPost,
  GetSinglePost,
  GetProjectName,
  GetSinglePostProjectName,
} from "../Controller/postController.js";
 

const Routes = express.Router();

// Post Routes

//  login user Routes
Routes.post("/create", UserAuthenticate, CreatePost);
Routes.get("/login/allpost", UserAuthenticate, GetLoginUserPost);
Routes.put("/update/:postId",UserAuthenticate, authorizeRoles("Admin","Owner" ,"Buyer", "Tenant", "PropertyOwner","Channel Partner") ,  UpdatePost);
Routes.delete("/delete/:postId",  UserAuthenticate,authorizeRoles("Admin","Owner" ) , DeletePost);






//  Without Login user Routes
Routes.get("/allpost", GetAllPost);
Routes.get("/single/:postId", GetSinglePost);



 
//  Get All Project Name 

 Routes.get('/project-name' ,GetProjectName)
 Routes.post("/project-name/single" ,GetSinglePostProjectName)



 




export default Routes;
