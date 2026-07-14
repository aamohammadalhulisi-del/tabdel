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
  "https://tabdeel-jordan-i73m5g5q6-tabdel.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
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


// Rate limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
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
          url: req.url?.split("?")[0],
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


// CORS
app.use(
  cors({
    origin(origin, callback) {

      // allow curl / backend requests
      if (!origin) {
        return callback(null, true);
      }


      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }


      return callback(
        new Error(`CORS blocked: ${origin}`)
      );
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
  })
);



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
      domain: undefined,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  }),
);

export default app;