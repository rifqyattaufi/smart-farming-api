module.exports = {
  testEnvironment: "node",

  collectCoverage: true,

  // File/folder mana saja yang diukur coverage-nya
  collectCoverageFrom: [
    "src/controller/**/*.js",
    "src/model/**/*.js",
    "!src/tests/**",        // exclude folder tests
    "!**/*.test.js",        // exclude file test
    "!**/node_modules/**"   // exclude node_modules
  ],

  // Folder hasil coverage akan disimpan
  coverageDirectory: "coverage",

  // Format report yang dihasilkan
  coverageReporters: ["text", "lcov", "html"],
};
