import { APP_SCHEME, BASE_URL } from "../../../constants/constants";

export async function GET(request: Request) {
  const incomingParams = new URLSearchParams(request.url.split("?")[1]);
  const combinedPlatformAndState = incomingParams.get("state");
  if (!combinedPlatformAndState) {
    return Response.json({ error: "Invalid state" }, { status: 400 });
  }

  const [platform, state] = combinedPlatformAndState.split("|");
  if (!platform || !state) {
    return Response.json({ error: "Invalid state format" }, { status: 400 });
  }

  const code = incomingParams.get("code");
  if (!code) {
    return Response.json(
      { error: "Missing authorization code" },
      { status: 400 },
    );
  }

  const outgoingParams = new URLSearchParams({
    code,
    state,
  });

  return Response.redirect(APP_SCHEME + "?" + outgoingParams.toString());
}
