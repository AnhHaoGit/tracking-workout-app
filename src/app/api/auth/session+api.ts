import * as jose from "jose";
import { COOKIE_NAME, JWT_SECRET } from "../../../constants/constants";

export async function GET(request: Request) {
  try {
    // Get the cookie from the request
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Parse cookies and their attributes
    // Convert the cookie string into a structured object
    const cookies: Record<string, Record<string, string>> = {};

    cookieHeader.split(";").forEach((cookie) => {
      const trimmedCookie = cookie.trim();

      // Check if this is a cookie-value pair or an attribute
      if (trimmedCookie.includes("=")) {
        const [key, value] = trimmedCookie.split("=");
        const cookieName = key.trim();

        // Initialize the cookie entry if it doesn't exist
        if (!cookies[cookieName]) {
          cookies[cookieName] = { value: value };
        } else {
          cookies[cookieName].value = value;
        }
      } else if (trimmedCookie.toLowerCase() === "httponly") {
        // Handle HttpOnly attribute
        const lastCookieName = Object.keys(cookies).pop();
        if (lastCookieName) {
          cookies[lastCookieName].httpOnly = "true";
        }
      } else if (trimmedCookie.toLowerCase().startsWith("expires=")) {
        // Handle Expires attribute
        const lastCookieName = Object.keys(cookies).pop();
        if (lastCookieName) {
          cookies[lastCookieName].expires = trimmedCookie.substring(8);
        }
      } else if (trimmedCookie.toLowerCase().startsWith("max-age=")) {
        // Handle Max-Age attribute
        const lastCookieName = Object.keys(cookies).pop();
        if (lastCookieName) {
          cookies[lastCookieName].maxAge = trimmedCookie.substring(8);
        }
      }
    });

    // Get the auth token from cookies
    if (!cookies[COOKIE_NAME] || !cookies[COOKIE_NAME].value) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const token = cookies[COOKIE_NAME].value;

    try {
      // Verify the token
      const verified = await jose.jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET),
      );

      // Calculate cookie expiration time from the verified token payload
      const cookieExpiration =
        typeof verified.payload.exp === "number" ? verified.payload.exp : null;

      // Return the user data from the token payload along with expiration info
      return Response.json({
        ...verified.payload,
        cookieExpiration,
      });
    } catch (error) {
      // Token is invalid or expired
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Session error:", error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
