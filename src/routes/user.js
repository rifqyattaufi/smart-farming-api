const express = require('express');
const router = express.Router();
const UsersController = require('../controller/user.js');

router.get('/', UsersController.getAllUsers);

router.get('/id/:id', UsersController.getUserById);

router.get('/seller/:id', UsersController.getPenjualById);

router.post('/', UsersController.createUser);

router.put('/:id', UsersController.updateUser);

router.delete('/:id', UsersController.deleteUser);

router.get('/seller', UsersController.getPenjual);


module.exports = router;