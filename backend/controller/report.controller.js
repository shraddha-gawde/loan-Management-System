const { generateSummaryReport, generateDetailedReport, generateSummaryReportSeller, generateDetailedReportSeller, generateSummaryReportFinancier, generateDetailedReportFinancier } = require("../middlewares/report.helper");

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
      reportData = await generateDetailedReportSeller(
        userID,
        startDate,
        endDate
      );
    } else {
      return res.status(400).json({ message: "Invalid report type" });
    }

    res.status(200).json(reportData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};

const reportFinancier = async (req, res) => {
  const userID = req.userID;
  const { startDate, endDate, reportType } = req.body;
  console.log(req.body);
  try {
    let reportData;

    if (reportType === "summary") {
      reportData = await generateSummaryReportFinancier(
        userID,
        startDate,
        endDate
      );
    } else if (reportType === "detailed") {
      reportData = await generateDetailedReportFinancier(
        userID,
        startDate,
        endDate
      );
    } else {
      return res.status(400).json({ message: "Invalid report type" });
    }

    res.status(200).json(reportData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
};


module.exports = {
  report,
  reportSeller,
  reportFinancier
};
