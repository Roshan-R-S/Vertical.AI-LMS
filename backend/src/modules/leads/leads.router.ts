import { Router } from 'express';
import * as LeadsController from './leads.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/v1/leads:
 *   get:
 *     tags: [Leads]
 *     summary: Get all leads with filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', LeadsController.getLeads);
router.get('/activities', LeadsController.getAllActivities);

/**
 * @openapi
 * /api/v1/leads:
 *   post:
 *     tags: [Leads]
 *     summary: Create a new lead
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone]
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               companyName: { type: string }
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', LeadsController.createLead);
router.post('/bulk', LeadsController.bulkCreate);

/**
 * @openapi
 * /api/v1/leads/{id}:
 *   get:
 *     tags: [Leads]
 *     summary: Get lead by ID
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
 *       404:
 *         description: Not Found
 */
router.get('/:id', LeadsController.getLeadById);

/**
 * @openapi
 * /api/v1/leads/{id}:
 *   put:
 *     tags: [Leads]
 *     summary: Update lead details
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
router.put('/:id', LeadsController.updateLead);

/**
 * @openapi
 * /api/v1/leads/{id}:
 *   delete:
 *     tags: [Leads]
 *     summary: Delete a lead
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
router.delete('/:id', LeadsController.deleteLead);

/**
 * @openapi
 * /api/v1/leads/{id}/stage:
 *   patch:
 *     tags: [Leads]
 *     summary: Update lead stage
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
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stage]
 *             properties:
 *               stage: { type: string }
 *               remarks: { type: string }
 *     responses:
 *       200:
 *         description: Success
 */
router.patch('/:id/stage', LeadsController.updateStage);

/**
 * @openapi
 * /api/v1/leads/{id}/activities:
 *   get:
 *     tags: [Leads]
 *     summary: Get activities for a lead
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
router.get('/:id/activities', LeadsController.getActivities);

/**
 * @openapi
 * /api/v1/leads/{id}/activities:
 *   post:
 *     tags: [Leads]
 *     summary: Add activity to a lead
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
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, content]
 *             properties:
 *               type: { type: string }
 *               content: { type: string }
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/:id/activities', LeadsController.addActivity);

export default router;
