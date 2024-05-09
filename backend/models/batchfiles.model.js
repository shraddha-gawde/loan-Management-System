const { DataTypes } = require("sequelize");
const connection = require("../config/db");
const { userModel } = require("./user.model");
const { invoiceModel } = require("./invoices.model");

const batchFilesModel = connection.define(
  "BatchFiles",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    invoiceFile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: userModel,
        key: 'userID'
      }
    },
    accepted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: userModel,
        key: 'userID'
      }
    },
    rejected_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: userModel,
        key: 'userID'
      }
    },
    disbursed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: userModel,
        key: 'userID'
      }
    },
    status: {
        type: DataTypes.ENUM('uploaded', 'accepted', 'rejected', 'disbursed', 'partially accepted'),
        defaultValue: 'uploaded',
      },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    BatchID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pancard: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    programType: {
      type: DataTypes.ENUM('vender program', 'dealer program',),
      allowNull: false,
    },
    region: {
      type: DataTypes.ENUM('south', 'north', 'east', 'west'),
      allowNull: false,
    },
  },
  {
    tableName: "BatchFiles",
    timestamps: false,
  }
);
invoiceModel.belongsTo(batchFilesModel,{foreignKey:"batchid", as: "Batch_ID"})
module.exports = { batchFilesModel };
