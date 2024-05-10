const { invoiceModel } = require("../models/invoices.model");
const { batchFilesModel } = require("../models/batchfiles.model");
const { userModel } = require("../models/user.model");
const { Sequelize, Op } = require("sequelize");
const json2xls = require('json2xls');
const jsPDF = require('jspdf');
const htmlToPdf = require('html2pdf');

const report = async (req, res) => {
    const userID = req.userID;
    const { startDate, endDate, reportType } = req.body;
console.log(req.body)
    try {
        let reportData;

        if (reportType === 'summary') {
            reportData = await generateSummaryReport(userID, startDate, endDate);
        } else if (reportType === 'detailed') {
            reportData = await generateDetailedReport(userID, startDate, endDate);
        } else {
            return res.status(400).json({ message: 'Invalid report type' });
        }

        res.status(200).json(reportData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error });
    }
};

const generateSummaryReport = async (userID, startDate, endDate) => {
    try {
        const user =  await userModel.findOne({where:{userID}})
        const invoiceCounts = await invoiceModel.findAll({
            attributes: ['status', [Sequelize.fn('COUNT', 'status'), 'count']],
            where: { created_by: userID, createdAt: { [Op.between]: [startDate, endDate] } },
            group: ['status']
        });

        const totalBatchCount = await batchFilesModel.count({
            where: { created_by: userID, createdAt: { [Op.between]: [startDate, endDate] } }
        });

        const latestFiveDates = await invoiceModel.findAll({
            attributes: [
                [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
                [Sequelize.fn('COUNT', 'created_at'), 'count']
            ],
            where: { created_by: userID, created_at: { [Op.between]: [startDate, endDate] } },
            order: [[Sequelize.literal('DATE(created_at)'), 'DESC']],
            raw: true,
            group: [Sequelize.fn('DATE', Sequelize.col('created_at'))]
        });

        const [disbursedNullAmount, disbursedNotNullAmount] = await Promise.all([
            invoiceModel.sum('total_amount_due', {
                where: { created_by: userID, disbursed_by: null, created_at: { [Op.between]: [startDate, endDate] } }
            }),
            invoiceModel.sum('total_amount_due', {
                where: { created_by: userID, disbursed_by: { [Op.not]: null }, created_at: { [Op.between]: [startDate, endDate] } }
            })
        ]);

        return { user, invoiceCounts, totalBatchCount, latestFiveDates, disbursedNotNullAmount, disbursedNullAmount };
    } catch (error) {
        console.error('Error generating summary report:', error);
        throw error;
    }
};

const generateDetailedReport = async (userID, startDate, endDate) => {
    try {
        const acceptedInvoices = await invoiceModel.findAll({
            where: { created_by: userID, status: 'accepted', created_at: { [Op.between]: [startDate, endDate] } },
            include :[{ model: userModel, as: 'acceptedByInvoice', attributes: ['username'] },
            { model: batchFilesModel, as: 'Batch_ID', attributes: ['BatchID'] }]
        });

        const rejectedInvoices = await invoiceModel.findAll({
            where: { created_by: userID, status: 'rejected', created_at: { [Op.between]: [startDate, endDate] } },
            include :[{ model: userModel, as: 'rejectedByInvoice', attributes: ['username'] },
            { model: batchFilesModel, as: 'Batch_ID', attributes: ['BatchID'] }]
        });

        const disbursedInvoices = await invoiceModel.findAll({
            where: { created_by: userID, status: 'disbursed', created_at: { [Op.between]: [startDate, endDate] } },
            include :[{ model: userModel, as: 'disbursedByInvoice', attributes: ['username'] },
            { model: batchFilesModel, as: 'Batch_ID', attributes: ['BatchID'] }]
        });

        const batches = await batchFilesModel.findAll({
            where: { created_by: userID, createdAt: { [Op.between]: [startDate, endDate] } },
            include: [
                { model: userModel, as: 'createdBy', attributes: ['username'] },
        { model: userModel, as: 'acceptedBy', attributes: ['username'] },
        { model: userModel, as: 'rejectedBy', attributes: ['username'] },
        { model: userModel, as: 'disbursedBy', attributes: ['username'] }
      
            ]
        });

        return { acceptedInvoices, rejectedInvoices, disbursedInvoices, batches };
    } catch (error) {
        console.error('Error generating detailed report:', error);
        throw error;
    }
};

const exportPdf = (req, res) => {
    // Sample data
    const data = req.body;

    // Generate HTML content for PDF
    const htmlContent = `<html><body><h1>PDF Report</h1><pre>${JSON.stringify(data)}</pre></body></html>`;

    // Convert HTML to PDF
    htmlToPdf().from(htmlContent).toPdf().get((pdf) => {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
        res.send(pdf);
    });
};

// Export data in Excel format
const exportExcel = (req, res) => {
    // Sample data
    const data = req.body;

    // Convert JSON to Excel
    const xls = json2xls(data);

    // Stream the Excel content to the response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');
    res.end(xls, 'binary');
};

  module.exports = {
report,
exportExcel,
exportPdf
  }