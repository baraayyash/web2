const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Customer = sequelize.define("Customer", {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: {
            name: "uq_customers_email",
            msg: "Email must be unique",
        },
    },
    phone: {
        type: DataTypes.STRING(50),
    },
}, {
    tableName: "customers",
});

module.exports = Customer;
