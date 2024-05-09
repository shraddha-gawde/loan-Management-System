const { DataTypes, ForeignKeyConstraintError } = require("sequelize");
const connection = require("../config/db");
const { userModel } = require("./user.model");

const roleModel = connection.define(
  "Roles",
  {
    roleID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "admin",
    },
  },
  {
    timestamps: false,
    tableName: "Roles",
  }
);
// userModel.belongsTo(roleModel, {foreignKey:'roleID'})
module.exports = { roleModel };
