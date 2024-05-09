const multer = require("multer");


let fileCounter = 1; // Initialize file counter

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); 
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(".")[0];
    const filename = `batch_${fileCounter}_${fileName}_invoice.xlsx`;
    fileCounter++; // Increment file counter for the next file
    cb(null, filename); 
  },
});

// Create multer middleware
const upload = multer({ storage: storage });

module.exports = upload;
