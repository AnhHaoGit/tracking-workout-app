import * as jose from "jose";
import { JWT_SECRET } from "../constants/constants";
import { AuthUser } from "@/constants/type";

/**
 * Middleware to authenticate API requests using JWT from Authorization header or cookies
 * @param handler The API route handler to be protected
 *
 * Note for devs: Technically, it's not a middleware in the traditional sense. This function acts as a higher-order function that adds authentication to API route handlers.
 */
export function withAuth<T extends Response>(
  handler: (req: Request, user: AuthUser) => Promise<T>,
) {
  return async (req: Request): Promise<T | Response> => {
    try {
      let token: string | null = null;

      // First, try to get token from Authorization header (for native apps)
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      // If no token found in either place, return unauthorized
      if (!token) {
        return Response.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }

      // Verify the JWT token
      const jwtSecret = JWT_SECRET;

      if (!jwtSecret) {
        return Response.json(
          { error: "Server misconfiguration" },
          { status: 500 },
        );
      }

      // Verify and decode the token
      const verified = await jose.jwtVerify(
        token,
        new TextEncoder().encode(jwtSecret), // jose requires you to encode the secret key manually
      );

      const payload = verified.payload as AuthUser & { type?: string };
      if (payload.type !== "access") {
        return Response.json(
          { error: "Access token required" },
          { status: 401 },
        );
      }

      // Call the handler with the authenticated user
      return await handler(req, payload);
    } catch (error) {
      if (error instanceof jose.errors.JWTExpired) {
        console.error("Token expired:", error.reason);
        return Response.json({ error: "Token expired" }, { status: 401 });
      } else if (error instanceof jose.errors.JWTInvalid) {
        console.error("Invalid token:", error.message);
        return Response.json({ error: "Invalid token" }, { status: 401 });
      } else {
        console.error("Auth error:", error);
        return Response.json(
          { error: "Authentication failed" },
          { status: 500 },
        );
      }
    }
  };
}
