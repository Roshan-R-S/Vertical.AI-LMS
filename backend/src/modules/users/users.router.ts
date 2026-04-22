import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';
import * as UsersController from './users.controller';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params['id']}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

router.use(authMiddleware);

router.use((req, res, next) => {
  console.log(`[UsersRouter] Entering: ${req.method} ${req.path}`);
  next();
});

// Allow any authenticated user to update their own avatar
router.post('/:id/avatar', upload.single('avatar'), UsersController.uploadAvatar);

router.use(roleMiddleware(['SUPER_ADMIN', 'SALES_HEAD']));

router.get('/', UsersController.getAllUsers);
router.post('/', upload.single('avatar'), UsersController.createUser);
router.get('/:id', UsersController.getUserById);
router.put('/:id', upload.single('avatar'), UsersController.updateUser);
router.delete('/:id', UsersController.deleteUser);
router.patch('/:id/toggle-active', UsersController.toggleUserActive);

export default router;
