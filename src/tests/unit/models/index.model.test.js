// Mock all dependencies that could cause issues
jest.mock("bcrypt", () => ({
  hashSync: jest.fn(),
  compareSync: jest.fn(),
}));

jest.mock("../../../config/bcrypt.js", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock("../../../config/jwt.js", () => ({
  signToken: jest.fn(),
  verifyToken: jest.fn(),
}));

jest.mock("../../../config/sendMail.js", () => ({
  sendEmail: jest.fn(),
}));

// Mock Sequelize
const mockSequelizeInstance = {
  define: jest.fn(),
  DataTypes: {
    STRING: "STRING",
    INTEGER: "INTEGER",
    UUID: "UUID",
    UUIDV4: "UUIDV4",
    BOOLEAN: "BOOLEAN",
    DATE: "DATE",
    JSON: "JSON",
    ENUM: jest.fn(),
  },
};

const MockSequelize = jest.fn().mockImplementation(() => mockSequelizeInstance);
MockSequelize.DataTypes = mockSequelizeInstance.DataTypes;

jest.mock("sequelize", () => MockSequelize);

// Mock config
jest.mock("../../../config/config.js", () => ({
  development: {
    database: "test_db",
    username: "test_user",
    password: "test_pass",
    host: "localhost",
    dialect: "sqlite",
  },
  test: {
    database: "test_db_test",
    username: "test_user",
    password: "test_pass",
    host: "localhost",
    dialect: "sqlite",
  },
}));

// Mock fs
const mockFs = {
  readdirSync: jest.fn(),
  statSync: jest.fn(),
};
jest.mock("fs", () => mockFs);

// Mock path
const mockPath = {
  join: jest.fn(),
  basename: jest.fn(),
};
jest.mock("path", () => mockPath);

describe("Index Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset environment
    process.env.NODE_ENV = "development";

    // Setup default mocks
    mockPath.basename.mockReturnValue("index.js");
    mockPath.join.mockImplementation((...args) => args.join("/"));

    // Default: empty directory to avoid loading actual models
    mockFs.readdirSync.mockReturnValue([]);

    // Clear module cache
    delete require.cache[require.resolve("../../../model/index")];
  });

  describe("Basic Module Structure", () => {
    it("should export sequelize instance and DataTypes", () => {
      const db = require("../../../model/index");

      expect(db).toBeDefined();
      expect(db.sequelize).toBeDefined();
      expect(db.Sequelize).toBeDefined();
    });

    it("should create Sequelize instance with correct config", () => {
      const db = require("../../../model/index");

      expect(MockSequelize).toHaveBeenCalledWith(
        "test_db",
        "test_user",
        "test_pass",
        expect.objectContaining({
          host: "localhost",
          dialect: "sqlite",
        })
      );
    });
  });

  describe("Environment Configuration", () => {
    it("should use test environment config when NODE_ENV is test", () => {
      process.env.NODE_ENV = "test";

      delete require.cache[require.resolve("../../../model/index")];
      const db = require("../../../model/index");

      expect(MockSequelize).toHaveBeenCalledWith(
        "test_db_test",
        "test_user",
        "test_pass",
        expect.objectContaining({
          host: "localhost",
          dialect: "sqlite",
        })
      );
    });

    it("should default to development environment", () => {
      delete process.env.NODE_ENV;

      delete require.cache[require.resolve("../../../model/index")];
      const db = require("../../../model/index");

      expect(MockSequelize).toHaveBeenCalledWith(
        "test_db",
        "test_user",
        "test_pass",
        expect.objectContaining({
          host: "localhost",
          dialect: "sqlite",
        })
      );
    });

    it("should use environment variable when specified in config", () => {
      // Mock config with environment variable
      jest.doMock("../../../config/config.js", () => ({
        development: {
          use_env_variable: "DATABASE_URL",
          dialect: "postgres",
        },
      }));

      process.env.DATABASE_URL = "postgres://test:pass@localhost/testdb";

      delete require.cache[require.resolve("../../../model/index")];
      delete require.cache[require.resolve("../../../config/config.js")];
      const db = require("../../../model/index");

      expect(MockSequelize).toHaveBeenCalledWith(
        "postgres://test:pass@localhost/testdb",
        expect.objectContaining({
          dialect: "postgres",
        })
      );
    });
  });

  describe("File System Operations", () => {
    it("should read model directory", () => {
      mockFs.readdirSync.mockReturnValue(["user.js"]);
      mockFs.statSync.mockReturnValue({ isDirectory: () => false });

      // Mock a simple model
      jest.doMock("../../../model/user.js", () =>
        jest.fn().mockReturnValue({ name: "User" })
      );

      const db = require("../../../model/index");

      expect(mockFs.readdirSync).toHaveBeenCalled();
    });

    it("should handle recursive directory loading", () => {
      mockFs.readdirSync
        .mockReturnValueOnce(["user.js", "farm"])
        .mockReturnValueOnce(["product.js"]);

      mockFs.statSync.mockImplementation((path) => ({
        isDirectory: () => path.includes("farm") && !path.includes(".js"),
      }));

      jest.doMock("../../../model/user.js", () =>
        jest.fn().mockReturnValue({ name: "User" })
      );
      jest.doMock("../../../model/farm/product.js", () =>
        jest.fn().mockReturnValue({ name: "Product" })
      );

      const db = require("../../../model/index");

      expect(mockFs.readdirSync).toHaveBeenCalledTimes(2);
    });

    it("should skip non-JS files", () => {
      mockFs.readdirSync.mockReturnValue([
        "user.js",
        "readme.txt",
        "config.json",
      ]);
      mockFs.statSync.mockReturnValue({ isDirectory: () => false });

      jest.doMock("../../../model/user.js", () =>
        jest.fn().mockReturnValue({ name: "User" })
      );

      const db = require("../../../model/index");

      // Only .js files should be processed
      const statCalls = mockFs.statSync.mock.calls;
      expect(statCalls.some((call) => call[0].includes("readme.txt"))).toBe(
        false
      );
      expect(statCalls.some((call) => call[0].includes("config.json"))).toBe(
        false
      );
    });

    it("should skip index.js file during model loading", () => {
      mockFs.readdirSync.mockReturnValue(["index.js", "user.js"]);
      mockFs.statSync.mockReturnValue({ isDirectory: () => false });

      jest.doMock("../../../model/user.js", () =>
        jest.fn().mockReturnValue({ name: "User" })
      );

      const db = require("../../../model/index");

      // index.js should not be processed as a model
      const statCalls = mockFs.statSync.mock.calls;
      expect(statCalls.some((call) => call[0].includes("index.js"))).toBe(
        false
      );
    });
  });

  describe("Model Loading and Association", () => {
    it("should load models and add to db object", () => {
      mockFs.readdirSync.mockReturnValue(["user.js", "logs.js"]);
      mockFs.statSync.mockReturnValue({ isDirectory: () => false });

      const mockUserModel = { name: "User" };
      const mockLogsModel = { name: "Logs" };

      jest.doMock("../../../model/user.js", () =>
        jest.fn().mockReturnValue(mockUserModel)
      );
      jest.doMock("../../../model/logs.js", () =>
        jest.fn().mockReturnValue(mockLogsModel)
      );

      const db = require("../../../model/index");

      expect(db.User).toBeDefined();
      expect(db.Logs).toBeDefined();
    });

    it("should call associate function for models that have it", () => {
      mockFs.readdirSync.mockReturnValue(["user.js"]);
      mockFs.statSync.mockReturnValue({ isDirectory: () => false });

      const mockUserModel = {
        name: "User",
        associate: jest.fn(),
      };

      jest.doMock("../../../model/user.js", () =>
        jest.fn().mockReturnValue(mockUserModel)
      );

      const db = require("../../../model/index");

      expect(mockUserModel.associate).toHaveBeenCalledWith(db);
    });

    it("should handle models without associate function", () => {
      mockFs.readdirSync.mockReturnValue(["simple.js"]);
      mockFs.statSync.mockReturnValue({ isDirectory: () => false });

      const mockSimpleModel = { name: "Simple" }; // No associate function

      jest.doMock("../../../model/simple.js", () =>
        jest.fn().mockReturnValue(mockSimpleModel)
      );

      expect(() => {
        const db = require("../../../model/index");
      }).not.toThrow();
    });
  });
});
