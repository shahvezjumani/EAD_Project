import app from "./app.js";
import connectDB from "./DB/index.js";
import dotenv from "dotenv";
dotenv.config();

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error(`error ${error}`);
      throw error;
    });
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.error(`MONGODB Connection Failed ${error}`);
  });
