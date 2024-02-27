// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const UserModel = require('../models/userModel');

// const noAuthReject = (req, next) => {
//   if (!req.user) {
//     return next(new AppError("User isn't logged in. Please log in"), 401);
//   }
// };

exports.getHabitsCalendar = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: req.user.habitsCalendar,
  });
});

exports.createHabit = catchAsync(async (req, res, next) => {
  const { user } = req;

  req.body.icon = 'undefined'; // Default icon

  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user.id,
    {
      habitsCalendar: {
        habits: [...user.habitsCalendar.habits, req.body],
      },
    },
    {
      new: true,
    },
  );

  res.status(200).json({
    status: 'success',
    data: updatedUser.habitsCalendar.habits[
      updatedUser.habitsCalendar.habits.length - 1
    ],
  });
});

exports.deleteHabit = catchAsync(async (req, res, next) => {
  const habitId = req.body.id;
  const newUser = await UserModel.findByIdAndUpdate(
    req.user.id,
    {
      $pull: {
        'habitsCalendar.habits': { id: habitId },
        'habitsCalendar.days.$[].completedHabits': habitId,
      },
    },
    {
      new: true,
    },
  );

  req.user = newUser;

  res.status(204).json({
    status: 'success',
    message: `Deleted Habit with ID ${habitId}`,
  });
});

exports.updateCalendarsDays = catchAsync(async (req, res, next) => {
  const { days } = req.body;

  const newUser = await UserModel.findByIdAndUpdate(
    req.user.id,
    {
      'habitsCalendar.days': days,
    },
    { new: true },
  );

  req.user = newUser;

  res.status(200).json({
    status: 'success',
    data: newUser.habitsCalendar.days,
  });
});

exports.changeHabitIcon = catchAsync(async (req, res, next) => {
  const { id, icon } = req.body;

  const newUser = await UserModel.findByIdAndUpdate(
    req.user.id,
    {
      $set: {
        'habitsCalendar.habits.$[habit].icon': icon,
      },
    },
    { arrayFilters: [{ 'habit.id': id }], new: true },
  );

  req.user = newUser;

  res.status(200).json({
    status: 'success',
    data: newUser.habitsCalendar.habits.filter((habit) => habit.id === id)[0],
  });
});
