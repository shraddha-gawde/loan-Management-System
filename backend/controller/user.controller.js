
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const { userModel } = require("../models/user.model");
const { roleModel } = require("../models/role.model");
const { Sequelize } = require("sequelize");

const registerAdmin = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    // Validate password
    if (
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*()_+{}[;]/.test(password) ||
      password.length < 8
    ) {
      return res.status(400).json({
        msg: "Cannot register, password must contain at least 1 character, one capital letter, and minimum length 8",
      });
    }

    // Check if user already exists
    const existUserEmail = await userModel.findOne({ where: { email } });
    const existUserName = await userModel.findOne({ where: { email } });
    if (existUserEmail || existUserName) {
      return res.status(400).json({ msg: "User already exists" });
    }
    if (!username || !email || !password) {
      return res.status(400).json({ msg: "enter all details first" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 5);

    // Create new admin user
    const newUser = await userModel.create({
      username: username,
      email: email,
      password: hashedPassword,
      roleID:role
    });

    res.status(200).json({
      msg: "The new admin user has been registered",
      registeredUser: newUser,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "Error registering user" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(404).json({ msg: "enter your credientials..." });
    }
    // Find the user by email
    const user = await userModel.findOne({ where: { username } });
    const roleData = await roleModel.findByPk(user.roleID)
    if (user) {
      // Comparing password with the hashed password in the database
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          res.status(404).json({ msg: "Error comparing passwords!" });
        }

        if (result) {
          const secret_key = process.env.secretkey;
          const userRole = roleData.role
          const access_token = jwt.sign({ user: user, role:userRole }, secret_key, {
            expiresIn: "1d",
          });
          console.log(roleData.role)
          // Set cookies with tokens
          res.cookie("access_token", access_token, { httpOnly: true });
          
          res.status(200).json({
            msg: "Login successful!",
            name: user.username,
            user: user,
            role:roleData,
            access_token,
          });
        } else {
          res.status(400).json({ msg: "Password is incorrect!" });
        }
      });
    } else {
      res.status(401).json({ msg: "User does not exist!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const addUser = async (req, res) => {
  const {
    username,
    password,
    confirmPassword,
    roleID,
    companyName,
    contactPerson,
    email,
    phone,
    address,
    city,
    country,
  } = req.body;
  try {
    const existingUsername = await userModel.findOne({ where: { username } });
    const existingUseremail = await userModel.findOne({ where: { email } });
    if (
      !/[A-Z]/.test(password) ||
      !/\d/.test(password) ||
      !/[!@#$%^&*()_+{}[;]/.test(password) ||
      password.length < 8
    ) {
      return res.status(400).json({
        msg: "Cannot register, password must contain at least 1 character, one capital letter, and minimum length 8",
      });
    }
    if (existingUsername) {
      return res
        .status(400)
        .json({ msg: "user with the same username already exists" });
    }
    if (existingUseremail) {
      return res
        .status(400)
        .json({ msg: "user with the same email already exists" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Password and confirm password do not match" });
    }
    if (phone.length !== 10) {
      return res.status(400).json({ msg: "Phone number must be 10 digits long" });
    }
    const hashedPassword = await bcrypt.hash(password, 5);
    let roleid;

    const existingRole = await roleModel.findOne({ where: { role:roleID } });

    if (existingRole) {
      roleid = existingRole.roleID;
    } else {
      const newRole = await roleModel.create({ role:roleID });
      roleid = newRole.roleID;
    }
    

    const newuser = await userModel.create({
      username,
      password: hashedPassword,
      roleID: roleid,
      companyName,
      contactPerson,
      email,
      phone,
      address,
      city,
      country,
    });
    res.status(201).json({ msg: "user added successfully", data: newuser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const updateUser = async (req, res) => {
  const userId = req.params.id;
  const {
    username,
    roleID,
    companyName,
    contactPerson,
    email,
    phone,
    address,
    city,
    country,
  } = req.body;
  try {
    const user = await userModel.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: "Movie not found" });
    }
    let roleid;

    const existingRole = await roleModel.findOne({ where: { role:roleID } });

    if (existingRole) {
      roleid = existingRole.roleID;
    } else {
      const newRole = await roleModel.create({ role:roleID });
      roleid = newRole.roleID;
    }

    // Update user data
    user.username = username;
    user.roleID = roleid;
    user.companyName = companyName;
    user.contactPerson = contactPerson;
    user.email = email;
    user.phone = phone;
    user.address = address;
    user.city = city;
    user.country = country;

    await user.save();

    res.status(200).json({ msg: "user data updated successfully", data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await userModel.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: "user not found" });
    }
    await user.destroy();
    res.status(200).json({ msg: "user deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const roles = ['admin', 'financier', 'seller', 'buyer'];
    const userCounts = {};
    const userData = [];

    // Fetch user counts for each role
    for (const role of roles) {
      const count = await userModel.count({ where: { roleID: role } });
      userCounts[role] = count;
    }

    // Fetch user data for the requested role (if specified)
    const roleID = req.params.id;
    let users;
    let roleData;

    if (roleID) {
      roleData = await roleModel.findByPk(roleID);
      users = await userModel.findAll({ where: { roleID } });
    } else {
      // If no role is specified, fetch all users
      users = await userModel.findAll();
    }

    res.status(200).json({ user_data: users, role: roleData, user_counts: userCounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const countUsersByRole = async (req, res) => {
//   try {
//     const roles = ['1', '2', '3', '4'];
//     const userCounts = {};

//     // Fetch user counts for each role
//     for (const role of roles) {
//       const count = await userModel.count({ where: { roleID: role } });
//       userCounts[role] = count;
//     }

//     res.status(200).json({ user_counts: userCounts });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

const resetPassword = async (req, res) => {
  const userId = req.params.id;
  const { currPassword, newPassword, confirmPasword } = req.body;

  try {
    const user = await userModel.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (newPassword !== confirmPasword) {
      return res
        .status(401)
        .json({
          msg: "Current password does not match. Please ensure that your new password is different from your current one",
        });
    }

    if (currPassword === newPassword) {
      return res
        .status(401)
        .json({
          msg: "The new password and confirmed new password do not match",
        });
    }

    const isValid = await bcrypt.compare(currPassword, user.password);
    if (!isValid) {
      return res.status(200).json({ msg: "Invalid current password" });
    }

    const hash = await bcrypt.hash(newPassword, 5);
    console.log("New Password Hash:", hash);

    await user.save();
    res.status(200).json({ msg: "Password reset successfully", user: user });
  } catch (err) {
    res.status(500).json({ msg: "Error resetting password", error: err });
    console.log(err);
  }
};


const countUsersByRole = async (req, res) => {
  // const userID = req.userID;
  try {
    const totalbatch = await userModel.findAll({
      attributes: ['roleID', [Sequelize.fn('COUNT', 'roleID'), 'count']],
      include :{ model: roleModel, as: 'rolename', attributes: ['role'] },
      group: ['roleID']
    });

    res.status(200).json(totalbatch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  registerAdmin,
  login,
  getUsers,
  addUser,
  deleteUser,
  updateUser,
  resetPassword,
  countUsersByRole,
};