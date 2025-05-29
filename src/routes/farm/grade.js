const express = require('express');
const router = express.Router();
const GradeController = require('../../controller/farm/grade.js');
const auditMiddleware = require('../../middleware/auditTrail.js');

const sequelize = require("../../model/index");
const db = sequelize.sequelize;
const Grade = sequelize.Grade;

router.get('/', GradeController.getAllGrade);

router.get('/:id', GradeController.getGradeById);

router.get('/search/:nama', GradeController.getGradeBySearch);

router.post('/', auditMiddleware({ model: Grade, tableName: "Grade" }), GradeController.createGrade);

router.put('/:id', auditMiddleware({ model: Grade, tableName: "Grade" }), GradeController.updateGrade);

router.delete('/:id', auditMiddleware({ model: Grade, tableName: "Grade" }), GradeController.deleteGrade);

module.exports = router;