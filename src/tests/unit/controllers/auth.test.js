const request = require("supertest");
const express = require("express");
const bcrypt = require("bcrypt");

// Mock all external dependencies
jest.mock("../../../model/index", () => {
  const mockUser = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  return {
    User: mockUser,
    sequelize: {
      transaction: jest.fn(() => ({ commit: jest.fn(), rollback: jest.fn() })),
    },
    __esModule: true,
    default: {
      User: mockUser,
      sequelize: {
        transaction: jest.fn(() => ({
          commit: jest.fn(),
          rollback: jest.fn(),
        })),
      },
    },
  };
});

jest.mock("../../../config/otpWhatsapp", () => ({
  sendOTP: jest.fn(),
}));

jest.mock("../../../config/sendMail", () => ({
  sendMail: jest.fn(),
  sendResetPasswordMail: jest.fn(),
}));

jest.mock("../../../validation/dataValidation", () => ({
  dataValid: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

jest.mock("../../../config/jwt", () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

jest.mock("../../../config/redis", () => ({
  client: {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock("../../../config/otp", () => ({
  generateOTP: jest.fn(),
}));

jest.mock("../../../config/bcrypt", () => ({
  encrypt: jest.fn(),
}));

jest.mock("passport", () => ({
  authenticate: jest.fn(),
}));

const authController = require("../../../controller/auth");
const originalSequelize = require("../../../model/index");
const { dataValid } = require("../../../validation/dataValidation");
const { compare } = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../../config/jwt");
const { client } = require("../../../config/redis");
const { generateOTP } = require("../../../config/otp");
const { encrypt } = require("../../../config/bcrypt");
const { sendOTP } = require("../../../config/otpWhatsapp");
const { sendMail, sendResetPasswordMail } = require("../../../config/sendMail");

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.locals = {};
  next();
});

app.post("/auth/login", authController.login);
app.post("/auth/register", authController.register);
app.post("/auth/activate", authController.activateEmail);
app.get("/auth/refresh", authController.refreshToken);
app.post("/auth/resendOTP", authController.resendOtp);
app.post("/auth/forgotPassword", authController.forgotPassword);
app.post("/auth/resetPassword", authController.resetPassword);
app.post("/auth/verifyPhone", authController.activatePhone);
app.post("/auth/getPhoneByEmail", authController.getPhoneByEmail);
app.post("/auth/checkOtp", authController.checkOtp);
app.put("/auth/fcmToken", authController.updateFcmToken);

describe("Auth Controller", () => {
  let mockTransaction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
    originalSequelize.sequelize.transaction.mockReturnValue(mockTransaction);

    if (
      originalSequelize.default &&
      originalSequelize.default.sequelize &&
      originalSequelize.default.sequelize.transaction
    ) {
      originalSequelize.default.sequelize.transaction.mockReturnValue(
        mockTransaction
      );
    }
  });

  describe("POST /auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        role: "user",
        avatarUrl: "avatar.jpg",
        password: "hashedPassword",
        isActive: true,
        isDeleted: false,
      };

      dataValid.mockResolvedValue({
        message: [],
        data: { email: "test@example.com", password: "password123" },
      });

      originalSequelize.User.findOne.mockResolvedValue(mockUser);
      compare.mockResolvedValue(true);
      generateAccessToken.mockReturnValue("access_token");
      generateRefreshToken.mockReturnValue("refresh_token");

      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe("Login success");
      expect(response.body.data.email).toBe("test@example.com");
      expect(response.body.token).toBe("access_token");
      expect(response.body.refreshToken).toBe("refresh_token");
    });

    it("should return 400 for validation errors", async () => {
      dataValid.mockResolvedValue({
        message: ["Email is required"],
        data: {},
      });

      const response = await request(app).post("/auth/login").send({
        password: "password123",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe("Login Gagal, silahkan coba lagi");
      expect(response.body.error).toEqual(["Email is required"]);
    });

    it("should return 400 for non-existent email", async () => {
      dataValid.mockResolvedValue({
        message: [],
        data: { email: "nonexistent@example.com", password: "password123" },
      });

      originalSequelize.User.findOne.mockResolvedValue(null);

      const response = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe("Email belum terdaftar");
    });

    it("should return 400 for wrong password", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        password: "hashedPassword",
        isActive: true,
        isDeleted: false,
      };

      dataValid.mockResolvedValue({
        message: [],
        data: { email: "test@example.com", password: "wrongpassword" },
      });

      originalSequelize.User.findOne.mockResolvedValue(mockUser);
      compare.mockResolvedValue(false);

      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe("Password salah, silahkan coba lagi");
    });

    it("should return 400 for inactive user", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        password: "hashedPassword",
        role: "user",
        isActive: false,
        isDeleted: false,
      };

      dataValid.mockResolvedValue({
        message: [],
        data: { email: "test@example.com", password: "password123" },
      });

      originalSequelize.User.findOne.mockResolvedValue(mockUser);
      compare.mockResolvedValue(true);

      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe("Email belum diaktifkan");
    });

    it("should return 400 for deleted user", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        password: "hashedPassword",
        isActive: true,
        isDeleted: true,
      };

      dataValid.mockResolvedValue({
        message: [],
        data: { email: "test@example.com", password: "password123" },
      });

      originalSequelize.User.findOne.mockResolvedValue(mockUser);
      compare.mockResolvedValue(true);

      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe("Email sudah dibanned");
    });
  });

  describe("POST /auth/register", () => {
    it("should register user successfully", async () => {
      const mockUser = {
        id: "123",
        name: "New User",
        email: "new@example.com",
        phone: "1234567890",
        role: "user",
        save: jest.fn(),
      };

      dataValid.mockResolvedValue({
        message: [],
        data: {
          name: "New User",
          email: "new@example.com",
          password: "password123",
          phone: "1234567890",
          role: "user",
        },
      });

      originalSequelize.User.findOne.mockResolvedValue(null);
      originalSequelize.User.create.mockResolvedValue(mockUser);
      generateOTP.mockReturnValue("123456");
      encrypt.mockReturnValue("encryptedOTP");
      client.set.mockResolvedValue("OK");
      sendMail.mockResolvedValue(true);

      const response = await request(app).post("/auth/register").send({
        name: "New User",
        email: "new@example.com",
        password: "password123",
        phone: "1234567890",
        role: "user",
      });

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe(
        "Register berhasil, silahkan cek email untuk aktivasi"
      );
    });

    it("should return 400 for existing email", async () => {
      const existingUser = { id: "123", email: "existing@example.com" };

      dataValid.mockResolvedValue({
        message: [],
        data: { email: "existing@example.com" },
      });

      originalSequelize.User.findOne.mockResolvedValue(existingUser);

      const response = await request(app).post("/auth/register").send({
        name: "New User",
        email: "existing@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe("Email sudah terdaftar");
    });
  });

  describe("POST /auth/activate", () => {
    it("should activate email successfully", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        isActive: false,
        save: jest.fn(),
      };

      dataValid.mockResolvedValue({
        message: [],
        data: { email: "test@example.com", otp: "123456" },
      });

      originalSequelize.User.findOne.mockResolvedValue(mockUser);
      client.get.mockResolvedValue("hashedOTP");
      compare.mockResolvedValue(true);
      client.del.mockResolvedValue(1);

      const response = await request(app).post("/auth/activate").send({
        email: "test@example.com",
        otp: "123456",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe("Email berhasil diaktifkan");
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should return 400 for invalid OTP", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        isActive: false,
      };

      dataValid.mockResolvedValue({
        message: [],
        data: { email: "test@example.com", otp: "123456" },
      });

      originalSequelize.User.findOne.mockResolvedValue(mockUser);
      client.get.mockResolvedValue("hashedOTP");
      compare.mockResolvedValue(false);

      const response = await request(app).post("/auth/activate").send({
        email: "test@example.com",
        otp: "wrongotp",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe("OTP salah atau expired");
    });
  });

  describe("GET /auth/refresh", () => {
    it("should refresh token successfully", async () => {
      const mockUserData = {
        id: "123",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      };

      verifyRefreshToken.mockReturnValue(mockUserData);
      generateAccessToken.mockReturnValue("new_access_token");

      const response = await request(app)
        .get("/auth/refresh")
        .set("Authorization", "Bearer refresh_token");

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe("Refresh token success");
      expect(response.body.token).toBe("new_access_token");
    });

    it("should return 401 for invalid refresh token", async () => {
      verifyRefreshToken.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const response = await request(app)
        .get("/auth/refresh")
        .set("Authorization", "Bearer invalid_token");

      expect(response.statusCode).toBe(401);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe("Token tidak valid");
    });
  });

  describe("POST /auth/forgotPassword", () => {
    it("should send reset password email successfully", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        name: "Test User",
        save: jest.fn(),
      };

      dataValid.mockResolvedValue({
        message: [],
        data: { email: "test@example.com" },
      });

      originalSequelize.User.findOne.mockResolvedValue(mockUser);
      generateOTP.mockReturnValue("123456");
      encrypt.mockReturnValue("encryptedOTP");
      sendResetPasswordMail.mockResolvedValue(true);

      const response = await request(app).post("/auth/forgotPassword").send({
        email: "test@example.com",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe(
        "Reset password berhasil dikirim ke email"
      );
    });

    it("should return 400 for non-existent email", async () => {
      dataValid.mockResolvedValue({
        message: [],
        data: { email: "nonexistent@example.com" },
      });

      originalSequelize.User.findOne.mockResolvedValue(null);

      const response = await request(app).post("/auth/forgotPassword").send({
        email: "nonexistent@example.com",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe("Email belum terdaftar");
    });
  });

  describe("POST /auth/resetPassword", () => {
    it("should reset password successfully", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        expiredTime: new Date(Date.now() + 3600000), // 1 hour from now
        save: jest.fn(),
      };

      dataValid.mockResolvedValue({
        message: [],
        data: {
          email: "test@example.com",
          otp: "123456",
          newPassword: "newpassword123",
        },
      });

      originalSequelize.User.findOne.mockResolvedValue(mockUser);
      compare.mockResolvedValue(true);
      encrypt.mockReturnValue("newHashedPassword");

      const response = await request(app).post("/auth/resetPassword").send({
        email: "test@example.com",
        otp: "123456",
        newPassword: "newpassword123",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe("Reset password berhasil");
    });

    it("should return 400 for expired OTP", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        expiredTime: new Date(Date.now() - 3600000), // 1 hour ago
      };

      dataValid.mockResolvedValue({
        message: [],
        data: {
          email: "test@example.com",
          otp: "123456",
          newPassword: "newpassword123",
        },
      });

      originalSequelize.User.findOne.mockResolvedValue(mockUser);

      const response = await request(app).post("/auth/resetPassword").send({
        email: "test@example.com",
        otp: "123456",
        newPassword: "newpassword123",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe("OTP expired");
    });
  });

  describe("POST /auth/verifyPhone", () => {
    it("should verify phone successfully", async () => {
      const mockUser = {
        id: "123",
        phone: "1234567890",
        isActive: false,
        save: jest.fn(),
      };

      dataValid.mockResolvedValue({
        message: [],
        data: { phone: "1234567890", otp: "123456" },
      });

      originalSequelize.User.findOne.mockResolvedValue(mockUser);
      client.get.mockResolvedValue("123456");

      const response = await request(app).post("/auth/verifyPhone").send({
        phone: "1234567890",
        otp: "123456",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe("Phone berhasil diaktifkan");
    });
  });

  describe("POST /auth/getPhoneByEmail", () => {
    it("should get phone by email successfully", async () => {
      const mockUser = {
        id: "123",
        email: "test@example.com",
        phone: "1234567890",
      };

      dataValid.mockResolvedValue({
        message: [],
        data: { email: "test@example.com" },
      });

      originalSequelize.User.findOne.mockResolvedValue(mockUser);
      generateOTP.mockReturnValue("123456");
      client.set.mockResolvedValue("OK");
      sendOTP.mockResolvedValue(true);

      const response = await request(app).post("/auth/getPhoneByEmail").send({
        email: "test@example.com",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe("OTP berhasil dikirim");
      expect(response.body.phone).toBe("1234567890");
    });
  });

  describe("POST /auth/checkOtp", () => {
    it("should check OTP successfully", async () => {
      dataValid.mockResolvedValue({
        message: [],
        data: { phone: "1234567890", otp: "123456" },
      });

      client.get.mockResolvedValue("123456");

      const response = await request(app).post("/auth/checkOtp").send({
        phone: "1234567890",
        otp: "123456",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe("OTP valid");
    });

    it("should return 400 for invalid OTP", async () => {
      dataValid.mockResolvedValue({
        message: [],
        data: { phone: "1234567890", otp: "123456" },
      });

      client.get.mockResolvedValue("654321");

      const response = await request(app).post("/auth/checkOtp").send({
        phone: "1234567890",
        otp: "123456",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe(false);
      expect(response.body.message).toBe("OTP salah atau expired");
    });
  });

  describe("PUT /auth/fcmToken", () => {
    it("should update FCM token successfully", async () => {
      const mockUser = {
        id: "123",
        fcmToken: "old_token",
        save: jest.fn(),
      };

      dataValid.mockResolvedValue({
        message: [],
        data: { fcmToken: "new_fcm_token" },
      });

      originalSequelize.User.findOne.mockResolvedValue(mockUser);

      const response = await request(app).put("/auth/fcmToken").send({
        fcmToken: "new_fcm_token",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe(true);
      expect(response.body.message).toBe("FCM Token berhasil diupdate");
    });
  });

  describe("Error handling", () => {
    it("should handle database errors in login", async () => {
      dataValid.mockResolvedValue({
        message: [],
        data: { email: "test@example.com", password: "password123" },
      });

      originalSequelize.User.findOne.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).post("/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(500);
    });

    it("should handle database errors in register", async () => {
      dataValid.mockResolvedValue({
        message: [],
        data: {
          name: "New User",
          email: "new@example.com",
          password: "password123",
        },
      });

      originalSequelize.User.findOne.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).post("/auth/register").send({
        name: "New User",
        email: "new@example.com",
        password: "password123",
      });

      expect(response.statusCode).toBe(500);
    });
  });
});
