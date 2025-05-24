const sequelize = require("../../model/index");
const GlobalNotificationSetting = sequelize.GlobalNotificationSetting;

const getAllGlobalNotificationSetting = async (req, res) => {
  try {
    const data = await GlobalNotificationSetting.findAll({
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
      message: "Successfully retrieved all global notification settings",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const getGlobalNotificationSettingById = async (req, res) => {
  try {
    const data = await GlobalNotificationSetting.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      message: "Successfully retrieved global notification setting",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const createGLobalNotificationSetting = async (req, res) => {
  try {
    const data = await GlobalNotificationSetting.create(req.body);

    res.locals.createdData = data.toJSON();

    return res.status(201).json({
      message: "Successfully created global notification setting",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const updateGlobalNotificationSetting = async (req, res) => {
  try {
    const data = await GlobalNotificationSetting.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    const { notificationType } = req.body;
    const updatedData = { ...req.body };

    if (notificationType) {
      if (updatedData.notificationType == "repeat") {
        updatedData.scheduledDate = null;
      }
    }

    await GlobalNotificationSetting.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const updated = await GlobalNotificationSetting.findOne({
      where: { id: req.params.id },
    });

    res.locals.updatedData = updated.toJSON();

    return res.status(200).json({
      message: "Successfully updated global notification setting",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

const deleteGlobalNotificationSetting = async (req, res) => {
  try {
    const data = await GlobalNotificationSetting.findOne({
      where: { id: req.params.id, isDeleted: false },
    });

    if (!data || data.isDeleted) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    await GlobalNotificationSetting.update(
      { isDeleted: true },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    const deleted = await GlobalNotificationSetting.findOne({
      where: { id: req.params.id },
    });

    res.locals.deletedData = deleted.toJSON();

    return res.status(200).json({
      message: "Successfully deleted global notification setting",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      detail: error,
    });
  }
};

module.exports = {
  getAllGlobalNotificationSetting,
  getGlobalNotificationSettingById,
  createGLobalNotificationSetting,
  updateGlobalNotificationSetting,
  deleteGlobalNotificationSetting,
};
