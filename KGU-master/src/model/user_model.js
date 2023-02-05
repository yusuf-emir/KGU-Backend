const mongoose = require("mongoose");

const CoursesSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor",
  },
  mentor_name: String,
  mentor_photo_path: String,
  date: {
    type: String,
  },
  hour: String,
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
    courses: {
      type: [CoursesSchema],
      default: [],
    },
    current_jeton: {
      type: Number,
      default: 0,
    },
    call_id: {
      type: String,
      default: "",
    },
  },
  { collection: "Users", timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
