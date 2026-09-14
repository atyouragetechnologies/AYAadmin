export class VercelResponsePolyfill {
  statusCode: number = 200;
  headers = new Headers();
  bodyData: any = null;
  resolved: boolean = false;
  resolvePromise: (res: Response) => void;

  constructor(resolvePromise: (res: Response) => void) {
    this.resolvePromise = resolvePromise;
  }

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  setHeader(key: string, value: string) {
    this.headers.set(key, value);
    return this;
  }

  json(data: any) {
    this.headers.set("content-type", "application/json");
    this.bodyData = JSON.stringify(data);
    this.sendResponse();
    return this;
  }

  send(data: any) {
    if (typeof data === "object") {
      return this.json(data);
    }
    this.bodyData = String(data);
    this.sendResponse();
    return this;
  }

  end(data?: any) {
    if (data !== undefined) {
      this.bodyData = String(data);
    }
    this.sendResponse();
    return this;
  }

  private sendResponse() {
    if (this.resolved) return;
    this.resolved = true;
    this.resolvePromise(
      new Response(this.bodyData, {
        status: this.statusCode,
        headers: this.headers,
      })
    );
  }
}

export async function createVercelRequest(request: Request, env: any) {
  const url = new URL(request.url);
  
  let body = {};
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }

  const query: Record<string, string | string[]> = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (query[key]) {
      if (Array.isArray(query[key])) {
        (query[key] as string[]).push(value);
      } else {
        query[key] = [query[key] as string, value];
      }
    } else {
      query[key] = value;
    }
  }

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    method: request.method,
    url: request.url,
    query,
    body,
    headers,
    env // Pass Cloudflare env here so functions can read it if they check req.env
  };
}

export function executeVercelHandler(handler: Function, request: Request, env: any): Promise<Response> {
  return new Promise(async (resolve, reject) => {
    try {
      const vReq = await createVercelRequest(request, env);
      
      // Polyfill process.env for Cloudflare Workers environment
      if (typeof globalThis.process === "undefined") {
        (globalThis as any).process = { env: {} };
      }
      Object.assign(globalThis.process.env, env);

      const vRes = new VercelResponsePolyfill(resolve);
      
      await handler(vReq, vRes);
      
      // If the handler completes but never calls res.json() or res.send(),
      // we need a fallback timeout so it doesn't hang forever.
      setTimeout(() => {
        if (!vRes.resolved) {
          console.warn(`[VercelPolyfill] Handler for ${request.url} did not send a response.`);
          vRes.status(500).json({ error: "Handler timed out or did not return a response" });
        }
      }, 10000); // 10s timeout
    } catch (err: any) {
      console.error("[VercelPolyfill Error]:", err);
      resolve(
        new Response(JSON.stringify({ error: "Internal Server Error", details: err.message }), {
          status: 500,
          headers: { "content-type": "application/json" }
        })
      );
    }
  });
}
