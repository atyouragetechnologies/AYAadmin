import { executeVercelHandler } from "./vercel-polyfill";

// Dynamically import all legacy Vercel Serverless Functions to avoid
// Node.js specific initialization errors (like web-push/asn1.js) on Edge environments
const handlers: Record<string, () => Promise<any>> = {
  "/api/check-access": () => import("../app/api/check-access"),
  "/api/create-cashfree-order": () => import("../app/api/create-cashfree-order"),
  "/api/delete-account": () => import("../app/api/delete-account"),
  "/api/generate-analysis": () => import("../app/api/generate-analysis"),
  "/api/push-subscribe": () => import("../app/api/push-subscribe"),
  "/api/recommend-stories": () => import("../app/api/recommend-stories"),
  "/api/recommendations": () => import("../app/api/recommendations"),
  "/api/send-notifications": () => import("../app/api/send-notifications"),
  "/api/set-username": () => import("../app/api/set-username"),
  "/api/subscribe-push": () => import("../app/api/subscribe-push"),
  "/api/verify-cashfree-order": () => import("../app/api/verify-cashfree-order"),
};

export async function handleApiRequest(request: Request, env: any): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Find a matching handler
  const getHandler = handlers[pathname];
  if (getHandler) {
    // Dynamically import the handler module
    const module = await getHandler();
    const handler = module.default || module;
    
    // Execute using the Vercel Polyfill to convert standard Web Request/Response to Vercel syntax
    return await executeVercelHandler(handler, request, env);
  }

  return null; // Not an API request or not found
}
