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

router.use("/api", healthRouter);
router.use("/api", authRouter);
router.use("/api", usersRouter);
router.use("/api", categoriesRouter);
router.use("/api", listingsRouter);
router.use("/api", swapRequestsRouter);
router.use("/api", messagesRouter);
router.use("/api", ratingsRouter);
router.use("/api", reportsRouter);
router.use("/api", notificationsRouter);
router.use("/api", uploadRouter);
router.use("/api", adminRouter);

export default router;