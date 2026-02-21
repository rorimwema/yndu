import { Router } from '../../deps.ts';
import * as handlers from './handlers.ts';
import * as validators from './validators.ts';

const router = new Router();

router.get('/', handlers.getSubscriptions);
router.get('/:id', handlers.getSubscriptionById);
router.post('/', validators.createSubscriptionValidator, handlers.createSubscription);
router.put('/:id/pause', handlers.pauseSubscription);
router.put('/:id/resume', handlers.resumeSubscription);
router.put('/:id/cancel', handlers.cancelSubscription);
router.put('/:id/modify', handlers.modifySubscription);
router.post('/:id/generate-order', handlers.generateOrderFromSubscription);
router.post('/:id/renew', handlers.renewSubscription);

export default router;
