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
  throw new Error("SESSION_SECRET environment variable is required");
}


const ALLOWED_ORIGINS = [
  "https://tabdeel-jordan-i73m5g5q6-tabdel.vercel.app",
  "https://tabdeel-jordan-6tv8wrc4t-tabdel.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];


const app: Express = express();


// Railway proxy
app.set("trust proxy", 1);


// Security
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);


// CORS لازم يكون قبل الراوتس
app.use(
  cors({
    origin: function (origin, callback) {

      // يسمح للطلبات بدون origin
      if (!origin) {
        return callback(null, true);
      }


      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }


      console.log("Blocked CORS:", origin);

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


// Body parser
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


// Logger
app.use(
  pinoHttp({
    logger,

    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
        };
      },

      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  })
);


// Rate limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);


// Session
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

      maxAge:
        30 *
        24 *
        60 *
        60 *
        1000,
    },

  })
);



// Routes
app.use(router);


// اختبار السيرفر
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Tabdeel API running"
  });
});


// 404
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path
  });
});


// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {

    console.error(err);

    res.status(500).json({
      error: "Internal server error"
    });

  }
);


export default app;