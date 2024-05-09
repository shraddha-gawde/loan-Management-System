const { DataTypes } = require("sequelize");
const connection = require("../config/db");
const { userModel } = require("./user.model");
const { batchFilesModel } = require("./batchfiles.model");

const invoiceModel = connection.define(
  "Invoice",
  {
    id : {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    invoice_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    invoice_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    // Customer Information
    customer_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customer_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customer_contact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Company Information
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_contact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Line Items
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    // Subtotal
    subtotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    // Tax Information
    tax_rate: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tax_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    // Discounts
    discount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    // Total Amount Due
    total_amount_due: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    // Payment Terms
    payment_terms: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Notes or Terms
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('uploaded', 'accepted', 'rejected', 'disbursed'),
      defaultValue: 'uploaded',
    },
    // Additional Fields
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
    batchid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: batchFilesModel,
        key: 'id'
      }
    },

    created_at: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW
    }
  },
  {
    tableName: "Invoices",
    timestamps: true,
    underscored: true
  }
);

module.exports = { invoiceModel };
