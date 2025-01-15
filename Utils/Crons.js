import cron from "node-cron";
import PostModel from "../Model/postModel.js";

const initializeCrons = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      // Calculate the date and time for 2 minutes agos
      // const ninetyDaysAgo = new Date(Date.now() - 1 * 60 * 1000); // Subtract 2 minutes
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Subtract 2 minutes
      console.log("This message will be logged every OneDay");

      // Check if there are any posts where PostVerify is true and older than 2 minutes
      const postsToUpdate = await PostModel.find({
        PostVerify: true,
        "PostVerifyData.Time": { $lte: ninetyDaysAgo }, // Posts older than 2 minutes
      });
      

      
      if (postsToUpdate.length > 0) {
        // Update all posts where PostVerify is true and PostVerifyData.Time is older than two minutes ago
        const constUpdatePost = await PostModel.updateMany(
          {
            PostVerify: true,
            "PostVerifyData.Time": { $lt: ninetyDaysAgo }, // Check for posts older than 2 minutes
          },
          {
            PostVerify: false,
            PostExpired: { ExpiredStatus: true, ExpiredTime: Date.now() },
          } // Mark PostVerify as false
        );

        console.log(constUpdatePost);
        console.log(`Updated ${constUpdatePost.modifiedCount} posts.`);
      }
    } catch (error) {
      console.log(error);
    }
  });

  console.log("Cron Start");
};
export default initializeCrons;
