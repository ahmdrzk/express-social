const Post = require("../models/postModel");
const User = require("../models/userModel");
const OpError = require("../helpers/opError");

/* #1 */
exports.createOnePost = async (req, res, next) => {
  const authorId = req.params.userId;
  const reqData = req.body;
  if (reqData.image === "undefined") delete reqData.image;

  try {
    const post = (await Post.create([{ authorId, ...reqData }]))[0];

    res.status(201).json({
      results: 1,
      status: "success",
      data: { post: post },
    });
  } catch (error) {
    next(error);
  }
};

/* #2 */
exports.requestAllPosts = async (req, res, next) => {
  const authorId = req.params.userId;
  const { skip, limit } = req.query;

  try {
    const posts = await Post.find({ authorId })
      .skip(Number(skip))
      .limit(Number(limit) || 10);

    res.status(200).json({
      results: posts.length,
      status: "success",
      data: { posts },
    });
  } catch (error) {
    next(error);
  }
};

/* #3 */
exports.requestOnePost = async (req, res, next) => {
  const authorId = req.params.userId;
  const postId = req.params.postId;

  try {
    const post = await Post.findOne({ _id: postId, authorId });

    if (!post)
      return next(
        new OpError(404, `No post found with this id '${postId}' and created by this user id '${authorId}'.`)
      );

    res.status(200).json({
      results: 1,
      status: "success",
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

/* #4 */
exports.updateOnePost = async (req, res, next) => {
  const authorId = req.params.userId;
  const postId = req.params.postId;
  const { content } = req.body.data;

  try {
    const post = await Post.findOne({ _id: postId, authorId });

    if (!post)
      return next(
        new OpError(404, `No post found with this id '${postId}' and created by this user id '${authorId}'.`)
      );

    post.set({ content });
    await post.save();

    res.status(200).json({
      results: 1,
      status: "success",
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

/* #5 */
exports.deleteOnePost = async (req, res, next) => {
  const authorId = req.params.userId;
  const postId = req.params.postId;

  try {
    const post = await Post.findOne({ _id: postId, authorId });

    if (!post) {
      return next(
        new OpError(404, `No post found with this id '${postId}' and created by this user id '${authorId}'.`)
      );
    }

    await post.deleteOne();

    res.status(204).json({
      results: 0,
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};

/* #6 */
exports.requestHomeFeed = async (req, res, next) => {
  const userId = req.params.userId;
  const { skip, limit } = req.query;

  try {
    const user = await User.findOne({ _id: userId });

    const posts = await Post.find({ authorId: { $in: [...user.following] } })
      .skip(Number(skip))
      .limit(Number(limit) || 10);

    res.status(200).json({
      results: posts.length,
      status: "success",
      data: { posts },
    });
  } catch (error) {
    next(error);
  }
};
