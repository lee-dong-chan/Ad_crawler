import { Model, DataTypes } from "sequelize";

export default class List extends Model {
  static init(sequelize) {
    return super.init(
      {
        appid: {
          type: DataTypes.INTEGER(20),
          allowNull: false,
          unique: true,
        },
        videoname: {
          type: DataTypes.STRING(30),
          allowNull: false,
        },
        filepath: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "List",
        tableName: "list",
        underscored: true,
        timestamps: true,
        paranoid: true,
      }
    );
  }
}
