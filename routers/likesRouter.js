const express = require("express");

const likesControllers = require("../controllers/likesControllers");
const authControllers = require("../controllers/authControllers");

const router = express.Router({ mergeParams: true });

router.use(authControllers.protectRoute);
router
  .route("/")
  .post(authControllers.authorizeUserId, likesControllers.createPostLike, likesControllers.createCommentLike);

module.exports = router;
