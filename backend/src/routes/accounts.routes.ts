import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createAccountHandler,
  getAccountsHandler,
  updateAccountHandler,
  deleteAccountHandler,
  setDefaultAccountHandler,
} from '../controllers/accounts.controller';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(requireAuth);

router.get('/', getAccountsHandler);
router.post('/', createAccountHandler);
router.put('/:id', updateAccountHandler);
router.delete('/:id', deleteAccountHandler);
router.patch('/:id/default', setDefaultAccountHandler);

export default router;