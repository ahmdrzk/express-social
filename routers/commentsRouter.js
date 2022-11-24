const express = require("express");

const commentsControllers = require("../controllers/commentsControllers");
const authControllers = require("../controllers/authControllers");
const likesRouter = require("./likesRouter");

const router = express.Router({ mergeParams: true });

router.use("/:commentId/likes", likesRouter);

router.use(authControllers.protectRoute);
router.get("/", commentsControllers.requestAllComments);

router.use(authControllers.authorizeUserId);
router.post("/", commentsControllers.createOneComment);
router.patch("/:commentId", commentsControllers.updateOneComment);
router.delete("/:commentId", commentsControllers.deleteOneComment);

module.exports = router;
