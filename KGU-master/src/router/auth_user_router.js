const express = require("express");
const router = express.Router();
const authUserController = require("../controller/auth_user_controller");
const validationMiddleware = require("../middleware/validation_middleware");

router.post(
  "/signup",
  validationMiddleware.validateNewUser(),
  authUserController.signup
);

router.post(
  "/signin",
  validationMiddleware.validateLoginUser(),
  authUserController.signin
);

router.get("/:id", authUserController.getUser);

router.patch("/update/:id", authUserController.updateUser);

router.post(
  "/add-credit",
  validationMiddleware.validateAddingCredit(),
  authUserController.addCredit
);

router.post("/take-course", authUserController.takeCourse);

router.post("/comment", authUserController.comment);

module.exports = router;
