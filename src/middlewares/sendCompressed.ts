import type { Request, Response } from "../../deps.ts";
import { deflate, gzip } from "https://deno.land/x/compress@v0.3.6/mod.ts";

const encoder = new TextEncoder();

const threshold = 1024;

export function sendCompressed(req: Request, res: Response, body: string) {
  res.vary("Accept-Encoding");

  const bytes = encoder.encode(body);

  // length below threshold
  if (bytes.byteLength < threshold) {
    return res.send(body);
  }

  const encoding = res.get("Content-Encoding") || "identity";

  // already encoded
  if (encoding !== "identity") {
    return res.send(body);
  }

  // head
  if (req.method === "HEAD") {
    return res.send(body);
  }

  let method = req.acceptsEncodings(["gzip", "deflate", "identity"]);

  // we really don't prefer deflate
  if (method === "deflate" && req.acceptsEncodings(["gzip"])) {
    method = req.acceptsEncodings(["gzip", "identity"]);
  }

  // negotiation failed
  if (!method || method === "identity") {
    return res.send(body);
  }

  const compressed = method === "gzip" ? gzip(bytes) : deflate(bytes);

  return res.set("Content-Encoding", method).send(compressed);
}
