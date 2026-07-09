import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import categoriesRouter from "./categories";
import listingsRouter from "./listings";
import swapRequestsRouter from "./swapRequests";
import messagesRouter from "./messages";
import ratingsRouter from "./ratings";
import reportsRouter from "./reports";
import notificationsRouter from "./notifications";
import uploadRouter from "./upload";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(categoriesRouter);
router.use(listingsRouter);
router.use(swapRequestsRouter);
router.use(messagesRouter);
router.use(ratingsRouter);
router.use(reportsRouter);
router.use(notificationsRouter);
router.use(uploadRouter);
router.use(adminRouter);

export default router;
