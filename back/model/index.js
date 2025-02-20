import Sequelize from "sequelize";
import fs from "fs";
import ListModel from "../model/list.js";

const mySQLconfig = JSON.parse(
  fs.readFileSync("./config/config.json", "utf-8")
);
const env = process.env.NODE_ENV || "development";
const config = mySQLconfig[env];

export const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

export const List = ListModel.init(sequelize);

const db = {
  List,
};

export { Sequelize };
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
