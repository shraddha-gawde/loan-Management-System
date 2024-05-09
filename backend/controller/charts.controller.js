const { invoiceModel } = require("../models/invoices.model");
const { batchFilesModel } = require("../models/batchfiles.model");
const { userModel } = require("../models/user.model");
const { Sequelize, Op } = require("sequelize");

const getInvoicesByStatus = async (req, res) => {
    try {
      const { userID } = req;
  
      const invoiceCounts = await invoiceModel.findAll({
        attributes: ['status', [Sequelize.fn('COUNT', 'status'), 'count']],
        where: { created_by: userID },
        group: ['status']
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
          [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'], // Truncate time from created_at
          [Sequelize.fn('COUNT', 'created_at'), 'count']
        ],
        where: { created_by: userID },
        order: [[Sequelize.literal('DATE(created_at)'), 'DESC']], // Order by truncated date
        // limit: 5,
        raw: true,
        group: [Sequelize.fn('DATE', Sequelize.col('created_at'))] // Group by truncated date
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
            invoiceModel.sum('total_amount_due', {
                where: {
                    created_by: userID,
                    disbursed_by: null
                }
            }),
            invoiceModel.sum('total_amount_due', {
                where: {
                    created_by: userID,
                    disbursed_by: { [Op.not]: null }
                }
            })
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
        attributes: ['created_by', [Sequelize.fn('COUNT', 'created_by'), 'count']],
        where: {
          created_by: userID,
        }
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

const disburseAmountsSeller = async (req, res) => {
  const userID = req.userID;
  try {
    const [disbursedNullCount] = await Promise.all([
      invoiceModel.count({
          where: {
            accepted_by: userID,
              disbursed_by: null
          }
      }),
  ]);
      const [disbursedNullAmount, disbursedNotNullAmount] = await Promise.all([
          invoiceModel.sum('total_amount_due', {
              where: {
                accepted_by: userID,
                  disbursed_by: null
              }
          }),
          invoiceModel.sum('total_amount_due', {
              where: {
                accepted_by: userID,
                  disbursed_by: { [Op.not]: null }
              }
          })
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


  module.exports = {
    getInvoicesByStatus,
    getCountByDate,
    disburseAmounts, 
    countbatches,
    totalBatches,
    disburseAmountsSeller
  }