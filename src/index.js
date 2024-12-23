// import('dotenv').config({path: './env'})
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Serve is runnig at PORT : ${process.env.PORT}`);
    })
    app.on("error" , (error) =>{
        console.log("ERRO:" , error);
        throw error
        })
  })
  .catch((err) => {
    console.log("MongoDB connection is failed  !!! ", err);
  });

// one way connect db with mongoose and the second way is proffessional  create a different db file and import file in this file
/*import express from "express";
const app = express()
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("ERROR:", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`App is listing on Port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("ERROR:", error);
    throw error;
  }
})();
*/
