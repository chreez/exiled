import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { tattoosRouter } from "./routes/tattoos.js";
import { runegraftsRouter } from "./routes/runegrafts.js";

const app = new Hono();

app.use("*", cors());

app.route("/api/tattoos", tattoosRouter);
app.route("/api/runegrafts", runegraftsRouter);

app.get("/api/health", (c) => c.json({ status: "ok" }));

const port = 3017;
console.log(`Server running on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
