const mongoose = require("mongoose");

const CoursesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  user_name: String,
  date: {
    type: String,
  },
  hour: String,
});

const DateSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    trim: true,
  },
  hours: {
    type: Array,
    required: true,
  },
});

const CommentSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
    trim: true,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  }
});

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
      minlenght: [1, "Firstname cannot be null or empty."],
      maxlength: [30, "Firstname cannot be bigger than 30 characters."],
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
      minlenght: [1, "Lastname cannot be null or empty."],
      maxlength: [30, "Lastname cannot be bigger than 30 characters."],
    },
    full_name: String,
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    emailActive: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    free_dates: [DateSchema],
    courses: {
      type: [CoursesSchema],
      default: [],
    },
    total_income: {
      type: Number,
      default: 0,
    },
    photo_path: {
      type: String,
      default: "",
    },
    mentor_about: {
      type: String,
      default: "",
    },
    hour_price: {
      type: String,
      default: "",
    },
    comments: {
      type: [CommentSchema],
    }
  },
  { collection: "Mentors", timestamps: true }
);

const User = mongoose.model("Mentor", UserSchema);

module.exports = User;
