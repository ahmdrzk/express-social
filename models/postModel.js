const mongoose = require("mongoose");

const Comment = require("./commentModel");
const Like = require("./likeModel");
const { deleteImage } = require("../helpers/uploadImages");

const postSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "AuthorId field is required."],
  },
  content: {
    type: String,
    required: [true, "Content field is required."],
    trim: true,
    minLength: [1, "Content field has to be more than or equal to 1 character."],
    maxlength: [450, "Content field has to be less than or equal to 450 characters."],
  },
  image: {
    type: String,
  },
});

postSchema.virtual("commentsPreview", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
  options: { sort: { createdAt: -1 }, limit: 5 },
});

postSchema.virtual("commentsCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
  count: true,
});

postSchema.virtual("likesCount", {
  ref: "Like",
  localField: "_id",
  foreignField: "documentId",
  count: true,
});

postSchema.pre(/^find/, function (next) {
  this.sort("-createdAt")
    .populate("authorId")
    .populate("commentsPreview")
    .populate("commentsCount")
    .populate("likesCount");

  next();
});

postSchema.pre("deleteOne", { document: true }, async function (next) {
  try {
    if (this.image) {
      const urlArr = this.image.split("/");

      const publicId = `express-social/posts/${urlArr[urlArr.length - 1].split(".")[0]}`;

      deleteImage(publicId);
    }

    if (this.commentsCount !== 0) {
      const comments = await Comment.find({ postId: this._id }).select("_id").lean();

      await Like.deleteMany({ documentId: { $in: [...comments] } });

      await Comment.deleteMany({ postId: this._id });
    }

    if (this.likesCount !== 0) await Like.deleteMany({ documentId: this._id });
  } catch (error) {
    return next(error);
  }
  next();
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
