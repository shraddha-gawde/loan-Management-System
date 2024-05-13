const { invoiceModel } = require("../models/invoices.model");
const { batchFilesModel } = require("../models/batchfiles.model");
const { userModel } = require("../models/user.model");
const { Sequelize, Op } = require("sequelize");

const report = async (req, res) => {
  const userID = req.userID;
  const { startDate, endDate, reportType } = req.body;
  console.log(req.body);
  try {
    let reportData;

    if (reportType === "summary") {
      reportData = await generateSummaryReport(userID, startDate, endDate);
    } else if (reportType === "detailed") {
      reportData = await generateDetailedReport(userID, startDate, endDate);
    } else {
      return res.status(400).json({ message: "Invalid report type" });
    }

    res.status(200).json(reportData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};

const generateSummaryReport = async (userID, startDate, endDate) => {
  try {
    const user = await userModel.findOne({ where: { userID } });
    const invoiceCounts = await invoiceModel.findAll({
      attributes: ["status", [Sequelize.fn("COUNT", "status"), "count"]],
      where: {
        created_by: userID,
        createdAt: { [Op.between]: [startDate, endDate] },
      },
      group: ["status"],
    });

    const totalBatchCount = await batchFilesModel.count({
      where: {
        created_by: userID,
        createdAt: { [Op.between]: [startDate, endDate] },
      },
    });

    const latestFiveDates = await invoiceModel.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("created_at")), "date"],
        [Sequelize.fn("COUNT", "created_at"), "count"],
      ],
      where: {
        created_by: userID,
        created_at: { [Op.between]: [startDate, endDate] },
      },
      order: [[Sequelize.literal("DATE(created_at)"), "DESC"]],
      raw: true,
      group: [Sequelize.fn("DATE", Sequelize.col("created_at"))],
    });

    const [disbursedNullAmount, disbursedNotNullAmount] = await Promise.all([
      invoiceModel.sum("total_amount_due", {
        where: {
          created_by: userID,
          disbursed_by: null,
          created_at: { [Op.between]: [startDate, endDate] },
        },
      }),
      invoiceModel.sum("total_amount_due", {
        where: {
          created_by: userID,
          disbursed_by: { [Op.not]: null },
          created_at: { [Op.between]: [startDate, endDate] },
        },
      }),
    ]);

    return {
      user,
      invoiceCounts,
      totalBatchCount,
      latestFiveDates,
      disbursedNotNullAmount,
      disbursedNullAmount,
    };
  } catch (error) {
    console.error("Error generating summary report:", error);
    throw error;
  }
};

const generateDetailedReport = async (userID, startDate, endDate) => {
  try {
    const acceptedInvoices = await invoiceModel.findAll({
      where: {
        created_by: userID,
        status: "accepted",
        created_at: { [Op.between]: [startDate, endDate] },
      },
      include: [
        { model: userModel, as: "acceptedByInvoice", attributes: ["username"] },
        { model: batchFilesModel, as: "Batch_ID", attributes: ["BatchID"] },
      ],
    });

    const rejectedInvoices = await invoiceModel.findAll({
      where: {
        created_by: userID,
        status: "rejected",
        created_at: { [Op.between]: [startDate, endDate] },
      },
      include: [
        { model: userModel, as: "rejectedByInvoice", attributes: ["username"] },
        { model: batchFilesModel, as: "Batch_ID", attributes: ["BatchID"] },
      ],
    });

    const disbursedInvoices = await invoiceModel.findAll({
      where: {
        created_by: userID,
        status: "disbursed",
        created_at: { [Op.between]: [startDate, endDate] },
      },
      include: [
        {
          model: userModel,
          as: "disbursedByInvoice",
          attributes: ["username"],
        },
        { model: batchFilesModel, as: "Batch_ID", attributes: ["BatchID"] },
      ],
    });

    const batches = await batchFilesModel.findAll({
      where: {
        created_by: userID,
        createdAt: { [Op.between]: [startDate, endDate] },
      },
      include: [
        { model: userModel, as: "createdBy", attributes: ["username"] },
        { model: userModel, as: "acceptedBy", attributes: ["username"] },
        { model: userModel, as: "rejectedBy", attributes: ["username"] },
        { model: userModel, as: "disbursedBy", attributes: ["username"] },
      ],
    });

    return { acceptedInvoices, rejectedInvoices, disbursedInvoices, batches };
  } catch (error) {
    console.error("Error generating detailed report:", error);
    throw error;
  }
};

const reportSeller = async (req, res) => {
  const userID = req.userID;
  const { startDate, endDate, reportType } = req.body;
  console.log(req.body);
  try {
    let reportData;

    if (reportType === "summary") {
      reportData = await generateSummaryReportSeller(
        userID,
        startDate,
        endDate
      );
    } else if (reportType === "detailed") {
      reportData = await generateDetailedReportSeller(userID, startDate, endDate);
    } else {
      return res.status(400).json({ message: "Invalid report type" });
    }

    res.status(200).json(reportData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};


const generateSummaryReportSeller = async (userID, startDate, endDate) => {
  try {
    const user = await userModel.findOne({ where: { userID } });

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

    const totalBatchCount = await batchFilesModel.count({
      where: {
        accepted_by: userID,
        createdAt: { [Op.between]: [startDate, endDate] },
      },
    });

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
          created_at: { [Op.between]: [startDate, endDate] },
        },
      }),
      invoiceModel.sum("total_amount_due", {
        where: {
          accepted_by: userID,
          disbursed_by: { [Op.not]: null },
          created_at: { [Op.between]: [startDate, endDate] },
        },
      }),
    ]);

    return {
      user,
      totalInvoices,
      totalBatchCount,
      disbursedNotNullAmount,
      disbursedNullAmount,
      disbursedNullCount,
      acceptedCount,
      rejectedCount,
      disbursedCount
    };
  } catch (error) {
    console.error("Error generating summary report:", error);
    throw error;
  }
};

const generateDetailedReportSeller = async (userID, startDate, endDate) => {
    try {
        const user = await userModel.findOne({ where: { userID } });
      const acceptedInvoices = await invoiceModel.findAll({
        where: {
          accepted_by: userID,
          created_at: { [Op.between]: [startDate, endDate] },
        },
        include: [
          { model: userModel, as: "createdByInvoice", attributes: ["username"] },
          { model: batchFilesModel, as: "Batch_ID", attributes: ["BatchID"] },
        ],
      });
  
      const rejectedInvoices = await invoiceModel.findAll({
        where: {
          [Op.or]: [
            {
              rejected_by: userID,
              created_at: { [Op.between]: [startDate, endDate] },
            },
            {
              accepted_by: userID,
              rejected_by: true,
              created_at: { [Op.between]: [startDate, endDate] },
            },
          ],
        },
        include: [
          { model: userModel, as: "rejectedByInvoice", attributes: ["username"] },
          { model: batchFilesModel, as: "Batch_ID", attributes: ["BatchID"] },
        ],
      });
      
  
      const disbursedInvoices = await invoiceModel.findAll({
        where: {
          accepted_by: userID,
          status: "disbursed",
          created_at: { [Op.between]: [startDate, endDate] },
        },
        include: [
          {
            model: userModel,
            as: "disbursedByInvoice",
            attributes: ["username"],
          },
          { model: batchFilesModel, as: "Batch_ID", attributes: ["BatchID"] },
        ],
      });
  
      const batches = await batchFilesModel.findAll({
        where: {
          accepted_by: userID,
          createdAt: { [Op.between]: [startDate, endDate] },
        },
        include: [
          { model: userModel, as: "createdBy", attributes: ["username"] },
          { model: userModel, as: "acceptedBy", attributes: ["username"] },
          { model: userModel, as: "rejectedBy", attributes: ["username"] },
          { model: userModel, as: "disbursedBy", attributes: ["username"] },
        ],
      });
  
      return { user, acceptedInvoices, rejectedInvoices, disbursedInvoices, batches };
    } catch (error) {
      console.error("Error generating detailed report:", error);
      throw error;
    }
  };

module.exports = {
  report,
  reportSeller
};
