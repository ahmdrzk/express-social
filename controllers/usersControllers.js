const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const OpError = require("../helpers/opError");
const { sendWelcome, sendPasswordResetUrl } = require("../helpers/sendEmail");

/* #1 */
exports.createOneUser = async (req, res, next) => {
  const { name, email, password, birthdate, country, status } = req.body.data;

  try {
    const user = (await User.create([{ name, email, password, birthdate, country, status }]))[0];

    if (user) sendWelcome(user);

    res.status(201).json({
      results: 0,
      status: "success",
      message: "User account created successfully. Please login.",
    });
  } catch (error) {
    next(error);
  }
};

/* #2 */
exports.requestAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      results: users.length,
      status: "success",
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

/* #3 */
exports.requestOneUser = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) return next(new OpError(404, `No user found with this id '${userId}'.`));

    res.status(200).json({
      results: 1,
      status: "success",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/* #4 */
exports.requestUserFollowing = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User.findOne({ _id: userId }).populate("following");

    if (!user) return next(new OpError(404, `No user found with this id '${userId}'.`));

    res.status(200).json({
      results: user.following.length,
      status: "success",
      data: { following: user.following },
    });
  } catch (error) {
    next(error);
  }
};

/* #5 */
exports.requestUserFollowers = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User.findOne({ _id: userId }).populate("followers");

    if (!user) return next(new OpError(404, `No user found with this id '${userId}'.`));

    res.status(200).json({
      results: user.followers.length,
      status: "success",
      data: { followers: user.followers },
    });
  } catch (error) {
    next(error);
  }
};

/* #6 */
exports.updateOneUser = async (req, res, next) => {
  const userId = req.params.userId;
  const reqData = req.body;
  const allowedFields = ["name", "email", "birthdate", "country", "status", "image"];

  for (const key in reqData) {
    if (!allowedFields.includes(key)) delete reqData[key];
  }

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return next(new OpError(404, `No user found with this id '${userId}'.`));
    }

    user.set(reqData);
    await user.save();

    res.status(200).json({
      results: 1,
      status: "success",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/* #7 */
exports.deleteOneUser = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) return next(new OpError(404, `No user found with this id '${userId}'.`));

    user.set({ isDeactivated: true });
    await user.save();

    res.status(204).json({
      results: 0,
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};

/* #8 */
exports.authenUser = async (req, res, next) => {
  const { email, password } = req.body.data;

  try {
    if (!email || !password) {
      return next(new OpError(400, "Email and Password fields are required for user authentication."));
    }

    const user = await User.findOne({ email }).select("+password +passwordChange");

    if (!user || !(await user.isPasswordValid(password))) {
      return next(new OpError(401, "Incorrect Email or Password."));
    }

    const token = jwt.sign({ id: user._id, passwordChangeId: user.passwordChange._id }, process.env.JWT_PRIVATE_KEY, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    user.password = undefined;

    res.status(200).json({
      results: 1,
      status: "success",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* #9 */
exports.updatePassword = async (req, res, next) => {
  const userId = req.params.userId;
  const { currentPassword, password } = req.body.data;

  try {
    const user = await User.findOne({ _id: userId }).select("+password +passwordChange");

    if (!user) return next(new OpError(404, `No user found with this id '${userId}'.`));

    if (!(await user.isPasswordValid(currentPassword))) return next(new OpError(401, "Incorrect current password."));

    user.password = password;
    await user.save();

    res.status(200).json({
      results: 0,
      status: "success",
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    next(error);
  }
};

/* #10 */
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body.data;

  try {
    const user = await User.findOne({ email }).select("+passwordChange");

    if (!user) return next(new OpError(404, `No user found with this email '${email}'.`));

    const passwordResetToken = user.generatePasswordResetToken();
    await user.save();

    const passwordResetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${passwordResetToken}`;

    const passwordResetClientUrl = `${process.env.CLIENT_HOST}/resetpassword/${passwordResetToken}`;

    sendPasswordResetUrl(user, passwordResetUrl, passwordResetClientUrl);

    res.status(200).json({
      results: 1,
      status: "success",
      message: "Password reset URL is sent to the provided email.",
      data: { passwordResetToken }, // NOTE: Should be received by email only.
    });
  } catch (error) {
    next(error);
  }
};

/* #11 */
exports.resetPassword = async (req, res, next) => {
  const resetToken = req.params.resetToken;
  const { email, password } = req.body.data;

  try {
    const user = await User.findOne({ email }).select("+passwordChange");

    if (!user) return next(new OpError(404, `No user found with this email '${email}'.`));

    if (!user.isPasswordResetTokenValid(resetToken))
      return next(new OpError(401, "Password reset token is not valid or has expired."));

    user.resetPassword(password);
    await user.save();

    res.status(200).json({
      results: 0,
      status: "success",
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    next(error);
  }
};

/* #12 */
exports.searchUsersByName = async (req, res, next) => {
  const searchName = req.query.name;

  if (!searchName || searchName === " ") {
    return res.status(200).json({
      results: 0,
      status: "success",
      data: { users: [] },
    });
  }

  const searchStr = new RegExp(searchName, "i");

  try {
    const users = await User.find({ name: searchStr });

    res.status(200).json({
      results: users.length,
      status: "success",
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

/* #13 */
exports.followUser = async (req, res, next) => {
  const userId = req.params.userId;
  const followId = req.params.followId;
  const session = await mongoose.startSession();

  if (userId === followId) return next(new OpError(400, "FollowId has to be different from userId."));

  try {
    session.startTransaction();

    const user = await User.findOne({ _id: userId }, "", { session });

    if (!user) {
      await session.abortTransaction();
      session.endSession();

      return next(new OpError(404, `No user found with this id '${userId}'.`));
    }

    let userWithUpdatedFollowing;

    if (user.following.includes(followId)) {
      userWithUpdatedFollowing = await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { following: followId } },
        { session }
      );

      await User.updateOne({ _id: followId }, { $pull: { followers: userId } }, { session });
    } else {
      userWithUpdatedFollowing = await User.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { following: followId } },
        { session }
      );

      await User.updateOne({ _id: followId }, { $addToSet: { followers: userId } }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      results: 1,
      status: "success",
      data: { user: userWithUpdatedFollowing },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    next(error);
  }
};

/* #14 */
exports.exploreUsers = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) return next(new OpError(404, `No user found with this id '${userId}'.`));

    const users = await User.find({ _id: { $nin: [userId, ...user.following] } }).limit(20);

    res.status(200).json({
      results: users.length,
      status: "success",
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};
