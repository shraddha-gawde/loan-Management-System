const express = require("express");
const router = express.Router();

const {
  registerAdmin,
  login,
  getUsers,
  addUser,
  deleteUser,
  updateUser,
  countUsersByRole,
} = require("../controller/user.controller");
const { auth } = require("../middlewares/auth.middleware");
const { access } = require("../middlewares/acess.middleware");
const {  getInvoices, uploadInvoiceBatch, getinvoiceByID, downloadExcel,  getInvoiceBatch, getInvoiceBatchByUser, acceptInvoiceBySeller, getInvoicesAcceptedBySeller, rejectInvoiceBySeller } = require("../controller/dashboard.controller");
const upload = require("../middlewares/multer.middleware");
const { disburseInvoiceByFinancier, getAllInvoicesAcceptedBySellers } = require("../controller/finacier.controller");
const { getInvoicesByStatus, getCountByDate, getTotalEarningsMonthly, getTotalEarningsYearly, countbatches, totalBatches, disburseAmounts, disburseAmountsSeller, totalinvoicesAccepted, disburseAmountsFinancier } = require("../controller/charts.controller");
const { report, exportExcel, exportPdf } = require("../controller/report.controller");

router.use(express.json())

// routes
router.post("/admin/register", registerAdmin)
router.post("/user/login", login)
router.get("/download/:id", downloadExcel)
router.get('/count-users', countUsersByRole);
// auth middleware for authentication
router.use(auth)

router.get("/admin/users/:id", access(["getUsers"]), getUsers)
router.post("/admin/user", access(["addUser"]), addUser)
router.delete("/admin/user/:id", access(["deleteUser"]), deleteUser)
router.patch("/admin/user/:id", access(["updateUser"]), updateUser)
router.get("/admin/count", access(["updateUser"]), countUsersByRole)

router.use(express.urlencoded())

router.post("/buyer/upload", access(["uploadInvoice"]), upload.single("invoiceFile"), uploadInvoiceBatch)
// buyer routes
router.get("/invoices/:id", access(["getInvoices"]), getInvoices)
router.get("/invoice/:id", access(["getinvoiceByID"]), getinvoiceByID)
router.get("/batch", access(["getInvoiceBatch"]), getInvoiceBatch)
router.get("/batches", access(["getInvoiceBatchByUser"]), getInvoiceBatchByUser)

// chart routes
router.get('/statusCount', access(['chartData']), getInvoicesByStatus)
router.get('/dateCount', access(['chartData']), getCountByDate)
router.get('/amountDisbusre', access(['chartData']), disburseAmounts)
router.get('/totalBatches', access(['chartData']), countbatches)
router.get('/allBatches', access(['chartData']), totalBatches)
router.get('/amount', access(['chartData']), disburseAmountsSeller)
router.get('/countInvoices', access(['chartData']), totalinvoicesAccepted)
router.get('/amountFinance', access(['chartData']), disburseAmountsFinancier)

// seller routes 
router.get("/invoices", access(['getInvoicesAcceptedBySeller']), getInvoicesAcceptedBySeller)


// accept and reject invoices
router.patch("/accept/:id", access(["acceptInvoiceBySeller"]), acceptInvoiceBySeller)
router.patch("/reject/:id", access(["rejectInvoice"]), rejectInvoiceBySeller)
router.patch("/disburse/:id", access(["disburseInvoiceByFinancier"]), disburseInvoiceByFinancier)

// financier routes
router.get("/allInvoices", access(["disburseInvoiceByFinancier"]), getAllInvoicesAcceptedBySellers)


router.post('/report', access(['chartData']), report)
router.post('/exportexel', access(['chartData']), exportExcel)
router.post('/exportpdf', access(['chartData']), exportPdf)


module.exports = {
  router,
};
