const {Sequelize} = require("sequelize")
require("dotenv").config()
const connection = new Sequelize({
    host: process.env.db_host,
    username: process.env.db_username,
    password: process.env.db_password,
    database: process.env.db_database,
    port: process.env.db_port,
    dialect:"mysql",
    
})

module.exports =  connection

