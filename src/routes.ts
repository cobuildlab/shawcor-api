import express from 'express';
const router = express.Router();

import {
  statusApi,
  statusInvoiceController,
  syncInvoiceController,
} from './modules/invoices/invoices-controllers';

router.get('/status', statusApi);
router.get('/status-invoice', statusInvoiceController);
router.post('/sync-invoice', syncInvoiceController);

router
  .route('*')
  .all((req, res) => res.status(404).json({ message: 'Not found' }));

export default router;
