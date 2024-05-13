const { invoiceModel } = require("../models/invoices.model");
const { batchFilesModel } = require("../models/batchfiles.model");
const { userModel } = require("../models/user.model");
const { Sequelize, Op } = require("sequelize");

const getInvoicesByStatus = async (req, res) => {
  try {
    const { userID } = req;

    const invoiceCounts = await invoiceModel.findAll({
      attributes: ["status", [Sequelize.fn("COUNT", "status"), "count"]],
      where: { created_by: userID },
      group: ["status"],
    });

    res.status(200).json({ data: invoiceCounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};

const getCountByDate = async (req, res) => {
  try {
    const { userID } = req;

    const latestFiveDates = await invoiceModel.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("created_at")), "date"], 
        [Sequelize.fn("COUNT", "created_at"), "count"],
      ],
      where: { created_by: userID },
      order: [[Sequelize.literal("DATE(created_at)"), "DESC"]], 
      limit: 5,
      raw: true,
      group: [Sequelize.fn("DATE", Sequelize.col("created_at"))], 
    });

    res.status(200).json({ data: latestFiveDates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};


const disburseAmounts = async (req, res) => {
  const userID = req.userID;
  try {
    const [disbursedNullAmount, disbursedNotNullAmount] = await Promise.all([
      invoiceModel.sum("total_amount_due", {
        where: {
          created_by: userID,
          disbursed_by: null,
        },
      }),
      invoiceModel.sum("total_amount_due", {
        where: {
          created_by: userID,
          disbursed_by: { [Op.not]: null },
        },
      }),
    ]);
    res.status(200).json({
      disbursedNullAmount,
      disbursedNotNullAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const countbatches = async (req, res) => {
  const userID = req.userID;
  try {
    const totalbatch = await batchFilesModel.findAll({
      attributes: [
        "created_by",
        [Sequelize.fn("COUNT", "created_by"), "count"],
      ],
      where: {
        created_by: userID,
      },
    });

    res.status(200).json(totalbatch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const totalBatches = async (req, res) => {
  try {
    const totalBatchCount = await batchFilesModel.count();

    res.status(200).json({ totalBatchCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const totalinvoicesAccepted = async (req, res) => {
  try {
    const totalCount = await invoiceModel.count({
      where: {
        accepted_by: { [Op.not]: null },
      },
    });
    const totalCountNull = await invoiceModel.count({
      where: {
        accepted_by: { [Op.not]: null },
        disbursed_by: null,
        rejected_by: null,
      },
    });

    res.status(200).json({ totalCount, totalCountNull });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const disburseAmountsSeller = async (req, res) => {
  const userID = req.userID;
  try {
    const [disbursedNullCount] = await Promise.all([
      invoiceModel.count({
        where: {
          accepted_by: userID,
          disbursed_by: null,
        },
      }),
    ]);
    const [disbursedNullAmount, disbursedNotNullAmount] = await Promise.all([
      invoiceModel.sum("total_amount_due", {
        where: {
          accepted_by: userID,
          disbursed_by: null,
        },
      }),
      invoiceModel.sum("total_amount_due", {
        where: {
          accepted_by: userID,
          disbursed_by: { [Op.not]: null },
        },
      }),
    ]);
    res.status(200).json({
      disbursedNullCount,
      disbursedNullAmount,
      disbursedNotNullAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const disburseAmountsFinancier = async (req, res) => {
  const userID = req.userID;
  console.log(userID);
  try {
    const [disbursedNullAmount, disbursedNotNullAmount] = await Promise.all([
      invoiceModel.sum("total_amount_due", {
        where: {
          accepted_by: { [Op.not]: null },
          disbursed_by: null,
        },
      }),
      invoiceModel.sum("total_amount_due", {
        where: {
          accepted_by: { [Op.not]: null },
          disbursed_by: userID,
        },
      }),
    ]);
    res.status(200).json({
      disbursedNullAmount,
      disbursedNotNullAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getInvoicesByStatusSeller = async (req, res) => {
  try {
    const userID = req.userID;

    // Find counts of invoices by status
    const invoiceCounts = await invoiceModel.findAll({
      attributes: ["status", [Sequelize.fn("COUNT", "status"), "count"]],
      where: {
        [Op.or]: [{ accepted_by: userID }, { rejected_by: userID }],
      },
      group: ["status"],
    });

    const totalInvoices = await invoiceModel.count();
    let acceptedCount = 0;
    let rejectedCount = 0;
    let disbursedCount = 0;

    invoiceCounts.forEach((invoice) => {
      if (invoice.status === "accepted") {
        count = invoice.get("count");
        acceptedCount = count + disbursedCount;
      } else if (invoice.status === "rejected") {
        rejectedCount = invoice.get("count");
      } else if (invoice.status === "disbursed") {
        disbursedCount = invoice.get("count");
      }
    });

    const acceptedPercentage = (acceptedCount / totalInvoices) * 100;
    const rejectedPercentage = (rejectedCount / totalInvoices) * 100;
    const disbursedPercentage = (disbursedCount / totalInvoices) * 100;

    res.status(200).json({
      data: {
        acceptedCount,
        rejectedCount,
        disbursedCount,
        totalInvoices,
        acceptedPercentage,
        rejectedPercentage,
        disbursedPercentage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};


const getCountByDateFinancier = async (req, res) => {
  try {
    const userID = req.userID;

    const latestFiveDates = await invoiceModel.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('updated_at')), 'date'], 
        [
          Sequelize.literal(`SUM(CASE WHEN status = 'disbursed' THEN 1 ELSE 0 END)`), 
          'disbursed_count'
        ],
        [
          Sequelize.literal(`SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)`), 
          'rejected_count'
        ]
      ],
      where: { [Op.or]: {disbursed_by: userID, rejected_by: userID} },
      order: [[Sequelize.literal('DATE(updated_at)'), 'DESC']], 
      limit: 5,
      raw: true,
      group: [Sequelize.fn('DATE', Sequelize.col('updated_at'))] 
    });

    res.status(200).json({ data: latestFiveDates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};


const getInvoicesByStatusFinance = async (req, res) => {
  try {
    const userID = req.userID;

    const invoiceCounts = await invoiceModel.findAll({
      attributes: ["status", [Sequelize.fn("COUNT", "status"), "count"]],
      where: { [Op.or]: {accepted_by: { [Op.not]: null }, disbursed_by: userID} },
      group: ["status"],
    });

    res.status(200).json({ data: invoiceCounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};

module.exports = {
  getInvoicesByStatus,
  getCountByDate,
  disburseAmounts,
  countbatches,
  totalBatches,
  disburseAmountsSeller,
  totalinvoicesAccepted,
  disburseAmountsFinancier,
  getInvoicesByStatusSeller,
  getCountByDateFinancier,
  getInvoicesByStatusFinance
};
