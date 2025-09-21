// ESLint configuration for Golden Jewelry Store
// Simplified config to avoid compatibility issues

const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  // Apply to all JavaScript files
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "script",
      globals: {
        ...globals.node,
        ...globals.browser
      }
    }
  },
  
  // ESLint recommended rules as base
  js.configs.recommended,
  
  // Server-side configuration
  {
    files: ["server.js", "screens/**/*.js", "persist_module.js", "test.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        require: "readonly",
        module: "readonly", 
        exports: "readonly",
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly"
      }
    },
    rules: {
      // Basic style rules
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
      "indent": ["error", 4],
      "no-trailing-spaces": "error",
      
      // Variable rules
      "no-unused-vars": "warn",
      "no-undef": "error",
      "prefer-const": "error",
      "no-var": "error",
      
      // Best practices
      "no-console": "off", // Allow console in server code
      "no-duplicate-case": "error",
      "no-unreachable": "error",
      "consistent-return": "warn"
    }
  },
  
  // Client-side configuration
  {
    files: ["public/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        console: "readonly"
      }
    },
    rules: {
      // Basic style rules
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
      "indent": ["error", 4],
      "no-trailing-spaces": "error",
      
      // Browser-specific
      "no-console": "warn",
      "no-undef": "error",
      "no-unused-vars": "warn",
      "prefer-const": "error",
      "no-var": "error"
    }
  },
  
  // Test files configuration  
  {
    files: ["**/*.test.js", "__tests__/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      "no-console": "off"
    }
  },
  
  // Ignore patterns
  {
    ignores: [
      "node_modules/**",
      "coverage/**", 
      "*.min.js"
    ]
  }
];
