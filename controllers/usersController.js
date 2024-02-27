const catchAsync = require('../utils/catchAsync');

exports.getAuthorizedUser = catchAsync(async (req, res) => {
  if (req.user) {
    res.status(200).send({
      message: 'success',
      data: req.user,
    });
  }
});
