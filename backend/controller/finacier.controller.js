const { invoiceModel } = require("../models/invoices.model");
const { batchFilesModel } = require("../models/batchfiles.model");
const { userModel } = require("../models/user.model");
const { Sequelize } = require("sequelize");


const disburseInvoiceByFinancier = async (req, res) => {
    try {
      const id = req.params.id;
      const userID = req.userID
      console.log(userID)
      // Find the invoice
      const invoice = await invoiceModel.findByPk(id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }
  
      await invoice.update({ status: 'disbursed' });
      await invoice.update({ disbursed_by: userID });
      const batchid = invoice.batchid;
      const batchInvoices = await invoiceModel.findAll({ where: { batchid } });
      const allInvoicesAccepted = batchInvoices.every(inv => inv.status === 'disbursed');
  
      if (allInvoicesAccepted) {
        const id = batchid
        const batch = await batchFilesModel.findByPk(id);
        if (batch) {
          await batch.update({ status: 'disbursed', disbursed_by : userID });
        }
      } else {
        // Some invoices are accepted but not all
        const id = batchid
        const batch = await batchFilesModel.findByPk(id);
        if (batch && batch.status !== 'partially accepted') {
          await batch.update({ status: 'partially accepted' });
        }
      }
  
      res.status(200).json({ success: true, message: 'Invoice disbursed successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
  


  const getAllInvoicesAcceptedBySellers = async (req, res) => {
    const userID = req.userID
    const { sortBy, sortOrder, invoice_number, customer_name } =
      req.query;
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;
    const offset = (page - 1) * limit;
  
    
    try{
      const where = {
        status: ['accepted', 'disbursed']  
      };
      // const data = await invoiceModel.findAll({where: {userID}} )
  
      if (invoice_number || customer_name) {
        if (invoice_number) {
          where.invoice_number = { [Sequelize.Op.like]: `%${invoice_number}%` };
        }
        
        if (customer_name) {
          where.customer_name = { [Sequelize.Op.like]: `%${customer_name}%` };
        }
      }
  
      let order = [];
      if (sortBy && (sortOrder === "ASC" || sortOrder === "DESC")) {
        order.push([sortBy, sortOrder]);
      }
      const invoices = await invoiceModel.findAll({
        where,
        order,
        limit,
        offset,
        include: [
          { model: userModel, as: 'acceptedByInvoice', attributes: ['username'] },
          { model: userModel, as: 'createdByInvoice', attributes: ['username'] },
          { model: userModel, as: 'rejectedByInvoice', attributes: ['username'] },
          { model: userModel, as: 'disbursedByInvoice', attributes: ['username'] },
          { model: batchFilesModel, as: 'Batch_ID', attributes: ['BatchID'] }
        ]});
  
      const totalEntries =
        invoice_number || customer_name
          ? await invoiceModel.count({ where })
          : await invoiceModel.count({ where: {  status: ['accepted', 'disbursed'] } });
  
          // const BatchID = Batch.BatchID;
  
      const totalPages = Math.ceil(totalEntries / limit);
  
      res.status(200).json({
        data: invoices,
        user: invoices.userID,
        paginations: {
          currentPage: page,
          totalPages,
          totalEntries,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          limit,
        },
      });
    }catch(error){
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
      
    }
  }
  const getAllInvoicesrejected = async (req, res) => {
    const userID = req.userID
    const { sortBy, sortOrder, invoice_number, customer_name } =
      req.query;
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;
    const offset = (page - 1) * limit;
  
    
    try{
      const where = {
        status: 'rejected',
        rejected_by : userID 
      };
      // const data = await invoiceModel.findAll({where: {userID}} )
  
      if (invoice_number || customer_name) {
        if (invoice_number) {
          where.invoice_number = { [Sequelize.Op.like]: `%${invoice_number}%` };
        }
        
        if (customer_name) {
          where.customer_name = { [Sequelize.Op.like]: `%${customer_name}%` };
        }
      }
  
      let order = [];
      if (sortBy && (sortOrder === "ASC" || sortOrder === "DESC")) {
        order.push([sortBy, sortOrder]);
      }
      const invoices = await invoiceModel.findAll({
        where,
        order,
        limit,
        offset,
        include: [
          { model: userModel, as: 'acceptedByInvoice', attributes: ['username'] },
          { model: userModel, as: 'createdByInvoice', attributes: ['username'] },
          { model: userModel, as: 'rejectedByInvoice', attributes: ['username'] },
          { model: userModel, as: 'disbursedByInvoice', attributes: ['username'] },
          { model: batchFilesModel, as: 'Batch_ID', attributes: ['BatchID'] }
        ]});
  
      const totalEntries =
        invoice_number || customer_name
          ? await invoiceModel.count({ where })
          : await invoiceModel.count({ where: {  status: 'rejected', rejected_by: userID } });
  
          // const BatchID = Batch.BatchID;
  
      const totalPages = Math.ceil(totalEntries / limit);
  
      res.status(200).json({
        data: invoices,
        user: invoices.userID,
        paginations: {
          currentPage: page,
          totalPages,
          totalEntries,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          limit,
        },
      });
    }catch(error){
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
      
    }
  }
  
module.exports= {
    disburseInvoiceByFinancier,
    getAllInvoicesAcceptedBySellers,
    getAllInvoicesrejected
}
  