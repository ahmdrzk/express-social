const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "AuthorId field is required."],
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "onModel",
    required: [true, "DocumentId field is required."],
  },
  onModel: {
    type: String,
    required: true,
    enum: ["Post", "Comment"],
  },
});

const Like = mongoose.model("Like", likeSchema);

module.exports = Like;
