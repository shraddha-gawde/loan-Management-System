const xlsx = require("xlsx");
const { invoiceModel } = require("../models/invoices.model");
const { batchFilesModel } = require("../models/batchfiles.model");

const {
  getNextInvoiceNumber,
} = require("../middlewares/excel_file_handler.middleware");
const { userModel } = require("../models/user.model");
const {
  Sequelize,
} = require("sequelize");

const uploadInvoiceBatch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { BatchID, pancard, programType, region } = req.body;
    const created_by = req.userID;
    const user = await userModel.findOne({ where: { userID: created_by } });
    console.log(user);
    const invoiceFilePath = req.file.path;
    const formData = await batchFilesModel.create({
      name: user.username,
      email: user.email,
      invoiceFile: invoiceFilePath,
      created_by,
      fileName: req.file.filename,
      status: "uploaded",
      BatchID,
      pancard,
      programType,
      region,
    });

    const workbook = xlsx.readFile(invoiceFilePath,{cellDates: true, dateNF:
      'dd-mm-yyyy'});
    let data = {};

    workbook.SheetNames.forEach(async (sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      // console.log(`this is json data ${jsonData}`);
      for (const row of jsonData) {
        const nextInvoiceNumber = await getNextInvoiceNumber();

        const invoice = {
          invoice_number: nextInvoiceNumber,
          invoice_date: row.invoice_date,
          due_date: row.due_date,
          customer_name: row.customer_name,
          customer_address: row.customer_address,
          customer_contact: row.customer_contact,
          company_name: row.company_name,
          company_address: row.company_address,
          company_contact: row.company_contact,
          description: row.description,
          quantity: parseInt(row.quantity),
          unit_price: parseFloat(row.unit_price),
          subtotal: parseFloat(row.subtotal),
          tax_rate: parseFloat(row.tax_rate),
          tax_amount: parseFloat(row.tax_amount),
          discount: parseFloat(row.discount),
          total_amount_due: parseFloat(row.total_amount_due),
          payment_terms: row.payment_terms,
          notes: row.notes,
          batchid: formData.id,
          created_by: req.userID,
          accepted_by: null,
          rejected_by: null,
          disbursed_by: null,
          status: "uploaded",
        };

        const createdInvoice = await invoiceModel.create(invoice);
        data = createdInvoice;
        // console.log(createdInvoice);
      }
    });

    res.status(200).json({ success: true, formData, data });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error });
  }
};


const getInvoiceBatchByUser = async (req, res) => {
  try {
    const userID = req.userID;
    const { BatchID, status, fileName, region, programType } = req.query;
    const { sortBy, sortOrder } = req.query;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const where = {
      created_by: userID,
    };

    if (BatchID || status || fileName || region || programType) {
      if (BatchID) {
        where.BatchID = { [Sequelize.Op.like]: `%${BatchID}%` };
      }
      if (status) {
        where.status = { [Sequelize.Op.like]: `%${status}%` };
      }
      if (fileName) {
        where.fileName = { [Sequelize.Op.like]: `%${fileName}%` };
      }
      if (region) {
        where.region = { [Sequelize.Op.like]: `%${region}%` };
      }
      if (programType) {
        where.programType = { [Sequelize.Op.like]: `%${programType}%` };
      }
    }

    let order = [];
    if (sortBy === "BatchID" && (sortOrder === "ASC" || sortOrder === "DESC")) {
      order.push([sortBy, sortOrder]);
    }
    if (sortBy === "pancard" && (sortOrder === "ASC" || sortOrder === "DESC")) {
      order.push([sortBy, sortOrder]);
    }
    if (sortBy === "name" && (sortOrder === "ASC" || sortOrder === "DESC")) {
      order.push([sortBy, sortOrder]);
    }
    if (sortBy === "status" && (sortOrder === "ASC" || sortOrder === "DESC")) {
      order.push([sortBy, sortOrder]);
    }

    // Find batch files with pagination and sorting
    const batchFiles = await batchFilesModel.findAll({
      where,
      limit,
      offset,
      order,
      include: [
        { model: userModel, as: 'createdBy', attributes: ['username'] },
        { model: userModel, as: 'acceptedBy', attributes: ['username'] },
        { model: userModel, as: 'rejectedBy', attributes: ['username'] },
        { model: userModel, as: 'disbursedBy', attributes: ['username'] }
      ],
    });

    const totalEntries =
      BatchID || status || fileName
        ? await batchFilesModel.count({ where })
        : await batchFilesModel.count({ where: { created_by: userID } });

    // Pagination details
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalEntries / limit),
      totalEntries,
      hasNextPage: offset + batchFiles.length < totalEntries,
      hasPreviousPage: offset > 0,
      limit,
      offset,
    };
    // console.log(batchFiles);
    res.status(200).json({ success: true, batchFiles, pagination });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


const getInvoiceBatch = async (req, res) => {
  try {
    const { BatchID, status, fileName, region, programType } = req.query;
    const { sortBy, sortOrder } = req.query;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const where = {};

    if (BatchID || status || fileName || region || programType) {
      if (BatchID) {
        where.BatchID = { [Sequelize.Op.like]: `%${BatchID}%` };
      }
      if (status) {
        where.status = { [Sequelize.Op.like]: `%${status}%` };
      }
      if (fileName) {
        where.fileName = { [Sequelize.Op.like]: `%${fileName}%` };
      }
      if (region) {
        where.region = { [Sequelize.Op.like]: `%${region}%` };
      }
      if (programType) {
        where.programType = { [Sequelize.Op.like]: `%${programType}%` };
      }
    }

    let order = [];
    if (sortBy === "BatchID" && (sortOrder === "ASC" || sortOrder === "DESC")) {
      order.push([sortBy, sortOrder]);
    }
    if (sortBy === "pancard" && (sortOrder === "ASC" || sortOrder === "DESC")) {
      order.push([sortBy, sortOrder]);
    }
    if (sortBy === "name" && (sortOrder === "ASC" || sortOrder === "DESC")) {
      order.push([sortBy, sortOrder]);
    }
    if (sortBy === "status" && (sortOrder === "ASC" || sortOrder === "DESC")) {
      order.push([sortBy, sortOrder]);
    }
    if (sortBy === "region" && (sortOrder === "ASC" || sortOrder === "DESC")) {
      order.push([sortBy, sortOrder]);
    }

    const batchFiles = await batchFilesModel.findAll({
      where,
      limit,
      offset,
      order,
      include: [
        { model: userModel, as: 'createdBy', attributes: ['username'] },
        { model: userModel, as: 'acceptedBy', attributes: ['username'] },
        { model: userModel, as: 'rejectedBy', attributes: ['username'] },
        { model: userModel, as: 'disbursedBy', attributes: ['username'] }
      ],
    });

    const totalEntries =
      BatchID || status || fileName
        ? await batchFilesModel.count({ where })
        : await batchFilesModel.count();

    // Pagination details
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalEntries / limit),
      totalEntries,
      hasNextPage: offset + batchFiles.length < totalEntries,
      hasPreviousPage: offset > 0,
      limit,
      offset,
    };
    
    res.status(200).json({ success: true, batchFiles, pagination });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


const getInvoices = async (req, res) => {
  const batchid = req.params.id;
  const { sortBy, sortOrder, invoice_number, status, customer_name } =
    req.query;
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 5;
  const offset = (page - 1) * limit;

  const Batch = await batchFilesModel.findOne({ where: { id: batchid } });
  const BatchID = Batch.BatchID;

  try {
    const where = {
      batchid: batchid,
    };

    if (invoice_number || status || customer_name) {
      if (invoice_number) {
        where.invoice_number = { [Sequelize.Op.like]: `%${invoice_number}%` };
      }
      if (status) {
        where.status = { [Sequelize.Op.like]: `%${status}%` };
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
      invoice_number || status || customer_name
        ? await invoiceModel.count({ where })
        : await invoiceModel.count({ where: { batchid } });

    

    const totalPages = Math.ceil(totalEntries / limit);

    res.status(200).json({
      data: invoices,
      user: invoices.userID,
      pagination: {
        currentPage: page,
        totalPages,
        totalEntries,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        limit,
      },
      BatchID,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const getinvoiceByID = async (req, res) => {
  const invoiceid = req.params.id;
  console.log(invoiceid);
  try {
    const invoice = await invoiceModel.findOne({ where: { id: invoiceid } });

    const userID = invoice.created_by;

    const user = await userModel.findOne({ where: { userID } });
    res.status(200).json({ data: invoice, user: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


const downloadExcel = async (req, res) => {
  const id = req.params.id;
  try {
    const invoice = await batchFilesModel.findOne({ where: { id } });
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, error: "Invoice not found" });
    }

    const invoiceFilePath = invoice.invoiceFile;

    const filename = invoiceFilePath.replace(/^.*[\\\/]/, "");

    res.download(invoiceFilePath, filename);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


// const getInvoicesByStatus = async (req, res) => {
//   try {
//     const { userID } = req;
//     // const { status } = req.query;

//     let invoices;

//     if (
//       status === "accepted" ||
//       status === "rejected" ||
//       status === "disbursed" ||
//       status === "uploaded"
//     ) {
//       invoices = await invoiceModel.findAll({ where: { status } });
//     } else {
//       invoices = await invoiceModel.findAll({ where: { userID } });
//     }

//     res.status(200).json({ data: invoices });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error", error: error });
//   }
// };





const acceptInvoiceBySeller = async (req, res) => {
  try {
    const id = req.params.id;
    const userID = req.userID
    console.log(userID)
    // Find the invoice
    const invoice = await invoiceModel.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    await invoice.update({ status: 'accepted' });
    await invoice.update({ accepted_by: userID });
    const batchid = invoice.batchid;
    const batchInvoices = await invoiceModel.findAll({ where: { batchid } });
    const allInvoicesAccepted = batchInvoices.every(inv => inv.status === 'accepted');

    if (allInvoicesAccepted) {
      const id = batchid
      const batch = await batchFilesModel.findByPk(id);
      if (batch) {
        await batch.update({ status: 'accepted', accepted_by : userID });
       
      }
    } else {
      // Some invoices are accepted but not all
      const id = batchid
      const batch = await batchFilesModel.findByPk(id);
      if (batch && batch.status !== 'partially accepted') {
        await batch.update({ status: 'partially accepted' });
      }
    }

    res.status(200).json({ success: true, message: 'Invoice accepted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}


const rejectInvoiceBySeller = async (req, res) => {
  try {
    const id = req.params.id;
    const userID = req.userID
    console.log(userID)
    // Find the invoice
    const invoice = await invoiceModel.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    await invoice.update({ status: 'rejected' });
    await invoice.update({ rejected_by: userID });
    const batchid = invoice.batchid;
    const batchInvoices = await invoiceModel.findAll({ where: { batchid } });
    const allInvoicesAccepted = batchInvoices.every(inv => inv.status === 'rejected');

    if (allInvoicesAccepted) {
      const id = batchid
      const batch = await batchFilesModel.findByPk(id);
      if (batch) {
        await batch.update({ status: 'rejected' });
       
      }
    } 

    res.status(200).json({ success: true, message: 'Invoice rejected successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}


const getInvoicesAcceptedBySeller = async (req, res) => {
  const userID = req.userID
  const { sortBy, sortOrder, invoice_number, status, customer_name } =
    req.query;
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 5;
  const offset = (page - 1) * limit;

  
  try{
    const where = {
      accepted_by: userID,
    };
    // const data = await invoiceModel.findAll({where: {userID}} )

    if (invoice_number || status || customer_name) {
      if (invoice_number) {
        where.invoice_number = { [Sequelize.Op.like]: `%${invoice_number}%` };
      }
      if (status) {
        where.status = { [Sequelize.Op.like]: `%${status}%` };
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
      invoice_number || status || customer_name
        ? await invoiceModel.count({ where })
        : await invoiceModel.count({ where: { accepted_by: userID } });

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



module.exports = {
  getInvoices,
  getInvoiceBatchByUser,
  // updateInvoiceSellerDetails,
  rejectInvoiceBySeller,
  getInvoicesAcceptedBySeller,
  uploadInvoiceBatch,
  getinvoiceByID,
  downloadExcel,
  acceptInvoiceBySeller,
  getInvoiceBatch,
};
