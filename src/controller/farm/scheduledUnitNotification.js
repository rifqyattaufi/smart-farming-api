const sequelize = require("../../model/index");
const ScheduledUnitNotification = sequelize.ScheduledUnitNotification;

const getScheduledUnitNotifications = async (req, res) => {
  try {
    const data = await ScheduledUnitNotification.findAll({
      where: {
        isDeleted: false,
      },
      order: [["createdAt", "DESC"]],
    });

    if (data.length === 0) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved all scheduled unit notifications",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getScheduledUnitNotificationById = async (req, res) => {
  try {
    const data = await ScheduledUnitNotification.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved scheduled unit notification",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createScheduledUnitNotification = async (req, res) => {
  try {
    const data = await ScheduledUnitNotification.create(req.body);

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Successfully created scheduled unit notification",
      data: res.locals.createdData,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateScheduledUnitNotification = async (req, res) => {
  try {
    const data = await ScheduledUnitNotification.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await data.update(req.body);

    const updated = await ScheduledUnitNotification.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      message: "Successfully updated scheduled unit notification",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const deleteScheduledUnitNotification = async (req, res) => {
  try {
    const data = await ScheduledUnitNotification.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await data.update({ isDeleted: true });

    const updated = await ScheduledUnitNotification.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      message: "Successfully deleted scheduled unit notification",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  getScheduledUnitNotifications,
  getScheduledUnitNotificationById,
  createScheduledUnitNotification,
  updateScheduledUnitNotification,
  deleteScheduledUnitNotification,
};
