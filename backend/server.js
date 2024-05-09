const express = require("express");
const connection = require("./config/db");
require("dotenv").config();
const path = require("path");
const {auth} = require("./middlewares/auth.middleware")
const { router } = require("./routes/api.routes");

const cors = require("cors");
const app = express();

// // Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads",auth, express.static(path.join(__dirname, "uploads")));
// Routes
app.use("/", router);

// Starting server
app.listen(process.env.PORT, async () => {
  try {
    await connection.authenticate();
    console.log("connected to SQL DB");
    console.log(`Server is running on port ${process.env.PORT}`);
  } catch (error) {
    console.log(error);
  }
});
