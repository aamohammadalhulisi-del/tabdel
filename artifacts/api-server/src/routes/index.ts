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


// Health
router.use(healthRouter);


// Auth
router.use(authRouter);


// Users
router.use(usersRouter);


// Categories
router.use(categoriesRouter);


// Listings
router.use(listingsRouter);


// Swap Requests
router.use(swapRequestsRouter);


// Messages
router.use(messagesRouter);


// Ratings
router.use(ratingsRouter);


// Reports
router.use(reportsRouter);


// Notifications
router.use(notificationsRouter);


// Upload
router.use(uploadRouter);


// Admin
router.use(adminRouter);


export default router;