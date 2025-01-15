import mongoose from "mongoose";

const ConnectDb = async () => {
  try {
    const connectionUri = process.env.DATABASE_URI
  
    mongoose.set("strictQuery", true);

    await mongoose.connect(connectionUri);
    console.log("Database Connect Successfully");
  } catch (error) {
    console.log(error);
  }
};
export default ConnectDb;
