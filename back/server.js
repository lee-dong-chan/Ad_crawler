import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

import router from "./controllers/index.js";
import { sequelize } from "./model/index.js";
dotenv.config();

const app = express();

app.set("port", process.env.PORT || 3000);

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", router);

const force = false;
sequelize.sync({ force });

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "server open");
});
