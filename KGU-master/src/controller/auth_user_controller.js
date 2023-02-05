const { validationResult } = require("express-validator");
const User = require("../model/user_model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HttpError = require("../error/HttpError");
const nodemailer = require("nodemailer");
const ObjectId = require("mongodb").ObjectId;
const Mentor = require("../model/mentor_model");

const signup = async (req, res, next) => {
  const errorArray = validationResult(req);

  if (!errorArray.isEmpty()) {
    const httpError = new HttpError(
      "Invalid inputs passed, please check your data.",
      422
    );
    return next(httpError);
  }
  try {
    const _user = await User.findOne({ email: req.body.email });

    if (_user) {
      const httpError = new HttpError(
        "Use exists already, please login instead.",
        500
      );
      return next(httpError);
    }

    const newUser = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
    });

    await newUser.save();

    res.status(200).json({ id: newUser.id, email: newUser.email });
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  const _user = await User.findOne({ email: req.body.email });

  if (!_user) {
    const noUserError = new HttpError("Email/password is invalid.");
    return next(noUserError);
  }

  const comparedPass = await bcrypt.compare(req.body.password, _user.password);
  if (!comparedPass) {
    const noUserError = new HttpError("Email/password is invalid.");
    return next(noUserError);
  }

  const jwtInfo = {
    id: _user.id,
    firstname: _user.firstname,
    lastname: _user.lastname,
    email: _user.email,
  };

  const jwtToken = jwt.sign(jwtInfo, "kgu_jwt_token", { expiresIn: 86400 });

  res.status(201).json({ message: "Successful", token: jwtToken });
};

const getUser = async (req, res, next) => {
  const id = req.params.id;
  const _user = await User.findById(id, { password: 0 });

  if (!_user) {
    const noUserError = new HttpError("User could not be found", 404);
    return next(noUserError);
  }

  res.status(201).json({ user: _user });
};

const updateUser = async (req, res, next) => {
  const user_id = ObjectId(req.params.id);
  let foundedUser = null;

  const update = { ...req.body };

  if (update.password) {
    const hashedPassword = await bcrypt.hash(update.password, 10);
    update.password = hashedPassword;
  }

  try {
    const _user = await User.findById({ _id: user_id });
    if (_user) {
      foundedUser = _user;
    } else {
      return next("Mentor could not be found", 500);
    }
  } catch (error) {
    next(error);
  }

  try {
    const user = await User.findByIdAndUpdate(
      { _id: user_id },
      {
        ...update,
      }
    );
    res.status(201).json({ message: "Updated" });
  } catch (error) {
    next(error);
  }
};

const addCredit = async (req, res, next) => {
  const errorArray = validationResult(req);

  if (!errorArray.isEmpty()) {
    const httpError = new HttpError(errorArray.array()[0].msg, 500);
    return next(httpError);
  }

  const user_id = req.body.id;
  const quantity = parseInt(req.body.quantity);

  try {
    const _user = await User.findById(user_id);

    console.log(_user);

    if (!_user) {
      const noUserError = new HttpError("User could not be found", 500);
      return next(noUserError);
    }

    let current_jeton = _user.current_jeton;
    current_jeton = current_jeton + quantity;

    await _user.updateOne({
      current_jeton: current_jeton,
    });

    res.status(201).json({ message: "Uploaded credit." });
  } catch (error) {
    next(error);
  }
};

const takeCourse = async (req, res, next) => {
  const userId = req.body.user_id;
  const mentorId = req.body.mentor_id;
  const date = req.body.date;
  const hour = req.body.hour;

  try {
    const user = await User.findById(userId, { password: 0 });
    const courses = user.courses;

    const mentor = await Mentor.findById(mentorId, { password: 0 });
    const mentorCourses = mentor.courses;

    const newCourse = {
      mentor: mentorId,
      mentor_name: mentor.firstname + " " + mentor.lastname,
      mentor_photo_path: mentor.photo_path,
      date,
      hour,
    };
    courses.push(newCourse);

    const newMentorCourse = {
      user: userId,
      user_name: user.firstname + " " + user.lastname,
      date: date,
      hour: hour,
    };
    mentorCourses.push(newMentorCourse);

    const user_current_credit = user.current_jeton;
    const user_jeton = user_current_credit - mentor.hour_price;

    const mentor_total_income =
      mentor.total_income + parseInt(mentor.hour_price);

    await user.updateOne({ courses: [...courses], current_jeton: user_jeton });

    await mentor.updateOne({
      courses: [...mentorCourses],
      total_income: mentor_total_income,
    });

    return res.status(201).json({ message: "Courses is updated" });
  } catch (error) {
    next(error);
  }
};

const comment = async (req, res, next) => {
  const user_id = req.body.user_id;
  const mentor_id = req.body.mentor_id;
  const comment = req.body.comment;

  const user = await User.findById(user_id);

  if (!user) {
    const noFoundUser = new HttpError("No found user", 404);
    return next(noFoundUser);
  }

  const mentor = await Mentor.findById(mentor_id);

  if (!mentor) {
    const noFoundUser = new HttpError("No found mentor", 404);
    return next(noFoundUser);
  }

  const comments = [...mentor.comments];

  const newComment = {
    user_name: user.firstname + " " + user.lastname,
    comment: comment,
  };

  comments.push(newComment);

  await mentor.updateOne({comments: [...comments]});

  return res.status(201).json({message: "Comments are updated"});

}

module.exports = {
  signup,
  signin,
  getUser,
  updateUser,
  addCredit,
  takeCourse,
  comment,
};
