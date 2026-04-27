import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../../middleware/auth.middleware';
import * as AttachmentsController from './attachments.controller';

const router = Router();
// Store file entirely in memory — buffer is written to PostgreSQL bytea
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB hard limit at the transport layer
});

router.use(authMiddleware);

router.get('/attachments', AttachmentsController.listAllAttachments);

/**
 * @openapi
 * /api/v1/leads/{id}/attachments:
 *   post:
 *     tags: [Attachments]
 *     summary: Upload a file attachment for a lead
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Uploaded
 */
router.post('/leads/:id/attachments', upload.single('file'), AttachmentsController.uploadAttachment);
router.post('/clients/:id/attachments', upload.single('file'), AttachmentsController.uploadClientAttachment);
router.post('/invoices/:id/attachments', upload.single('file'), AttachmentsController.uploadInvoiceAttachment);

/**
 * @openapi
 * /api/v1/leads/{id}/attachments:
 *   get:
 *     tags: [Attachments]
 *     summary: List attachments for a lead (metadata only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/leads/:id/attachments', AttachmentsController.listAttachments);
router.get('/clients/:id/attachments', AttachmentsController.listClientAttachments);

/**
 * @openapi
 * /api/v1/attachments/{attachmentId}/download:
 *   get:
 *     tags: [Attachments]
 *     summary: Download an attachment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Binary file
 */
router.get('/attachments/:attachmentId/download', AttachmentsController.downloadAttachment);

/**
 * @openapi
 * /api/v1/attachments/{attachmentId}:
 *   delete:
 *     tags: [Attachments]
 *     summary: Delete an attachment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/attachments/:attachmentId', AttachmentsController.deleteAttachment);

export default router;
