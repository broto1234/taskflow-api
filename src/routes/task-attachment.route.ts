import { Router } from 'express';
import { upload } from '../config/multer.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { createTaskAttachment } from '../services/task.service.js';
import { unlink } from 'node:fs/promises';

const taskAttachmentRouter = Router();

taskAttachmentRouter.post(
  '/:taskId/attachments',
  authMiddleware,
  upload.single('file'),
  async (req, res, next) => {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        message: 'File is required',
      });
      return;
    }

    try {
      const attachment = await createTaskAttachment(
        Buffer.from(file.originalname, 'latin1').toString('utf8'),
        file.filename,
        file.mimetype,
        file.size,
        file.path,
        req.userId!,
        Number(req.params.taskId),
        req.userRole!,
      );

      res.status(201).json({
        success: true,
        data: attachment,
      });
    } catch (error) {
      await unlink(file.path).catch(() => {});
      next(error);
    }
  },
);

export default taskAttachmentRouter;