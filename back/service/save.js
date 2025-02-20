import { List, Sequelize } from "../model/index.js";

export default async (req, res) => {
  try {
    const body = req.body;
    const upload = await List.create(body);
    console.log(upload);
    res.status(200).json({ upload: "complete" });
  } catch (err) {
    res.send("error");
  }
};
