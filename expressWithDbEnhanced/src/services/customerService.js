const Customer = require('../models/Customer');

async function getAllCustomers() {
    try {
        const customers = await Customer.findAll();
        return customers;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function getCustomer(id) {
    try {
        const customer = await Customer.findByPk(id);
        return customer;
    } catch (error) {
        console.error(error);
        throw error;
    }
}  

async function createCustomer(customer) {
    try {
        const newCustomer = await Customer.create(customer);
        return newCustomer;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function updateCustomer(id, customer) {
    try {
        const updatedCustomer = await Customer.update(customer, { where: { id } });
        return updatedCustomer;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function deleteCustomer(id) {
    try {
        await Customer.destroy({ where: { id } });  
        return true;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

module.exports = {
    getAllCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer
}
