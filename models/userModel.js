const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const passwordChangeSubSchema = new mongoose.Schema(
  {
    token: String,
    expires_in: Date,
  },
  { id: false }
);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name field is required."],
    trim: true,
    minLength: [5, "Name field has to be more than or equal to 5 characters."],
    maxLength: [40, "Name field has to be less than or equal to 40 characters."],
    validate: {
      validator: /^(?:[A-Za-z]+)(?:[A-Za-z0-9 _]*)$/,
      message: "Name field has to start with a letter and contain only letters, numbers and spaces.",
    },
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email field is required."],
    trim: true,
    lowercase: true,
    minLength: [5, "Email field has to be more than or equal to 5 characters."],
    maxLength: [40, "Email field has to be less than or equal to 40 characters."],
    validate: {
      validator: validator.isEmail,
      message: "Email field has to be a valid email address.",
    },
  },
  password: {
    type: String,
    required: [true, "Password field is required."],
    trim: true,
    minLength: [8, "Password field has to be more than or equal to 8 characters."],
    maxLength: [50, "Password field has to be less than or equal to 50 characters."],
    select: false,
  },
  birthdate: {
    type: Date,
    required: [true, "Birthdate field is required."],
    validate: {
      validator: function (value) {
        return new Date() - value >= new Date(504911232000);
      },
      message: "Birthdate field has to be more than or equal to today minus 16 years.",
    },
  },
  country: {
    type: String,
    required: [true, "Country field is required."],
    trim: true,
    minLength: [2, "Country field has to be more than or equal to 2 characters."],
    maxLength: [20, "Country field has to be less than or equal to 20 characters."],
    match: [/^[^*|":<>[\]{}`\\()';@&$]+$/, "Country field has to contain only letters and spaces."],
    default: "Earth",
  },
  status: {
    type: String,
    required: [true, "Status field is required."],
    trim: true,
    minLength: [2, "Status field has to be more than or equal to 2 characters."],
    maxLength: [100, "Status field has to be less than or equal to 100 characters."],
    default: "New User",
  },
  image: {
    type: String,
    required: [true, "Image field is required."],
    default: `${process.env.CLOUDINARY_USERS_IMAGES_URL}/default.png`,
  },
  role: {
    type: String,
    required: [true, "Role field is required."],
    enum: {
      values: ["user", "moderator"],
      message: "Available values are: 'user', 'moderator'.",
    },
    default: "user",
  },
  isDeactivated: {
    type: Boolean,
    required: [true, "IsDeactivated field is required."],
    default: false,
  },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  passwordChange: {
    type: passwordChangeSubSchema,
    default: {},
    select: false,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const hashedPassword = await bcrypt.hash(this.password, 12);
  this.password = hashedPassword;

  if (!this.isNew) this.passwordChange._id = mongoose.Types.ObjectId();

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ isDeactivated: { $ne: true } });

  next();
});

userSchema.methods.isPasswordValid = async function (inputPassword) {
  /*
  `inputPassword`: <String>
  */

  return await bcrypt.compare(inputPassword, this.password);
};

userSchema.methods.generatePasswordResetToken = function () {
  const passwordResetToken = crypto.randomBytes(32).toString("hex");

  const hashedPasswordResetToken = crypto.createHash("sha256").update(passwordResetToken).digest("hex");

  this.passwordChange.token = hashedPasswordResetToken;
  this.passwordChange.expires_in = Date.now() + 10 * 60 * 1000;

  return passwordResetToken;
};

userSchema.methods.isPasswordResetTokenValid = function (resetToken) {
  /*
  `resetToken`: <String>
  */

  const hashedPasswordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  return hashedPasswordResetToken === this.passwordChange.token && this.passwordChange.expires_in > Date.now();
};

userSchema.methods.resetPassword = function (newPassword) {
  /*
  `newPassword`: <String>
  */

  this.password = newPassword;

  this.passwordChange.token = undefined;
  this.passwordChange.expires_in = undefined;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
