import mongoose from "mongoose";

const ProjectNameSchema =  mongoose.Schema({
  Segment: { type:String ,trim: true},
  "Project Name": { type:String ,trim: true},
  "Project Status": { type:String ,trim: true},
  "Apartment Type": { type:String ,trim: true},
  "Total Tower":  { type:mongoose.Schema.Types.Mixed ,trim: true} , // Mixed to allow strings/numbers
  "Total Units":  { type:mongoose.Schema.Types.Mixed ,trim: true} ,
  "Total Land Area": { type:String ,trim: true},  
  Price:  { type:String ,trim: true} ,
  Locality: { type:String ,trim: true},
  "City": { type:String ,trim: true},
});
const ProjectNameModel = mongoose.model("NewProjectName", ProjectNameSchema);

export default ProjectNameModel;
