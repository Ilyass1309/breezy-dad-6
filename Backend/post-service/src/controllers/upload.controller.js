const formidable = require("formidable");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadPostImage = (req, res) => {
  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Erreur de parsing" });
    const file = files.file[0];
    try {
      const upload = await cloudinary.uploader.upload(file.filepath, {
        folder: "breezy_posts",
        format: "webp",
        transformation: [
          { width: 1024, height: 1024, crop: "fill", gravity: "auto" },
        ],
      });
      res.status(200).json({ url: upload.secure_url });
    } catch (e) {
      res.status(500).json({ error: "Erreur d'upload Cloudinary" });
    }
  });
};
