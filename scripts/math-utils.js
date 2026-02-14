// math-utils.js - A custom module example
// This module exports math utility functions using CommonJS

// Define constants
const PI = 3.14159;

// Define functions
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        throw new Error("Cannot divide by zero!");
    }
    return a / b;
}

// Export the functions and constants
// Method 1: Export as an object (CommonJS)
module.exports = {
    add: add,
    subtract: subtract,
    multiply: multiply,
    divide: divide,
    PI: PI
};

// Alternative methods:
// - ES6 modules: See math-utils-es6.mjs
// - Class-based: See math-utils-class.js
// - ES6 class: See math-utils-class-es6.mjs
