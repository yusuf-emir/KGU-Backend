const { validationResult } = require("express-validator");
const Mentor = require("../model/mentor_model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const HttpError = require("../error/HttpError");
const nodemailer = require("nodemailer");
const User = require("../model/mentor_model");
const ObjectId = require("mongodb").ObjectId;

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
    const _mentor = await Mentor.findOne({ email: req.body.email });

    if (_mentor) {
      const httpError = new HttpError(
        "Use exists already, please login instead.",
        500
      );
      return next(httpError);
    }

    const newUser = new Mentor({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
      full_name: req.body.firstname + " " + req.body.lastname,
    });

    await newUser.save();

    res.status(200).json({ id: newUser.id, email: newUser.email });
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  const _mentor = await Mentor.findOne({ email: req.body.email });

  if (!_mentor) {
    const noUserError = new HttpError("Email/password is invalid.");
    return next(noUserError);
  }

  const comparedPass = await bcrypt.compare(
    req.body.password,
    _mentor.password
  );
  if (!comparedPass) {
    const noUserError = new HttpError("Email/password is invalid.");
    return next(noUserError);
  }

  const jwtInfo = {
    id: _mentor.id,
    firstname: _mentor.firstname,
    lastname: _mentor.lastname,
    email: _mentor.email,
  };

  const jwtToken = jwt.sign(jwtInfo, "kgu_jwt_token", { expiresIn: 86400 });

  res.status(201).json({ message: "Successful", token: jwtToken });
};

const allMentors = async (req, res, next) => {
  try {
    const all = await Mentor.find({}, { password: 0 });
    res.json({ mentors: all });
  } catch (error) {
    next(error);
  }
};

const updateMentor = async (req, res, next) => {
  const mentor_id = ObjectId(req.params.id);
  let foundedMentor = null;

  let update = { ...req.body };

  if (req.file) {
    update = {
      ...update,
      photo_path: req.file.filename,
    };
  }

  if (update.password) {
    const hashedPassword = await bcrypt.hash(update.password, 10);
    update.password = hashedPassword;
  }

  try {
    const _mentor = await Mentor.findById({ _id: mentor_id });
    if (_mentor) {
      foundedMentor = _mentor;
    } else {
      return next("Mentor could not be founded", 500);
    }
  } catch (error) {
    next(error);
  }

  let free_dates = foundedMentor.free_dates;
  if (req.body.new_date) {
    const newDate = req.body.new_date;
    let isExistsDate = false;
    if (free_dates.length > 0) {
      free_dates.forEach((item) => {
        if (item.date === newDate.date) {
          item.hours = [...item.hours, ...newDate.hours];
          isExistsDate = true;
        }
      });
      if (!isExistsDate) {
        free_dates.push(newDate);
      }
    } else {
      free_dates.push(newDate);
    }
  }

  try {
    const mentor = await Mentor.findByIdAndUpdate(
      { _id: mentor_id },
      {
        ...update,
        free_dates,
      }
    );
    console.log(mentor);
    res.status(201).json({ message: "Updated" });
  } catch (error) {
    next(error);
  }
};

const getMentor = async (req, res, next) => {
  const id = req.params.id;
  try {
    const _mentor = await Mentor.findById(id, { password: 0 });

    if (!_mentor) {
      const noMentorError = new HttpError("Mentor could not be founded", 201);
      return next(noMentorError);
    }

    res.status(201).json({ mentor: _mentor });
  } catch (error) {
    next(error);
  }
};

const searchMentors = async (req, res, next) => {
  const searchKey = req.body.key;

  const mentors = await Mentor.find({
    firstname: { $regex: new RegExp(searchKey, "i") },
  });

  res.status(201).json({ mentors: mentors });
};

module.exports = {
  signup,
  signin,
  allMentors,
  updateMentor,
  getMentor,
  searchMentors,
};
