import * as jose from "jose";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  JWT_EXPIRATION_TIME,
  JWT_SECRET,
  REFRESH_TOKEN_EXPIRY,
} from "../../../constants/constants";
import { connectToDatabase } from "../../../utils/connect-db";

const GOOGLE_JWKS = jose.createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

export async function POST(request: Request) {
  const body = (await request.formData()) as any;
  const code = body.get("code") as string;

  if (!code) {
    return Response.json(
      { error: "Missing authorization code" },
      { status: 400 },
    );
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
      code: code,
    }),
  });

  const data = await response.json();
  if (data.error) {
    return Response.json(
      {
        error: data.error,
        error_description: data.error_description,
        message:
          "OAuth validation error - please ensure the app complies with Google's OAuth 2.0 policy",
      },
      {
        status: 400,
      },
    );
  }

  if (!data.id_token) {
    return Response.json(
      { error: "Missing required parameters" },
      { status: 400 },
    );
  }

  let userInfo: Record<string, unknown>;
  try {
    const verified = await jose.jwtVerify(data.id_token, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: GOOGLE_CLIENT_ID,
    });
    userInfo = verified.payload as Record<string, unknown>;
  } catch (error) {
    return Response.json({ error: "Invalid ID token" }, { status: 401 });
  }

  // Create a new object without the exp property from the original token
  const { exp, ...userInfoWithoutExp } = userInfo as any;

  // User id
  const sub = (userInfo as { sub: string }).sub;

  // Current timestamp in seconds
  const issuedAt = Math.floor(Date.now() / 1000);

  // Generate a unique jti (JWT ID) for the refresh token
  const jti = crypto.randomUUID();

  if (!JWT_SECRET) {
    return Response.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  const jwtSecretBytes = new TextEncoder().encode(JWT_SECRET);

  // Create access token (short-lived)
  const accessToken = await new jose.SignJWT({
    ...userInfoWithoutExp,
    type: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRATION_TIME)
    .setSubject(sub)
    .setIssuedAt(issuedAt)
    .sign(jwtSecretBytes);

  // const refreshToken = await new jose.SignJWT({
  //   sub,
  //   jti, // Include a unique ID for this refresh token
  //   type: "refresh",
  //   // Include all user information in the refresh token
  //   // This ensures we have the data when refreshing tokens
  //   name: (userInfo as any).name,
  //   email: (userInfo as any).email,
  //   picture: (userInfo as any).picture,
  //   given_name: (userInfo as any).given_name,
  //   family_name: (userInfo as any).family_name,
  //   email_verified: (userInfo as any).email_verified,
  // })
  //   .setProtectedHeader({ alg: "HS256" })
  //   .setExpirationTime(REFRESH_TOKEN_EXPIRY)
  //   .setIssuedAt(issuedAt)
  //   .sign(new TextEncoder().encode(JWT_SECRET));

  const db = await connectToDatabase();
  const usersCollection = db.collection("users");
  const decoded = jose.decodeJwt(accessToken);

  try {
    const existingUser = await usersCollection.findOne({ sub: decoded.sub });

    if (!existingUser) {
      const newUser = {
        sub: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        given_name: decoded.given_name,
        family_name: decoded.family_name,
        iat: decoded.iat,
        exp: decoded.exp,
      };
      await usersCollection.insertOne(newUser);
    } else {
      usersCollection.updateOne(
        { sub: decoded.sub },
        { $set: { iat: decoded.iat, exp: decoded.exp } },
      );
    }
  } catch (e) {
    console.error("Error creating user:", e);
    return Response.json({ error: "Cannot save user's data" }, { status: 500 });
  }

  return Response.json({
    accessToken,
    // refreshToken,
  });
}
