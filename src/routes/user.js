import express from 'express';
import multer from 'multer';
import * as userController from '../controllers/user.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/generate', userController.generate);
router.post('/batch', upload.single('file'), userController.batch);

router.get('/me', requireAuth, userController.me);
router.get('/:username', requireAuth, userController.getByUsername);

export default router;
