import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';

const storage = multer.diskStorage({
  destination: path.resolve('uploads'),
  filename: (_req, file, cb) => {
    const extensionMap: Record<string, string> = {
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg',
      'image/png': '.png',
    };

    const extension = extensionMap[file.mimetype];

    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error(
        'Only PDF, JPEG, and PNG files are allowed',
      );

      error.name = 'MulterFileTypeError';

      cb(error);
    }
  },
});