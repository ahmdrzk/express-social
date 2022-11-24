const Comment = require("../models/commentModel");
const OpError = require("../helpers/opError");

/* #1 */
exports.createOneComment = async (req, res, next) => {
  const authorId = req.params.userId;
  const postId = req.params.postId;
  const { content } = req.body.data;

  try {
    const comment = (await Comment.create([{ authorId, postId, content }]))[0];

    res.status(201).json({
      results: 1,
      status: "success",
      data: { comment: comment },
    });
  } catch (error) {
    next(error);
  }
};

/* #2 */
exports.requestAllComments = async (req, res, next) => {
  const postId = req.params.postId;
  const { skip, limit } = req.query;

  try {
    const comments = await Comment.find({ postId })
      .skip(Number(skip))
      .limit(Number(limit) || 10);

    res.status(200).json({
      results: comments.length,
      status: "success",
      data: { comments },
    });
  } catch (error) {
    next(error);
  }
};

/* #3 */
exports.updateOneComment = async (req, res, next) => {
  const authorId = req.params.userId;
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  const { content } = req.body.data;

  try {
    const comment = await Comment.findOne({ _id: commentId, authorId, postId });

    if (!comment)
      return next(
        new OpError(
          404,
          `No comment found with this id '${commentId}' and created by this user id '${authorId}'.`
        )
      );

    comment.set({ content });
    await comment.save();

    res.status(200).json({
      results: 1,
      status: "success",
      data: { comment },
    });
  } catch (error) {
    next(error);
  }
};

/* #4 */
exports.deleteOneComment = async (req, res, next) => {
  const authorId = req.params.userId;
  const postId = req.params.postId;
  const commentId = req.params.commentId;

  try {
    const comment = await Comment.findOne({ _id: commentId, authorId, postId });

    if (!comment)
      return next(
        new OpError(
          404,
          `No comment found with this id '${commentId}' and created by this user id '${authorId}'.`
        )
      );

    await comment.deleteOne();

    res.status(204).json({
      results: 0,
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};
