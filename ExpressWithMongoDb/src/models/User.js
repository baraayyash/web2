const mongoose = require('mongoose');
const addressSchema = require('./Address');
const Product = require('./Product');

const userSchema = new mongoose.Schema({
    name : {type : String, required : true},
    email : {type : String, required : true, unique : true},
    phone : {type : String, required : true},
    // Embedded document
    address : {type : addressSchema, required : true},
    // Reference document
    products : [{type : mongoose.Schema.Types.ObjectId, ref : 'Product'}]
},
 {timestamps : true}
);

const User = mongoose.model('User', userSchema);

module.exports = User;
