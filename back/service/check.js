import { List, Sequelize } from "../model/index.js";

export default async (req, res) => {
  try {
    const AppstoreID = req.params;

    if (!AppstoreID) {
      res.status(400).json({ message: "not find apple id" });
    }

    const check = await List.findOne({ where: AppstoreID });

    if (check) {
      return res.status(200).json({ find: true });
    } else if (!check) {
      return res.json({ find: false });
    }
  } catch (err) {
    return res.status(500).json({ message: "서버 오류", error: err.message });
  }
};
