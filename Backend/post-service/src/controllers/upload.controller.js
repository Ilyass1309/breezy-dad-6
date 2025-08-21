const formidable = require("formidable");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: "dfmfacomp",
  api_key: "119457589759245",
  api_secret: "3QNYjaQNmwie4w4c0SAHpXpg8Hw",
});

exports.uploadPostImage = (req, res) => {
  console.log("[UPLOAD] Reçu une requête d'upload d'image de post");
  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("[UPLOAD] Erreur de parsing formidable:", err);
      return res.status(500).json({ error: "Erreur de parsing" });
    }
    if (!files.file || !files.file[0]) {
      console.error("[UPLOAD] Aucun fichier reçu dans la requête");
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }
    const file = files.file[0];
    console.log("[UPLOAD] Fichier reçu:", file.originalFilename, file.mimetype, file.size, file.filepath);
    try {
      console.log("[UPLOAD] Tentative d'upload sur Cloudinary...");
      const upload = await cloudinary.uploader.upload(file.filepath, {
        folder: "breezy_posts",
        format: "webp",
        transformation: [
          { width: 1024, height: 1024, crop: "fill", gravity: "auto" },
        ],
      });
      console.log("[UPLOAD] Succès Cloudinary:", upload.secure_url);
      res.status(200).json({ url: upload.secure_url });
    } catch (e) {
      console.error("[UPLOAD] Erreur Cloudinary:", e);
      res.status(500).json({ error: "Erreur d'upload Cloudinary", details: e.message });
    }
  });
};
