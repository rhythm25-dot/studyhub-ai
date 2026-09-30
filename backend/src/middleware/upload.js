const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'webp'];

// A minimal multer storage engine that streams the upload straight to
// Cloudinary using the official v2 SDK's upload_stream API. We used to
// depend on `multer-storage-cloudinary`, but that package's latest
// release only supports cloudinary@1.x as a peer dependency, which
// conflicts with cloudinary@2.x (what the rest of the app uses for the
// AI file-text-extraction flow). Writing this by hand removes the
// conflict entirely and keeps the same req.file.path / req.file.bytes
// shape the rest of the app already expects.
class CloudinaryStorage {
  _handleFile(req, file, callback) {
    const ext = file.originalname.split('.').pop().toLowerCase();

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'studyhub-ai',
        resource_type: 'auto', // lets Cloudinary handle pdf/docx/images correctly
        public_id: `${Date.now()}-${file.fieldname}`,
        format: ext,
      },
      (error, result) => {
        if (error) return callback(error);
        callback(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
          bytes: result.bytes,
          mimetype: file.mimetype,
        });
      }
    );

    file.stream.pipe(uploadStream);
  }

  _removeFile(req, file, callback) {
    if (!file.filename) return callback(null);
    cloudinary.uploader.destroy(file.filename, () => callback(null));
  }
}

function fileFilter(req, file, cb) {
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new ApiError(400, `Unsupported file type: .${ext}`));
  }
  cb(null, true);
}

const upload = multer({
  storage: new CloudinaryStorage(),
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

module.exports = upload;
