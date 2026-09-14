import { AwsClient } from "aws4fetch";

export interface Env {
  B2_APPLICATION_KEY_ID: string;
  B2_APPLICATION_KEY: string;
  B2_ENDPOINT: string;
  B2_BUCKET_NAME: string;
  B2_REGION: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Remove leading slash to get the object key
    const objectKey = url.pathname.slice(1);
    
    if (!objectKey) {
      return new Response("Aya Assets CDN Proxy", { status: 200 });
    }

    // Use Cloudflare Edge Cache for maximum speed
    const cache = caches.default;
    // We only cache GET requests
    const isGet = request.method === "GET";
    if (isGet) {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Initialize AWS4Fetch Client with B2 S3 API credentials
    const aws = new AwsClient({
      accessKeyId: env.B2_APPLICATION_KEY_ID,
      secretAccessKey: env.B2_APPLICATION_KEY,
      service: "s3",
      region: env.B2_REGION,
    });

    // Construct the actual S3 API URL for the object
    const s3Url = `https://${env.B2_BUCKET_NAME}.${env.B2_ENDPOINT}/${objectKey}`;

    // Sign the request
    let signedRequest = await aws.sign(s3Url, {
      method: request.method,
      headers: {
        "Cache-Control": "max-age=31536000",
      }
    });

    // Fetch the object from Backblaze B2
    const response = await fetch(signedRequest);

    // If the object isn't found, return a 404
    if (response.status === 404) {
      return new Response("Asset not found", { status: 404 });
    }

    // Forward the B2 response (which contains the binary file and Content-Type)
    // We add CORS headers so the frontend can load images/music smoothly.
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    
    // Ensure aggressive caching on Cloudflare edge and browser
    newHeaders.set("Cache-Control", "public, max-age=31536000, immutable");

    const modifiedResponse = new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });

    // Store the response in the Cloudflare edge cache asynchronously
    if (isGet && response.status === 200) {
      ctx.waitUntil(cache.put(request, modifiedResponse.clone()));
    }

    return modifiedResponse;
  },
};
