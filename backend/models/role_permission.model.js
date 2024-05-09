const { DataTypes } = require("sequelize");
const connection = require("../config/db");
const { roleModel } = require("./role.model");
const { permissionModel } = require("./permission.model");

const RolePermission = connection.define(
  "RolePermission",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    timestamps: false,
    tableName: "RolePermission",
  }
);

roleModel.belongsToMany(permissionModel, { through: RolePermission, foreignKey: 'roleID' });
permissionModel.belongsToMany(roleModel, { through: RolePermission, foreignKey: 'permissionID' });

module.exports = { RolePermission };
