import express from 'express';
const router = express.Router();

import {
  statusApi,
  syncInvoiceToEnverus,
} from './modules/invoices/invoices-controllers';

router.get('/status', statusApi);
router.post('/sync-invoice', syncInvoiceToEnverus);

router
  .route('*')
  .all((req, res) => res.status(404).json({ message: 'Not found' }));

export default router;
