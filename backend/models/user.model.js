const { DataTypes } = require("sequelize");
const connection = require("../config/db");
const { batchFilesModel } = require("./batchfiles.model");
const { roleModel } = require("./role.model");
const { invoiceModel } = require("./invoices.model");

const userModel = connection.define(
  "Users",
  {
    userID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleID: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'Roles', 
        key: 'roleID' 
      }
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
  },
  {
    tableName: "Users",
    timestamps: false,
  }
);

userModel.belongsTo(roleModel, { foreignKey: 'roleID', as: 'rolename' });

batchFilesModel.belongsTo(userModel, { foreignKey: 'created_by', as: 'createdBy'});
batchFilesModel.belongsTo(userModel, { foreignKey: 'accepted_by', as:'acceptedBy' });
batchFilesModel.belongsTo(userModel, { foreignKey: 'rejected_by', as: 'rejectedBy'});
batchFilesModel.belongsTo(userModel, {foreignKey :'disbursed_by', as: 'disbursedBy'});

invoiceModel.belongsTo(userModel, { foreignKey: 'created_by', as: 'createdByInvoice'});
invoiceModel.belongsTo(userModel, { foreignKey: 'accepted_by', as:'acceptedByInvoice' });
invoiceModel.belongsTo(userModel, { foreignKey: 'rejected_by', as: 'rejectedByInvoice'});
invoiceModel.belongsTo(userModel, {foreignKey :'disbursed_by', as: 'disbursedByInvoice'})

module.exports = { userModel };
