import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const folder = req.body.folder || 'user_uploads';
    return {
      folder: folder,
      resource_type: 'auto',
      public_id: `${file.fieldname}-${Date.now()}`,
    };
  },
});

const upload = multer({ storage });

export default upload;
