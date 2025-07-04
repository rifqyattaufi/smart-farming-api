const request = require("supertest");
const express = require("express");
const sequelize = require("../../../model/index");
const scheduledUnitNotificationController = require("../../../controller/farm/scheduledUnitNotification");

// Mock the sequelize model
jest.mock("../../../model/index", () => ({
  ScheduledUnitNotification: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const app = express();
app.use(express.json());

// Setup routes
app.get(
  "/scheduled-notifications",
  scheduledUnitNotificationController.getScheduledUnitNotifications
);
app.get(
  "/scheduled-notifications/:id",
  scheduledUnitNotificationController.getScheduledUnitNotificationById
);
app.get(
  "/scheduled-notifications/unit/:unitBudidayaId",
  scheduledUnitNotificationController.getScheduledUnitNotificationsByUnitBudidayaId
);
app.post(
  "/scheduled-notifications",
  scheduledUnitNotificationController.createScheduledUnitNotification
);
app.put(
  "/scheduled-notifications/:id",
  scheduledUnitNotificationController.updateScheduledUnitNotification
);
app.delete(
  "/scheduled-notifications/:id",
  scheduledUnitNotificationController.deleteScheduledUnitNotification
);

describe("ScheduledUnitNotification Controller", () => {
  const mockScheduledNotification = {
    id: "uuid-1",
    unitBudidayaId: "unit-uuid-1",
    title: "Test Notification",
    messageTemplate: "Test notification message template",
    notificationType: "daily",
    tipeLaporan: "panen",
    dayOfWeek: null,
    dayOfMonth: null,
    scheduledTime: "08:00:00",
    isActive: true,
    lastTriggered: null,
    isDeleted: false,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    toJSON: () => ({
      id: "uuid-1",
      unitBudidayaId: "unit-uuid-1",
      title: "Test Notification",
      messageTemplate: "Test notification message template",
      notificationType: "daily",
      tipeLaporan: "panen",
      dayOfWeek: null,
      dayOfMonth: null,
      scheduledTime: "08:00:00",
      isActive: true,
      lastTriggered: null,
      isDeleted: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    }),
    update: jest.fn(),
  };

  const newNotificationData = {
    unitBudidayaId: "unit-uuid-1",
    title: "New Notification",
    messageTemplate: "New notification message template",
    notificationType: "weekly",
    tipeLaporan: "vitamin",
    dayOfWeek: 1,
    scheduledTime: "09:00:00",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /scheduled-notifications", () => {
    it("should return all scheduled unit notifications", async () => {
      const mockData = [mockScheduledNotification];
      sequelize.ScheduledUnitNotification.findAll.mockResolvedValue(mockData);

      const response = await request(app)
        .get("/scheduled-notifications")
        .expect(200);

      expect(response.body.message).toBe(
        "Successfully retrieved all scheduled unit notifications"
      );
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(mockScheduledNotification.id);
      expect(response.body.data[0].title).toBe(mockScheduledNotification.title);

      expect(sequelize.ScheduledUnitNotification.findAll).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
        },
        order: [["createdAt", "DESC"]],
      });
    });

    it("should return 404 when no notifications found", async () => {
      sequelize.ScheduledUnitNotification.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get("/scheduled-notifications")
        .expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database connection failed";
      sequelize.ScheduledUnitNotification.findAll.mockRejectedValue(
        new Error(errorMessage)
      );

      const response = await request(app)
        .get("/scheduled-notifications")
        .expect(500);

      expect(response.body.message).toBe(errorMessage);
      expect(response.body.detail).toBeDefined();
    });
  });

  describe("GET /scheduled-notifications/:id", () => {
    it("should return specific scheduled notification", async () => {
      sequelize.ScheduledUnitNotification.findOne.mockResolvedValue(
        mockScheduledNotification
      );

      const response = await request(app)
        .get("/scheduled-notifications/1")
        .expect(200);

      expect(response.body.message).toBe(
        "Successfully retrieved scheduled unit notification"
      );
      expect(response.body.data.id).toBe(mockScheduledNotification.id);
      expect(response.body.data.title).toBe(mockScheduledNotification.title);

      expect(sequelize.ScheduledUnitNotification.findOne).toHaveBeenCalledWith({
        where: { id: "1", isDeleted: false },
      });
    });

    it("should return 404 when notification not found", async () => {
      sequelize.ScheduledUnitNotification.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get("/scheduled-notifications/999")
        .expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should return 404 when notification is deleted", async () => {
      const deletedNotification = {
        ...mockScheduledNotification,
        isDeleted: true,
      };
      sequelize.ScheduledUnitNotification.findOne.mockResolvedValue(
        deletedNotification
      );

      const response = await request(app)
        .get("/scheduled-notifications/1")
        .expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database connection failed";
      sequelize.ScheduledUnitNotification.findOne.mockRejectedValue(
        new Error(errorMessage)
      );

      const response = await request(app)
        .get("/scheduled-notifications/1")
        .expect(500);

      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe("GET /scheduled-notifications/unit/:unitBudidayaId", () => {
    it("should return notifications for specific unit budidaya", async () => {
      const mockData = [mockScheduledNotification];
      sequelize.ScheduledUnitNotification.findAll.mockResolvedValue(mockData);

      const response = await request(app)
        .get("/scheduled-notifications/unit/1")
        .expect(200);

      expect(response.body.message).toBe(
        "Successfully retrieved scheduled unit notifications by unit budidaya ID"
      );
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(mockScheduledNotification.id);

      expect(sequelize.ScheduledUnitNotification.findAll).toHaveBeenCalledWith({
        where: {
          unitBudidayaId: "1",
          isDeleted: false,
        },
        order: [["createdAt", "DESC"]],
      });
    });

    it("should return 404 when no notifications found for unit", async () => {
      sequelize.ScheduledUnitNotification.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get("/scheduled-notifications/unit/1")
        .expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database connection failed";
      sequelize.ScheduledUnitNotification.findAll.mockRejectedValue(
        new Error(errorMessage)
      );

      const response = await request(app)
        .get("/scheduled-notifications/unit/1")
        .expect(500);

      expect(response.body.message).toBe(errorMessage);
    });
  });
  describe("POST /scheduled-notifications", () => {
    it("should create new scheduled notification", async () => {
      sequelize.ScheduledUnitNotification.create.mockResolvedValue(
        mockScheduledNotification
      );

      const response = await request(app)
        .post("/scheduled-notifications")
        .send(newNotificationData)
        .expect(201);

      expect(response.body).toEqual({
        message: "Successfully created scheduled unit notification",
        data: mockScheduledNotification.toJSON(),
      });

      expect(sequelize.ScheduledUnitNotification.create).toHaveBeenCalledWith(
        newNotificationData
      );
    });

    it("should set res.locals.createdData when creating notification", async () => {
      sequelize.ScheduledUnitNotification.create.mockResolvedValue(
        mockScheduledNotification
      );

      // Mock Express response object to track res.locals
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: {},
      };

      const mockReq = {
        body: newNotificationData,
      };

      await scheduledUnitNotificationController.createScheduledUnitNotification(
        mockReq,
        mockRes
      );

      expect(mockRes.locals.createdData).toEqual(
        mockScheduledNotification.toJSON()
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it("should handle different notification types", async () => {
      const monthlyNotificationData = {
        ...newNotificationData,
        notificationType: "monthly",
        dayOfMonth: 15,
        dayOfWeek: null,
      };

      sequelize.ScheduledUnitNotification.create.mockResolvedValue({
        ...mockScheduledNotification,
        ...monthlyNotificationData,
        toJSON: () => ({
          ...mockScheduledNotification.toJSON(),
          ...monthlyNotificationData,
        }),
      });

      const response = await request(app)
        .post("/scheduled-notifications")
        .send(monthlyNotificationData)
        .expect(201);

      expect(response.body.data.notificationType).toBe("monthly");
      expect(response.body.data.dayOfMonth).toBe(15);
    });

    it("should handle different tipeLaporan values", async () => {
      const vitaminNotificationData = {
        ...newNotificationData,
        tipeLaporan: "vitamin",
      };

      sequelize.ScheduledUnitNotification.create.mockResolvedValue({
        ...mockScheduledNotification,
        tipeLaporan: "vitamin",
        toJSON: () => ({
          ...mockScheduledNotification.toJSON(),
          tipeLaporan: "vitamin",
        }),
      });

      const response = await request(app)
        .post("/scheduled-notifications")
        .send(vitaminNotificationData)
        .expect(201);

      expect(response.body.data.tipeLaporan).toBe("vitamin");
    });

    it("should handle validation errors", async () => {
      const errorMessage = "Validation error";
      sequelize.ScheduledUnitNotification.create.mockRejectedValue(
        new Error(errorMessage)
      );

      const response = await request(app)
        .post("/scheduled-notifications")
        .send({})
        .expect(500);

      expect(response.body.message).toBe(errorMessage);
      expect(response.body.detail).toBeDefined();
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database connection failed";
      sequelize.ScheduledUnitNotification.create.mockRejectedValue(
        new Error(errorMessage)
      );

      const response = await request(app)
        .post("/scheduled-notifications")
        .send(newNotificationData)
        .expect(500);

      expect(response.body.message).toBe(errorMessage);
    });
  });
  describe("PUT /scheduled-notifications/:id", () => {
    const updateData = {
      title: "Updated Notification",
      messageTemplate: "Updated message template",
      isActive: false,
    };
    it("should update existing scheduled notification", async () => {
      const updatedNotification = {
        ...mockScheduledNotification,
        ...updateData,
      };
      sequelize.ScheduledUnitNotification.findOne
        .mockResolvedValueOnce(mockScheduledNotification)
        .mockResolvedValueOnce(updatedNotification);
      mockScheduledNotification.update.mockResolvedValue();

      const response = await request(app)
        .put("/scheduled-notifications/1")
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe(
        "Successfully updated scheduled unit notification"
      );
      expect(response.body.data.id).toBe(mockScheduledNotification.id);

      expect(sequelize.ScheduledUnitNotification.findOne).toHaveBeenCalledWith({
        where: { id: "1", isDeleted: false },
      });
      expect(mockScheduledNotification.update).toHaveBeenCalledWith(updateData);
    });

    it("should set res.locals.updatedData when updating notification", async () => {
      const updatedNotification = {
        ...mockScheduledNotification,
        ...updateData,
        toJSON: () => ({
          ...mockScheduledNotification.toJSON(),
          ...updateData,
        }),
      };

      sequelize.ScheduledUnitNotification.findOne
        .mockResolvedValueOnce(mockScheduledNotification)
        .mockResolvedValueOnce(updatedNotification);
      mockScheduledNotification.update.mockResolvedValue();

      // Mock Express response object to track res.locals
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: {},
      };

      const mockReq = {
        params: { id: "uuid-1" },
        body: updateData,
      };

      await scheduledUnitNotificationController.updateScheduledUnitNotification(
        mockReq,
        mockRes
      );

      expect(mockRes.locals.updatedData).toEqual(updatedNotification.toJSON());
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should handle updating with null values", async () => {
      const updateDataWithNulls = {
        dayOfWeek: null,
        dayOfMonth: null,
        lastTriggered: null,
      };

      sequelize.ScheduledUnitNotification.findOne
        .mockResolvedValueOnce(mockScheduledNotification)
        .mockResolvedValueOnce(mockScheduledNotification);
      mockScheduledNotification.update.mockResolvedValue();

      const response = await request(app)
        .put("/scheduled-notifications/uuid-1")
        .send(updateDataWithNulls)
        .expect(200);

      expect(mockScheduledNotification.update).toHaveBeenCalledWith(
        updateDataWithNulls
      );
    });

    it("should return 404 when notification not found", async () => {
      sequelize.ScheduledUnitNotification.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put("/scheduled-notifications/999")
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should return 404 when notification is deleted", async () => {
      const deletedNotification = {
        ...mockScheduledNotification,
        isDeleted: true,
      };
      sequelize.ScheduledUnitNotification.findOne.mockResolvedValue(
        deletedNotification
      );

      const response = await request(app)
        .put("/scheduled-notifications/1")
        .send(updateData)
        .expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database connection failed";
      sequelize.ScheduledUnitNotification.findOne.mockRejectedValue(
        new Error(errorMessage)
      );

      const response = await request(app)
        .put("/scheduled-notifications/1")
        .send(updateData)
        .expect(500);

      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe("DELETE /scheduled-notifications/:id", () => {
    it("should soft delete scheduled notification", async () => {
      const updatedNotification = {
        ...mockScheduledNotification,
        isDeleted: true,
      };
      sequelize.ScheduledUnitNotification.findOne
        .mockResolvedValueOnce(mockScheduledNotification)
        .mockResolvedValueOnce(updatedNotification);
      mockScheduledNotification.update.mockResolvedValue();

      const response = await request(app)
        .delete("/scheduled-notifications/1")
        .expect(200);

      expect(response.body.message).toBe(
        "Successfully deleted scheduled unit notification"
      );
      expect(response.body.data.id).toBe(mockScheduledNotification.id);

      expect(mockScheduledNotification.update).toHaveBeenCalledWith({
        isDeleted: true,
      });
    });

    it("should set res.locals.updatedData when deleting notification", async () => {
      const updatedNotification = {
        ...mockScheduledNotification,
        isDeleted: true,
        toJSON: () => ({
          ...mockScheduledNotification.toJSON(),
          isDeleted: true,
        }),
      };

      sequelize.ScheduledUnitNotification.findOne
        .mockResolvedValueOnce(mockScheduledNotification)
        .mockResolvedValueOnce(updatedNotification);
      mockScheduledNotification.update.mockResolvedValue();

      // Mock Express response object to track res.locals
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        locals: {},
      };

      const mockReq = {
        params: { id: "uuid-1" },
      };

      await scheduledUnitNotificationController.deleteScheduledUnitNotification(
        mockReq,
        mockRes
      );

      expect(mockRes.locals.updatedData).toEqual(updatedNotification.toJSON());
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
    it("should handle soft delete correctly", async () => {
      const updatedNotification = {
        ...mockScheduledNotification,
        isDeleted: true,
        toJSON: () => ({
          ...mockScheduledNotification.toJSON(),
          isDeleted: true,
        }),
      };

      sequelize.ScheduledUnitNotification.findOne
        .mockResolvedValueOnce(mockScheduledNotification)
        .mockResolvedValueOnce(updatedNotification);
      mockScheduledNotification.update.mockResolvedValue();

      const response = await request(app)
        .delete("/scheduled-notifications/uuid-1")
        .expect(200);

      expect(mockScheduledNotification.update).toHaveBeenCalledWith({
        isDeleted: true,
      });
      expect(response.body.message).toBe(
        "Successfully deleted scheduled unit notification"
      );
    });

    it("should return 404 when notification not found", async () => {
      sequelize.ScheduledUnitNotification.findOne.mockResolvedValue(null);

      const response = await request(app)
        .delete("/scheduled-notifications/999")
        .expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should return 404 when notification is already deleted", async () => {
      const deletedNotification = {
        ...mockScheduledNotification,
        isDeleted: true,
      };
      sequelize.ScheduledUnitNotification.findOne.mockResolvedValue(
        deletedNotification
      );

      const response = await request(app)
        .delete("/scheduled-notifications/1")
        .expect(404);

      expect(response.body).toEqual({
        message: "Data not found",
      });
    });

    it("should handle database errors", async () => {
      const errorMessage = "Database connection failed";
      sequelize.ScheduledUnitNotification.findOne.mockRejectedValue(
        new Error(errorMessage)
      );

      const response = await request(app)
        .delete("/scheduled-notifications/1")
        .expect(500);

      expect(response.body.message).toBe(errorMessage);
    });
  });
  describe("Edge Cases and Additional Coverage", () => {
    it("should handle valid UUID parameters", async () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      sequelize.ScheduledUnitNotification.findOne.mockResolvedValue(
        mockScheduledNotification
      );

      const response = await request(app)
        .get(`/scheduled-notifications/${validUuid}`)
        .expect(200);

      expect(sequelize.ScheduledUnitNotification.findOne).toHaveBeenCalledWith({
        where: { id: validUuid, isDeleted: false },
      });
    });

    it("should handle different scheduledTime formats", async () => {
      const timeVariations = ["08:30:45", "23:59:59", "00:00:00"];

      for (const time of timeVariations) {
        const notificationWithTime = {
          ...newNotificationData,
          scheduledTime: time,
        };

        sequelize.ScheduledUnitNotification.create.mockResolvedValue({
          ...mockScheduledNotification,
          scheduledTime: time,
          toJSON: () => ({
            ...mockScheduledNotification.toJSON(),
            scheduledTime: time,
          }),
        });

        const response = await request(app)
          .post("/scheduled-notifications")
          .send(notificationWithTime)
          .expect(201);

        expect(response.body.data.scheduledTime).toBe(time);
      }
    });

    it("should handle notifications with lastTriggered date", async () => {
      const notificationWithLastTriggered = {
        ...mockScheduledNotification,
        lastTriggered: "2024-01-15T10:30:00Z",
        toJSON: () => ({
          ...mockScheduledNotification.toJSON(),
          lastTriggered: "2024-01-15T10:30:00Z",
        }),
      };

      sequelize.ScheduledUnitNotification.findOne.mockResolvedValue(
        notificationWithLastTriggered
      );

      const response = await request(app)
        .get("/scheduled-notifications/uuid-1")
        .expect(200);

      expect(response.body.data.lastTriggered).toBe("2024-01-15T10:30:00Z");
    });

    it("should handle notifications with isActive false", async () => {
      const inactiveNotification = {
        ...mockScheduledNotification,
        isActive: false,
        toJSON: () => ({
          ...mockScheduledNotification.toJSON(),
          isActive: false,
        }),
      };

      sequelize.ScheduledUnitNotification.findAll.mockResolvedValue([
        inactiveNotification,
      ]);

      const response = await request(app)
        .get("/scheduled-notifications")
        .expect(200);

      expect(response.body.data[0].isActive).toBe(false);
    });

    it("should handle multiple notifications for same unit", async () => {
      const multipleNotifications = [
        mockScheduledNotification,
        {
          ...mockScheduledNotification,
          id: "uuid-2",
          title: "Second Notification",
          notificationType: "weekly",
          dayOfWeek: 3,
        },
      ];

      sequelize.ScheduledUnitNotification.findAll.mockResolvedValue(
        multipleNotifications
      );

      const response = await request(app)
        .get("/scheduled-notifications/unit/unit-uuid-1")
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(sequelize.ScheduledUnitNotification.findAll).toHaveBeenCalledWith({
        where: {
          unitBudidayaId: "unit-uuid-1",
          isDeleted: false,
        },
        order: [["createdAt", "DESC"]],
      });
    });

    it("should handle all notification types", async () => {
      const notificationTypes = ["daily", "weekly", "monthly"];

      for (const type of notificationTypes) {
        const notification = {
          ...newNotificationData,
          notificationType: type,
        };

        sequelize.ScheduledUnitNotification.create.mockResolvedValue({
          ...mockScheduledNotification,
          notificationType: type,
          toJSON: () => ({
            ...mockScheduledNotification.toJSON(),
            notificationType: type,
          }),
        });

        const response = await request(app)
          .post("/scheduled-notifications")
          .send(notification)
          .expect(201);

        expect(response.body.data.notificationType).toBe(type);
      }
    });

    it("should handle all tipeLaporan types", async () => {
      const laporanTypes = ["panen", "vitamin"];

      for (const type of laporanTypes) {
        const notification = {
          ...newNotificationData,
          tipeLaporan: type,
        };

        sequelize.ScheduledUnitNotification.create.mockResolvedValue({
          ...mockScheduledNotification,
          tipeLaporan: type,
          toJSON: () => ({
            ...mockScheduledNotification.toJSON(),
            tipeLaporan: type,
          }),
        });

        const response = await request(app)
          .post("/scheduled-notifications")
          .send(notification)
          .expect(201);

        expect(response.body.data.tipeLaporan).toBe(type);
      }
    });

    it("should handle dayOfWeek values from 0-6", async () => {
      for (let day = 0; day <= 6; day++) {
        const notification = {
          ...newNotificationData,
          notificationType: "weekly",
          dayOfWeek: day,
        };

        sequelize.ScheduledUnitNotification.create.mockResolvedValue({
          ...mockScheduledNotification,
          dayOfWeek: day,
          toJSON: () => ({
            ...mockScheduledNotification.toJSON(),
            dayOfWeek: day,
          }),
        });

        const response = await request(app)
          .post("/scheduled-notifications")
          .send(notification)
          .expect(201);

        expect(response.body.data.dayOfWeek).toBe(day);
      }
    });

    it("should handle dayOfMonth values from 1-31", async () => {
      const daysToTest = [1, 15, 28, 31];

      for (const day of daysToTest) {
        const notification = {
          ...newNotificationData,
          notificationType: "monthly",
          dayOfMonth: day,
        };

        sequelize.ScheduledUnitNotification.create.mockResolvedValue({
          ...mockScheduledNotification,
          dayOfMonth: day,
          toJSON: () => ({
            ...mockScheduledNotification.toJSON(),
            dayOfMonth: day,
          }),
        });

        const response = await request(app)
          .post("/scheduled-notifications")
          .send(notification)
          .expect(201);

        expect(response.body.data.dayOfMonth).toBe(day);
      }
    });
  });
});
