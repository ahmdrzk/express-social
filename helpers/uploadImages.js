const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const OpError = require("./opError");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multerFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new OpError(400, "Image files are only allowed for upload"), false);
  }
};

const userImagesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "express_social/users/",
    public_id: (req, file) => `user-${req.params.userId}`,
  },
});

const postImagesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "express_social/posts/",
  },
});

const multerUserImage = multer({ storage: userImagesStorage, fileFilter: multerFileFilter });
const multerPostImage = multer({ storage: postImagesStorage, fileFilter: multerFileFilter });

exports.uploadPostImage = multerPostImage.single("image");
exports.uploadUserImage = multerUserImage.single("image");

exports.processImage = (req, res, next) => {
  if (!req.file) return next();

  req.body.image = req.file.path;

  next();
};

exports.deleteImage = function (publicId) {
  cloudinary.uploader.destroy(publicId);
};
