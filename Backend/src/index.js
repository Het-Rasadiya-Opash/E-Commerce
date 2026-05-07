import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/db.js";
import { app } from "./app.js";
import http from "http";
import { initSocket } from "./socket.js";
import { startFlashSaleCron } from "./utils/flashSaleCron.js";

const server = http.createServer(app);
initSocket(server);

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(`Server is Running on ${process.env.PORT || 8000}`);
    });

    startFlashSaleCron();
  })
  .catch((err) => {
    console.log("DB Connection Failed..!", err);
  });
