import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import rateLimit from "express-rate-limit";
import connectPgSimple from "connect-pg-simple";
import helmet from "helmet";

import router from "./routes";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";


const PgSession = connectPgSimple(session);


const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing");
}


const app: Express = express();


app.set("trust proxy", 1);


// =====================
// CORS
// =====================

const ALLOWED_ORIGINS = [
  "https://tabdeel-jordan-i73m5g5q6-tabdel.vercel.app",
  "https://tabdeel-jordan-6tv8wrc4t-tabdel.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];


app.use(
  cors({
    origin(origin, callback) {

      if (!origin) {
        return callback(null, true);
      }


      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }


      console.log("CORS BLOCKED:", origin);

      return callback(null, false);
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);


// مهم للـ preflight
app.options("*", cors());


// =====================
// Security
// =====================

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);


// =====================
// Body
// =====================

app.use(
  express.json({
    limit: "20mb",
  })
);


app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  })
);


// =====================
// Session
// =====================

app.use(
  session({

    store: new PgSession({
      pool,
      tableName: "sessions",
      createTableIfMissing: true,
    }),

    secret: SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    proxy: true,

    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },

  })
);


// =====================
// Logs
// =====================

app.use(
  pinoHttp({
    logger,
  })
);


// =====================
// Rate Limit
// =====================

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);


// =====================
// Routes
// =====================

app.use("/api", router);


// Test
app.get("/api/test", (req, res) => {
  res.json({
    ok: true,
    message: "API working",
  });
});


export default app;