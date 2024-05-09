const jwt = require("jsonwebtoken");
const { userModel } = require("../models/user.model");
const { roleModel } = require("../models/role.model");
const { RolePermission } = require("../models/role_permission.model");
const { permissionModel } = require("../models/permission.model");
require("dotenv").config();

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log( `this is token ${token}`)

  if (token) {
    try {
      const secret_key = process.env.secretkey;
      console.log(secret_key)
      const decoded = jwt.verify(token, secret_key);
      const { userID } = decoded.user;
      
      req.userID = userID;
      const user = await userModel.findByPk(userID); 
      
      const userRoleData = await roleModel.findByPk(user.roleID)
      
      const roleMain = userRoleData.roleID
      console.log(roleMain)
      const rolePer = await RolePermission.findAll({where:{roleID: roleMain}})
      const permissionIds = rolePer.map(rp => rp.permissionID);

      // console.log(permissionIds);
      const permissions = await permissionModel.findAll({ where: { permissionID: permissionIds } });
      
      const permissionNames = permissions.map(p => p.permission);

      // console.log(permissionNames);
      
      if (user) {
        const required_permisions = permissionNames;

        console.log(required_permisions)
        req.permissions = required_permisions;
        next();
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (err) {
      console.log({ error: err });
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(401).json({ msg: "Please login!" });
  }
};

module.exports = {
  auth,
};
