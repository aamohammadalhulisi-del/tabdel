import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import rateLimit from "express-rate-limit";
import connectPgSimple from "connect-pg-simple";
import router from "./routes";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";
import helmet from "helmet";

const PgSession = connectPgSimple(session);

// Require SESSION_SECRET
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}


// Frontend domains
const ALLOWED_ORIGINS = [
  "https://tabdeel-jordan-6tv8wrc4t-tabdel.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];


const app: Express