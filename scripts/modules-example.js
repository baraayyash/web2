// modules-example.js - Working with modules
// This script demonstrates how to create and use custom modules

// 1. Using built-in modules
//const fs = require('fs');
//const path = require('path');
const os = require('os');

console.log("=== Modules Example ===\n");

// 2. Using a local module (math-utils.js)
const mathUtils = require('./math-utils');

console.log("1. Using custom math module:");
console.log("Add 5 + 3 =", mathUtils.add(5, 3));
console.log("Subtract 10 - 4 =", mathUtils.subtract(10, 4));
console.log("Multiply 6 * 7 =", mathUtils.multiply(6, 7));
console.log("Divide 20 / 4 =", mathUtils.divide(20, 4));
console.log("PI =", mathUtils.PI);

// 3. Using built-in modules
console.log("\n2. Using built-in modules:");
console.log("OS Platform:", os.platform());
console.log("OS Type:", os.type());
console.log("Total Memory:", (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), "GB");
console.log("Free Memory:", (os.freemem() / 1024 / 1024 / 1024).toFixed(2), "GB");
console.log("Current Directory:", __dirname);
console.log("Current File:", __filename);

// 4. Creating and exporting from this file
// (This is just for demonstration - normally you'd put this in a separate file)
const myModule = {
    greet: function(name) {
        return `Hello, ${name}!`;
    },
    getCurrentTime: function() {
        return new Date().toISOString();
    }
};

console.log("\n3. Using locally defined module:");
console.log(myModule.greet("Student"));
console.log("Current time:", myModule.getCurrentTime());
