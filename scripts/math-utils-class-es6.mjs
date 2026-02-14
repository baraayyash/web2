// math-utils-class-es6.mjs - ES6 class-based version
// This demonstrates exporting a class using ES6 syntax

export class MathUtils {
    // Static constant
    static PI = 3.14159;
    
    // Instance methods (can be used when you create an instance)
    add(a, b) {
        return a + b;
    }
    
    subtract(a, b) {
        return a - b;
    }
    
    multiply(a, b) {
        return a * b;
    }
    
    divide(a, b) {
        if (b === 0) {
            throw new Error("Cannot divide by zero!");
        }
        return a / b;
    }
    
    // Static methods (can be called directly on the class without creating an instance)
    static add(a, b) {
        return a + b;
    }
    
    static subtract(a, b) {
        return a - b;
    }
    
    static multiply(a, b) {
        return a * b;
    }
    
    static divide(a, b) {
        if (b === 0) {
            throw new Error("Cannot divide by zero!");
        }
        return a / b;
    }
}

// Default export (alternative)
// export default MathUtils;
