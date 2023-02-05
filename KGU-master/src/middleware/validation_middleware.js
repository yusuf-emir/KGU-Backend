const { body } = require("express-validator");

const validateNewUser = () => {
  return [
    body("firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Firstname cannot be null or empty.")
      .isLength({ max: 30 })
      .withMessage("Firstname cannot be bigger than 30 characters."),
    body("lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Lastname cannot be null or empty.")
      .isLength({ max: 30 })
      .withMessage("Lastname cannot be bigger than 30 characters."),
    body("email").trim().isEmail().withMessage("Email is invalid."),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password cannot be smaller than 6 characters."),
    body("repassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password are not the same.");
        }
        return true;
      }),
  ];
};

const validateLoginUser = () => {
  return [
    body("email").trim().isEmail().withMessage("Email is invalid."),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Password cannot be smaller than 6 characters."),
  ];
};

const validateAddingCredit = () => {
  return [
    body("quantity")
      .trim()
      .isAlphanumeric()
      .withMessage("Please send number value."),
  ];
};

module.exports = {
  validateNewUser,
  validateLoginUser,
  validateAddingCredit,
};
