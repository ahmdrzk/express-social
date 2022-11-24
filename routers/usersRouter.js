const express = require("express");

const usersControllers = require("../controllers/usersControllers");
const authControllers = require("../controllers/authControllers");
const postsRouter = require("../routers/postsRouter");
const { uploadUserImage, processImage } = require("../helpers/uploadImages");

const router = express.Router();

router.use("/:userId/posts", postsRouter);

router.post("/signup", usersControllers.createOneUser);
router.post("/signin", usersControllers.authenUser);
router.post("/forgotPassword", usersControllers.forgotPassword);
router.patch("/resetPassword/:resetToken", usersControllers.resetPassword);

router.use(authControllers.protectRoute);
router.get("/search", usersControllers.searchUsersByName);
router.get("/:userId", usersControllers.requestOneUser);
router.get("/:userId/following", usersControllers.requestUserFollowing);
router.get("/:userId/followers", usersControllers.requestUserFollowers);
router.route("/").get(authControllers.authorize("moderator"), usersControllers.requestAllUsers);

router.use("/:userId", authControllers.authorizeUserId);
router.patch("/:userId", uploadUserImage, processImage, usersControllers.updateOneUser);
router.delete("/:userId", usersControllers.deleteOneUser);
router.patch("/:userId/updatePassword", usersControllers.updatePassword);
router.patch("/:userId/follow/:followId", usersControllers.followUser);
router.get("/:userId/explore", usersControllers.exploreUsers);

module.exports = router;
