const express = require('express');
const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.post('/signUp', authController.signUp);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.get(
  '/get-user',
  authController.protect,
  usersController.getAuthorizedUser,
);

module.exports = router;
