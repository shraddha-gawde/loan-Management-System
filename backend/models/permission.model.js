const { DataTypes } = require("sequelize");
const connection = require("../config/db");

const permissionModel = connection.define(
  "Permission",
  {
    permissionID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    permission: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "Permissions",
  }
);

module.exports = { permissionModel };
