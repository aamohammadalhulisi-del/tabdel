import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] || "3001";

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, () => {
  console.log(`SERVER RUNNING ON PORT ${port}`);
});
