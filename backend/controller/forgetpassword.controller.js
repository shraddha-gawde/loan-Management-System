const {
  generateOtp,
  sendEmailVerification,
} = require("../middlewares/otp.middleware");
const { redisClient } = require("../middlewares/redis.middleware");
const { userModel } = require("../models/user.model");
const bcrypt = require("bcrypt");


const sendOTP = async (req, res) => {
    const {email}  = req.body;
    console.log(email);
    try {
        if (!email) {
            return res.status(400).json({ msg: "Email is required" });
        }

        const existEmailUser = await userModel.findOne({ where: { email } });
        console.log(existEmailUser);

        if (!existEmailUser) {
            return res.status(400).json({ msg: "Email is not registered" });
        }

        const otp = generateOtp();
        await redisClient.setex(email, 120, otp.toString());
        sendEmailVerification(email, otp);
        return res.status(200).json({ msg: "OTP sent successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
};

  

const createpassword = async (req, res) => {
    const { email, password, confirmPassword, otp } = req.body;
  
    try {
      if (password !== confirmPassword) {
        return res
          .status(400)
          .json({ msg: "Password and confirm password do not match" });
      }
  
      const user = await userModel.findOne({ email });
  
      if (!user) {
        return res
          .status(404)
          .json({ msg: "User with this email does not exist" });
      }
  
      const storedOTP = await redisClient.get(email);
      if (storedOTP !== otp) {
        return res
          .status(400)
          .json({ msg: "Invalid or expired OTP. Please request a new OTP" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      user.password = hashedPassword;
      await user.save();
  
      await redisClient.del(email);
  
      res.status(200).json({ msg: "Password updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  };

module.exports = {
  sendOTP,
  createpassword
};
