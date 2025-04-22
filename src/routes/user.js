const express = require('express');
const router = express.Router();
const UsersController = require('../controller/user.js');

router.get('/', UsersController.getAllUsers);

router.get('/:id', UsersController.getUserById);

router.post('/', UsersController.createUser);

router.put('/:id', UsersController.updateUser);

router.delete('/:id', UsersController.deleteUser);

module.exports = router;