const { invoiceModel } = require("../models/invoices.model");
const moment = require('moment');
const getNextInvoiceNumber = async () => {
    const lastInvoice = await invoiceModel.findOne({
      order: [["id", "DESC"]],
    });
    const lastInvoiceNumber = lastInvoice ? parseInt(lastInvoice.invoice_number.substring(2)) : 0;
    return "IV" + ("000" + (lastInvoiceNumber + 1)).slice(-3);
  };

  const parseDate = (dateString) => {
    
    return moment(dateString, 'DD-MM-YYYY').toDate(); 
  };
module.exports = {
    getNextInvoiceNumber,
    parseDate
}