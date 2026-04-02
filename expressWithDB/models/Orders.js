const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");
const Customer = require("./Customers");

const Order = sequelize.define("Order", {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    customerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    product: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
}, {
    tableName: "orders", 
});

Order.belongsTo(Customer, { foreignKey: "customerId" });
Customer.hasMany(Order, { foreignKey: "customerId" });

module.exports = Order;
