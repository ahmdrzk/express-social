const express = require("express");

const postsControllers = require("../controllers/postsControllers");
const authControllers = require("../controllers/authControllers");
const commentsRouter = require("./commentsRouter");
const likesRouter = require("./likesRouter");
const { uploadPostImage, processImage } = require("../helpers/uploadImages");

const router = express.Router({ mergeParams: true });

router.use("/:postId/comments", commentsRouter);
router.use("/:postId/likes", likesRouter);

router.use(authControllers.protectRoute);
router.post("/", authControllers.authorizeUserId, uploadPostImage, processImage, postsControllers.createOnePost);
router.get("/", postsControllers.requestAllPosts);
router.get("/home", authControllers.authorizeUserId, postsControllers.requestHomeFeed);
router.get("/:postId", postsControllers.requestOnePost);
router.patch("/:postId", authControllers.authorizeUserId, postsControllers.updateOnePost);
router.delete("/:postId", authControllers.authorizeUserId, postsControllers.deleteOnePost);

module.exports = router;
