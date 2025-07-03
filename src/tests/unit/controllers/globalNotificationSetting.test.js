const request = require("supertest");
const express = require("express");
const {
  getAllGlobalNotificationSetting,
  getGlobalNotificationSettingById,
  createGLobalNotificationSetting,
  updateGlobalNotificationSetting,
  deleteGlobalNotificationSetting,
} = require("../../../controller/farm/globalNotificationSetting");

// Mock dependencies
jest.mock("../../../model/index", () => ({
  GlobalNotificationSetting: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

const sequelize = require("../../../model/index");

// Setup express app for testing
const app = express();
app.use(express.json());

// Middleware to simulate res.locals
app.use((req, res, next) => {
  res.locals = {};
  next();
});

app.get("/global-notification-settings", getAllGlobalNotificationSetting);
app.get("/global-notification-settings/:id", getGlobalNotificationSettingById);
app.post("/global-notification-settings", createGLobalNotificationSetting);
app.put("/global-notification-settings/:id", updateGlobalNotificationSetting);
app.delete(
  "/global-notification-settings/:id",
  deleteGlobalNotificationSetting
);

describe("GlobalNotificationSetting Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllGlobalNotificationSetting", () => {
    it("should return all global notification settings successfully", async () => {
      const mockData = [
        {
          id: 1,
          title: "Daily Reminder",
          message: "Check your farm",
          notificationType: "repeat",
          isDeleted: false,
          createdAt: new Date(),
        },
        {
          id: 2,
          title: "Weekly Report",
          message: "Weekly farm report",
          notificationType: "scheduled",
          scheduledDate: new Date(),
          isDeleted: false,
          createdAt: new Date(),
        },
      ];

      sequelize.GlobalNotificationSetting.findAll.mockResolvedValue(mockData);

      const response = await request(app)
        .get("/global-notification-settings")
        .expect(200);

      expect(response.body).toEqual({
        message: "Successfully retrieved all global notification settings",
        data: mockData,
      });

      expect(sequelize.GlobalNotificationSetting.findAll).toHaveBeenCalledWith({
        where: { isDeleted: false },
        order: [["createdAt", "DESC"]],
      });
    });

    it("should return 404 when no data found", async () => {
      sequelize.GlobalNotificationSetting.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get("/global-notification-settings")
        .expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database error";
      sequelize.GlobalNotificationSetting.findAll.mockRejectedValue(
        new Error(errorMessage)
      );

      const response = await request(app)
        .get("/global-notification-settings")
        .expect(500);

      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe("getGlobalNotificationSettingById", () => {
    it("should return global notification setting by id successfully", async () => {
      const mockData = {
        id: 1,
        title: "Daily Reminder",
        message: "Check your farm",
        notificationType: "repeat",
        isDeleted: false,
      };

      sequelize.GlobalNotificationSetting.findOne.mockResolvedValue(mockData);

      const response = await request(app)
        .get("/global-notification-settings/1")
        .expect(200);

      expect(response.body).toEqual({
        message: "Successfully retrieved global notification setting",
        data: mockData,
      });

      expect(sequelize.GlobalNotificationSetting.findOne).toHaveBeenCalledWith({
        where: { id: "1", isDeleted: false },
      });
    });

    it("should return 404 when data not found", async () => {
      sequelize.GlobalNotificationSetting.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get("/global-notification-settings/999")
        .expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should return 404 when data is deleted", async () => {
      const deletedData = {
        id: 1,
        title: "Deleted Setting",
        isDeleted: true,
      };

      sequelize.GlobalNotificationSetting.findOne.mockResolvedValue(
        deletedData
      );

      const response = await request(app)
        .get("/global-notification-settings/1")
        .expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database error";
      sequelize.GlobalNotificationSetting.findOne.mockRejectedValue(
        new Error(errorMessage)
      );

      const response = await request(app)
        .get("/global-notification-settings/1")
        .expect(500);

      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe("createGLobalNotificationSetting", () => {
    it("should create global notification setting successfully", async () => {
      const requestData = {
        title: "New Reminder",
        message: "New farm reminder",
        notificationType: "repeat",
        repeatInterval: 24,
      };

      const mockCreatedData = {
        id: 1,
        ...requestData,
        isDeleted: false,
        createdAt: new Date(),
        toJSON: jest.fn().mockReturnValue({ id: 1, ...requestData }),
      };

      sequelize.GlobalNotificationSetting.create.mockResolvedValue(
        mockCreatedData
      );

      const response = await request(app)
        .post("/global-notification-settings")
        .send(requestData)
        .expect(201);

      expect(response.body).toEqual({
        message: "Successfully created global notification setting",
        data: mockCreatedData,
      });

      expect(sequelize.GlobalNotificationSetting.create).toHaveBeenCalledWith(
        requestData
      );
    });

    it("should handle validation errors", async () => {
      const requestData = {
        title: "", // Invalid empty title
        message: "Test message",
      };

      const validationError = new Error("Validation error");
      validationError.name = "SequelizeValidationError";
      sequelize.GlobalNotificationSetting.create.mockRejectedValue(
        validationError
      );

      const response = await request(app)
        .post("/global-notification-settings")
        .send(requestData)
        .expect(500);

      expect(response.body.message).toBe("Validation error");
    });

    it("should handle database errors", async () => {
      const requestData = {
        title: "Test Reminder",
        message: "Test message",
      };

      const errorMessage = "Database error";
      sequelize.GlobalNotificationSetting.create.mockRejectedValue(
        new Error(errorMessage)
      );

      const response = await request(app)
        .post("/global-notification-settings")
        .send(requestData)
        .expect(500);

      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe("updateGlobalNotificationSetting", () => {
    it("should update global notification setting successfully", async () => {
      const existingData = {
        id: 1,
        title: "Old Title",
        message: "Old message",
        notificationType: "scheduled",
        scheduledDate: new Date(),
        isDeleted: false,
      };

      const updateData = {
        title: "Updated Title",
        message: "Updated message",
        notificationType: "repeat",
      };

      const updatedData = {
        id: 1,
        ...updateData,
        scheduledDate: null, // Should be nullified for repeat type
        isDeleted: false,
        toJSON: jest.fn().mockReturnValue({ id: 1, ...updateData }),
      };

      sequelize.GlobalNotificationSetting.findOne
        .mockResolvedValueOnce(existingData) // For initial check
        .mockResolvedValueOnce(updatedData); // For final result

      sequelize.GlobalNotificationSetting.update.mockResolvedValue([1]);

      const response = await request(app)
        .put("/global-notification-settings/1")
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Successfully updated global notification setting",
        data: updatedData,
      });

      expect(sequelize.GlobalNotificationSetting.update).toHaveBeenCalledWith(
        updateData,
        {
          where: { id: "1" },
        }
      );
    });

    it("should handle repeat notification type by nullifying scheduledDate", async () => {
      const existingData = {
        id: 1,
        title: "Test Setting",
        notificationType: "scheduled",
        scheduledDate: new Date(),
        isDeleted: false,
      };

      const updateData = {
        notificationType: "repeat",
        repeatInterval: 24,
      };

      const updatedData = {
        id: 1,
        ...updateData,
        scheduledDate: null,
        toJSON: jest.fn().mockReturnValue({ id: 1, ...updateData }),
      };

      sequelize.GlobalNotificationSetting.findOne
        .mockResolvedValueOnce(existingData)
        .mockResolvedValueOnce(updatedData);

      sequelize.GlobalNotificationSetting.update.mockResolvedValue([1]);

      const response = await request(app)
        .put("/global-notification-settings/1")
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe(
        "Successfully updated global notification setting"
      );
    });

    it("should return 404 when data not found", async () => {
      sequelize.GlobalNotificationSetting.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put("/global-notification-settings/999")
        .send({ title: "Updated Title" })
        .expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should return 404 when data is deleted", async () => {
      const deletedData = {
        id: 1,
        title: "Deleted Setting",
        isDeleted: true,
      };

      sequelize.GlobalNotificationSetting.findOne.mockResolvedValue(
        deletedData
      );

      const response = await request(app)
        .put("/global-notification-settings/1")
        .send({ title: "Updated Title" })
        .expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database error";
      sequelize.GlobalNotificationSetting.findOne.mockRejectedValue(
        new Error(errorMessage)
      );

      const response = await request(app)
        .put("/global-notification-settings/1")
        .send({ title: "Updated Title" })
        .expect(500);

      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe("deleteGlobalNotificationSetting", () => {
    it("should delete global notification setting successfully", async () => {
      const existingData = {
        id: 1,
        title: "Test Setting",
        isDeleted: false,
      };

      const deletedData = {
        id: 1,
        title: "Test Setting",
        isDeleted: true,
        toJSON: jest
          .fn()
          .mockReturnValue({ id: 1, title: "Test Setting", isDeleted: true }),
      };

      sequelize.GlobalNotificationSetting.findOne
        .mockResolvedValueOnce(existingData) // For initial check
        .mockResolvedValueOnce(deletedData); // For final result

      sequelize.GlobalNotificationSetting.update.mockResolvedValue([1]);

      const response = await request(app)
        .delete("/global-notification-settings/1")
        .expect(200);

      expect(response.body).toEqual({
        message: "Successfully deleted global notification setting",
      });

      expect(sequelize.GlobalNotificationSetting.update).toHaveBeenCalledWith(
        { isDeleted: true },
        { where: { id: "1" } }
      );
    });

    it("should return 404 when data not found", async () => {
      sequelize.GlobalNotificationSetting.findOne.mockResolvedValue(null);

      const response = await request(app)
        .delete("/global-notification-settings/999")
        .expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should return 404 when data is already deleted", async () => {
      const deletedData = {
        id: 1,
        title: "Already Deleted Setting",
        isDeleted: true,
      };

      sequelize.GlobalNotificationSetting.findOne.mockResolvedValue(
        deletedData
      );

      const response = await request(app)
        .delete("/global-notification-settings/1")
        .expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database error";
      sequelize.GlobalNotificationSetting.findOne.mockRejectedValue(
        new Error(errorMessage)
      );

      const response = await request(app)
        .delete("/global-notification-settings/1")
        .expect(500);

      expect(response.body.message).toBe(errorMessage);
    });
  });
});
