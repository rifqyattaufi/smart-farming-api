const e = require("express");
const sequelize = require("../model/index");
const db = sequelize.sequelize;
const Logs = sequelize.Logs;

module.exports = ({ model, tableName }) => {
  return async (req, res, next) => {
    const actionMap = {
      POST: 'create',
      PUT: 'update',
      DELETE: 'delete',
    };

    const action = actionMap[req.method];

    const beforeUpdate = req.method === 'PUT' || req.method === 'DELETE'
      ? await model.findOne({ where: { id: req.params.id } })
      : null;

    if ((req.method === 'PUT' || req.method === 'DELETE') && !beforeUpdate) {
      console.warn(`⚠️ No data found in ${tableName} with ID ${req.params.id} for ${action} action.`);
      return next();
    }

    const oldJson = beforeUpdate ? beforeUpdate.toJSON() : null;

    res.on('finish', async () => {
      try {
        let recordId = null;
        let after = null;

        if (req.method === 'POST' && res.statusCode === 201 && res.locals?.createdData) {
            recordId = res.locals.createdData.id;
            after = res.locals.createdData;
        } 
        else if ((req.method === 'PUT' || req.method === 'DELETE') && res.locals?.updatedData) {
          recordId = req.params.id;
          after = res.locals.updatedData;
        }

        if (!req.user?.id) {
          console.warn(`⚠️ Skipping audit log for ${tableName} [${action}] - missing user ID`);
          return;
        }
  
        if (recordId && after) {
          await Logs.create({
            tableName,
            action,
            recordId,
            before: oldJson,
            after,
            changedBy: req.user.id
          });

          console.log(`✅ Audit log created for ${tableName} [${action}] - ID: ${recordId}`);
        }
      } catch (error) {
        console.error(`❌ Error saving audit log for table "${tableName}" with action "${action}":`, error.message);
      }
    });

    next();
  };
};

