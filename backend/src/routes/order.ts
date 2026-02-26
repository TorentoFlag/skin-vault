import { Router } from 'express';
import { auth } from '../middleware/auth.ts';
import { validate } from '../middleware/validate.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { createOrderSchema, orderIdParamSchema } from '../schemas/order.ts';
import * as orderController from '../controllers/orderController.ts';

const router = Router();

router.use(auth);

router.post('/', validate(createOrderSchema), asyncHandler(orderController.createOrder));
router.get('/', asyncHandler(orderController.listOrders));
router.get('/:id', validate(orderIdParamSchema, 'params'), asyncHandler(orderController.getOrder));
router.delete('/:id', validate(orderIdParamSchema, 'params'), asyncHandler(orderController.cancelOrder));

export default router;
