const express = require("express");
const router = express.Router();
const authMentorController = require("../controller/auth_mentor_controller");
const validationMiddleware = require("../middleware/validation_middleware");
const multerConfig = require("../config/multer_config");

router.post(
  "/signup",
  validationMiddleware.validateNewUser(),
  authMentorController.signup
);

router.post(
  "/signin",
  validationMiddleware.validateLoginUser(),
  authMentorController.signin
);

router.get("/all-mentors", authMentorController.allMentors);

router.post(
  "/update/:id",
  multerConfig.single("image"),
  authMentorController.updateMentor
);

router.get("/:id", authMentorController.getMentor);

router.post("/search-mentors", authMentorController.searchMentors);

module.exports = router;
