const express = require('express');
const authController = require('../controllers/authController');
const habitsCalendarController = require('../controllers/habitsCalendarController');

const router = express.Router();

router.post(
  '/',
  authController.protect,
  habitsCalendarController.getHabitsCalendar,
);
router.patch(
  '/add-habit',
  authController.protect,
  habitsCalendarController.createHabit,
);
router.patch(
  '/delete-habit',
  authController.protect,
  habitsCalendarController.deleteHabit,
);

router.patch(
  '/update-calendars-days',
  authController.protect,
  habitsCalendarController.updateCalendarsDays,
);

router.patch(
  '/change-habit-icon',
  authController.protect,
  habitsCalendarController.changeHabitIcon,
);

module.exports = router;
