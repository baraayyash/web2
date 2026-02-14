// math-utils-es6.mjs - ES6 module version of math-utils
// This demonstrates ES6 export syntax for functions and constants

// Define constants
export const PI = 3.14159;

// Define functions
export function add(a, b) {
    return a + b;
}

export function subtract(a, b) {
    return a - b;
}

export function multiply(a, b) {
    return a * b;
}

export function divide(a, b) {
    if (b === 0) {
        throw new Error("Cannot divide by zero!");
    }
    return a / b;
}

// You can also export multiple things at once
// export { add, subtract, multiply, divide, PI };

// Default export (alternative approach)
// export default { add, subtract, multiply, divide, PI };
