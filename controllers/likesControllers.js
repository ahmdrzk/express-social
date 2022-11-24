const Like = require("../models/likeModel");

/* #1 */
exports.createPostLike = async (req, res, next) => {
  if (req.params.commentId) return next();

  const authorId = req.params.userId;
  const postId = req.params.postId;

  try {
    const isLiked = await Like.findOne({ authorId, documentId: postId });

    if (!isLiked) {
      await Like.create([{ authorId, documentId: postId, onModel: "Post" }]);
    } else {
      await Like.deleteOne({ authorId, documentId: postId });
    }

    const likesCount = await Like.countDocuments({ documentId: postId });

    res.status(201).json({
      results: 1,
      status: "success",
      data: { likesCount },
    });
  } catch (error) {
    next(error);
  }
};

/* #2 */
exports.createCommentLike = async (req, res, next) => {
  const authorId = req.params.userId;
  const commentId = req.params.commentId;

  try {
    const isLiked = await Like.findOne({ authorId, documentId: commentId });

    if (!isLiked) {
      await Like.create([{ authorId, documentId: commentId, onModel: "Comment" }]);
    } else {
      await Like.deleteOne({ authorId, documentId: commentId });
    }

    const likesCount = await Like.countDocuments({ documentId: commentId });

    res.status(201).json({
      results: 1,
      status: "success",
      data: { likesCount },
    });
  } catch (error) {
    next(error);
  }
};
