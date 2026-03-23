import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { pricesRouter, currencyRouter } from "./routes/prices.js";

const app = new Hono();

app.use("*", cors());

app.route("/api/prices", pricesRouter);
app.route("/api/currency", currencyRouter);

app.get("/api/health", (c) => c.json({ status: "ok" }));

const port = 3001;
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
