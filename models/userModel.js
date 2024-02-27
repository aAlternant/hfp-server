const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'User must have an email address!'],
      unique: true,
      trim: true,
      validation: [validator.isEmail, 'Email must be valid!'],
    },

    username: {
      type: String,
      required: [true, 'User must have an username!'],
      unique: true,
      trim: true,
      validation: [
        validator.isAlphanumeric,
        'The username must contain only letters and numbers!',
      ],
    },

    password: {
      type: String,
      required: [true, 'User must have a password'],
      minlength: 8,
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: [true, 'User must confirm password'],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: 'Password must be the same',
      },
    },

    habitsCalendar: {
      type: {
        habits: {
          type: [
            {
              id: {
                type: Number,
              },
              name: {
                type: String,
                required: [true, 'Habit must have a name'],
              },
              icon: {
                type: String,
                default: 'undefined',
              },
              status: {
                type: String,
                enum: ['warning', 'alarm', 'completed'],
              },
            },
          ],
          _id: false,
        },
        days: {
          type: [
            {
              date: Number,
              completedHabits: [Number], // Array of habit ids
            },
          ],
          default: [],
          _id: false,
        },
      },
      default: {},
      _id: false,
    },

    passwordChangedAt: Date,
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  // Password hash
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', async function (next) {
  // Habits calendar days date creator

  if (!this.habitsCalendar.days[0]) {
    const currentDate = new Date();

    const getDaysInMonth = () =>
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      ).getDate();

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < getDaysInMonth(); i++) {
      this.habitsCalendar.days[i] = {
        date: i + 1,
      };
    }
  }

  next();
});

userSchema.post('findOneAndUpdate', async (doc) => {
  // Habits id creator

  // if (!doc.isModified('habitsCalendar.habits')) return;
  try {
    const { habitsCalendar } = doc;
    const { habits } = habitsCalendar;

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < habits.length; i++) {
      if (!habits[i].id) {
        if (i === 0) habits[i].id = 0;
        else habits[i].id = habits[i - 1].id + 1;
      }
    }

    await doc.save({ validateModifiedOnly: true });
  } catch (error) {
    console.error(error);
  }
});

userSchema.methods.verifyPassword = async function (
  candidatePassword,
  userPassword,
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.isPasswordChangedAfter = function (timestamp) {
  if (this.passwordChangedAt) {
    const changedAtTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return timestamp < changedAtTimeStamp;
  }

  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
