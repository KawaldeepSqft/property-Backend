import mongoose from "mongoose";

const ConnectDb = async () => {
  try {
    const connectionUri = process.env.DATABASE_URI
  
    mongoose.set("strictQuery", true);

    await mongoose.connect(connectionUri||"mongodb+srv://kawaldeep8395:0bH8zxmTjrjPPXPU@newproject.jhcy4.mongodb.net/PropertyData");
    console.log("Database Connect Successfully");
  } catch (error) {
    console.log(error);
  }
};
export default ConnectDb;
