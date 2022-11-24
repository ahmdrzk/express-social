const mongoose = require("mongoose");

const Like = require("./likeModel");

const commentSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "AuthorId field is required."],
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: [true, "PostId field is required."],
  },
  content: {
    type: String,
    required: [true, "Content field is required."],
    trim: true,
    minLength: [1, "Content field has to be more than or equal to 1 character."],
    maxlength: [450, "Content field has to be less than or equal to 450 characters."],
  },
});

commentSchema.virtual("likesCount", {
  ref: "Like",
  localField: "_id",
  foreignField: "documentId",
  count: true,
});

commentSchema.pre(/^find/, function (next) {
  this.sort("-createdAt").populate("authorId").populate("likesCount");

  next();
});

commentSchema.pre("deleteOne", { document: true }, async function (next) {
  if (this.likesCount !== 0) await Like.deleteMany({ documentId: this._id });

  next();
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
