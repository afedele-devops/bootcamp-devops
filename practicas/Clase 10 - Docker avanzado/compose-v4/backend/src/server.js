import crypto from "node:crypto";
import express from "express";
import cookieParser from "cookie-parser";
import { createClient } from "redis";

const app = express();

const PORT = Number(process.env.PORT || 3000);
const REDIS_HOST = process.env.REDIS_HOST || "redis";
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret";
const NODE_EV = process.env.NODE_EV || "development";

const redis = createClient({
  url: `redis://${REDIS_HOST}:${REDIS_PORT}`
});

redis.on("error", (error) => {
  console.error("[redis] error", error.message);
});

await redis.connect();

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${elapsedMs.toFixed(2)}ms`);
  });
  next();
});

function buildSessionId() {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${crypto.randomUUID()}-${Date.now()}`)
    .digest("hex")
    .slice(0, 32);
}

function getSessionId(req, res) {
  const fromHeader = req.header("x-session-id");
  const fromCookie = req.cookies.sid;
  const sid = fromHeader || fromCookie;

  if (sid) {
    if (!fromCookie) {
      res.cookie("sid", sid, { httpOnly: true, sameSite: "lax" });
    }
    return sid;
  }

  const generated = buildSessionId();
  res.cookie("sid", generated, { httpOnly: true, sameSite: "lax" });
  return generated;
}

function toPokemonPayload(apiData) {
  const stats = {
    hp: apiData.stats.find((s) => s.stat.name === "hp")?.base_stat ?? null,
    attack: apiData.stats.find((s) => s.stat.name === "attack")?.base_stat ?? null,
    defense: apiData.stats.find((s) => s.stat.name === "defense")?.base_stat ?? null,
    speed: apiData.stats.find((s) => s.stat.name === "speed")?.base_stat ?? null
  };

  return {
    id: apiData.id,
    name: apiData.name,
    image: apiData.sprites?.other?.["official-artwork"]?.front_default || apiData.sprites?.front_default || null,
    types: apiData.types.map((t) => t.type.name),
    stats
  };
}

app.get("/health", async (_req, res) => {
  try {
    await redis.ping();
    res.status(200).json({ ok: true, service: "backend", redis: "up", env: NODE_EV });
  } catch {
    res.status(503).json({ ok: false, service: "backend", redis: "down" });
  }
});

app.get("/api/pokemon/:name", async (req, res) => {
  try {
    const name = req.params.name.trim().toLowerCase();
    if (!name) {
      return res.status(400).json({ error: "Pokemon name is required" });
    }

    const cacheKey = `pokemon:${name}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.json({ source: "cache", data: JSON.parse(cached) });
    }

    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Pokemon '${name}' not found` });
    }

    const pokemon = toPokemonPayload(await response.json());
    await redis.setEx(cacheKey, 60, JSON.stringify(pokemon));

    return res.json({ source: "api", data: pokemon });
  } catch (error) {
    return res.status(500).json({ error: "Unexpected server error", detail: error.message });
  }
});

app.post("/api/session/favorite", async (req, res) => {
  try {
    const sid = getSessionId(req, res);
    const rawName = String(req.body?.name || "").trim().toLowerCase();

    if (!rawName) {
      return res.status(400).json({ error: "Field 'name' is required" });
    }

    const key = `session:${sid}:favorites`;
    await redis.sAdd(key, rawName);
    await redis.expire(key, 60 * 60 * 24);

    const favorites = await redis.sMembers(key);
    return res.status(201).json({ sessionId: sid, favorites: favorites.sort() });
  } catch (error) {
    return res.status(500).json({ error: "Unexpected server error", detail: error.message });
  }
});

app.get("/api/session/favorites", async (req, res) => {
  try {
    const sid = getSessionId(req, res);
    const key = `session:${sid}:favorites`;
    const favorites = await redis.sMembers(key);

    return res.json({ sessionId: sid, favorites: favorites.sort() });
  } catch (error) {
    return res.status(500).json({ error: "Unexpected server error", detail: error.message });
  }
});

app.delete("/api/session/favorites/:name", async (req, res) => {
  try {
    const sid = getSessionId(req, res);
    const name = req.params.name.trim().toLowerCase();

    if (!name) {
      return res.status(400).json({ error: "Pokemon name is required" });
    }

    const key = `session:${sid}:favorites`;
    await redis.sRem(key, name);
    const favorites = await redis.sMembers(key);

    return res.json({ sessionId: sid, favorites: favorites.sort() });
  } catch (error) {
    return res.status(500).json({ error: "Unexpected server error", detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Pokemon backend running on port ${PORT}`);
});
