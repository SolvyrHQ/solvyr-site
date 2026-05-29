import { createServer } from "http";
import { createRequire } from "module";
import { extname, join, normalize, resolve } from "path";
import { readFile } from "fs/promises";

const require = createRequire(import.meta.url);
const agentHandler = require("../api/agent.js");
const root = resolve(process.cwd());
const port = Number(process.env.PORT || 8765);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".yaml": "text/yaml; charset=utf-8"
};

function safePath(urlPath) {
  const pathname = decodeURIComponent(new URL(urlPath, "http://localhost").pathname);
  const normalized = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const relative = normalized === "/" ? "index.html" : normalized.replace(/^[/\\]/, "");
  const fullPath = join(root, relative.endsWith("/") ? `${relative}index.html` : relative);
  return fullPath.startsWith(root) ? fullPath : null;
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (pathname === "/api/agent") {
    await agentHandler(req, res);
    return;
  }

  const filePath = safePath(req.url || "/");
  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": types[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Solvyr agent dev server: http://127.0.0.1:${port}/agent.html`);
  if (!process.env.OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY is not set; /api/agent will use the safe local fallback.");
  }
});
