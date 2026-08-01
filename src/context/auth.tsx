import {
  AuthError,
  AuthRequestConfig,
  DiscoveryDocument,
  makeRedirectUri,
  useAuthRequest,
} from "expo-auth-session";
import { useRouter } from "expo-router";
import * as jose from "jose";
import * as React from "react";
import { BASE_URL, TOKEN_KEY_NAME } from "../constants/constants";
import { tokenCache } from "../utils/cache";
import { AuthUser } from "@/constants/type";
import showToast from "@/utils/toast";

const AuthContext = React.createContext({
  user: null as AuthUser | null,
  signIn: () => {},
  signOut: () => {},
  fetchWithAuth: (url: string, options: RequestInit) =>
    Promise.resolve(new Response()),
  isLoading: false,
  error: null as AuthError | null,
});

const config: AuthRequestConfig = {
  clientId: "google",
  scopes: ["openid", "profile", "email"],
  redirectUri: makeRedirectUri(),
};

const discovery: DiscoveryDocument = {
  authorizationEndpoint: `${BASE_URL}/api/auth/authorize`,
  tokenEndpoint: `${BASE_URL}/api/auth/token`,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<AuthError | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  // const [refreshToken, setRefreshToken] = React.useState<string | null>(null);
  const router = useRouter();

  const [request, response, promptAsync] = useAuthRequest(config, discovery);

  React.useEffect(() => {
    const restoreSession = async () => {
      setIsLoading(true);
      try {
        const storedAccessToken = await tokenCache?.getToken(TOKEN_KEY_NAME);

        if (storedAccessToken) {
          try {
            const decoded = jose.decodeJwt(storedAccessToken);
            const exp = (decoded as any).exp;
            const now = Math.floor(Date.now() / 1000);

            if (exp && exp > now) {
              console.log("Access token is still valid, using it");
              setAccessToken(storedAccessToken);
              setUser(decoded as AuthUser);
              router.replace("/(protected)/(tabs)/(home)");
            } else {
              setUser(null);
              tokenCache?.deleteToken(TOKEN_KEY_NAME);
            }
          } catch (e) {
            console.error("Error decoding stored token:", e);
          }
        } else {
          console.log("User is not authenticated");
        }
      } catch (error) {
        console.error("Error restoring session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [router]);

  React.useEffect(() => {
    handleResponse();
  }, [response]);

  const handleResponse = async () => {
    if (response?.type === "success") {
      const { code } = response.params;

      try {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("code", code);

        if (request?.codeVerifier) {
          formData.append("code_verifier", request.codeVerifier);
        } else {
          console.warn("No code verifier found in request object");
        }

        const tokenResponse = await fetch(`${BASE_URL}/api/auth/token`, {
          method: "POST",
          body: formData,
          credentials: "same-origin",
        });

        if (!tokenResponse.ok) {
          throw new Error(
            `Token exchange failed with status ${tokenResponse.status}`,
          );
        }

        const token = await tokenResponse.json();

        if (!token.accessToken) {
          throw new Error("No access token returned from server");
        }

        const accessToken = token.accessToken;
        setAccessToken(accessToken);

        await tokenCache?.saveToken(TOKEN_KEY_NAME, accessToken);

        const decoded = jose.decodeJwt(accessToken);

        setUser(decoded as AuthUser);
        router.replace("/(protected)/(tabs)/(home)");
      } catch (e) {
        console.error("Error handling auth response:", e);
        showToast("errorToast", "Cannot sign you in. Try again later.");
      } finally {
        setIsLoading(false);
      }
    } else if (response?.type === "error") {
      setError(response.error as AuthError);
      showToast("errorToast", "Cannot sign you in. Try again later.");
    }
  };

  const signIn = React.useCallback(async () => {
    try {
      if (!request) {
        console.warn("Auth request not ready yet");

        return;
      }
      await promptAsync();
    } catch (e) {
      console.error("Error during sign in:", e);
      showToast("errorToast", "Cannot sign you in. Try again later.");
    }
  }, [request, promptAsync]);

  const signOut = React.useCallback(async () => {
    try {
      await tokenCache?.deleteToken(TOKEN_KEY_NAME);
    } catch (e) {
      console.error("Error clearing token during sign out:", e);
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const fetchWithAuth = React.useCallback(
    async (url: string, options: RequestInit) => {
      if (!accessToken) {
        showToast("errorToast", "Your session has expired. Please sign in");
        router.replace("/login");
        return new Response(null, { status: 401 });
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        await tokenCache?.deleteToken(TOKEN_KEY_NAME);
        setUser(null);
        setAccessToken(null);
        showToast("errorToast", "Your session has expired. Please sign in.");
        router.replace("/login");
      }

      return response;
    },
    [accessToken, router],
  );

  const value = React.useMemo(
    () => ({
      user,
      signIn,
      signOut,
      isLoading,
      fetchWithAuth,
      error,
    }),
    [user, signIn, signOut, isLoading, fetchWithAuth, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
