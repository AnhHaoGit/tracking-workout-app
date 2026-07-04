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
import {
  BASE_URL,
  TOKEN_KEY_NAME,
  USER_KEY_NAME,
} from "../constants/constants";
import { tokenCache } from "../utils/cache";

export type AuthUser = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  email_verified?: boolean;
  provider?: string;
  iat?: number;
  exp?: number;
  type?: string;
};

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

        const token = await tokenResponse.json();
        const accessToken = token.accessToken;
        setAccessToken(accessToken);

        tokenCache?.saveToken(TOKEN_KEY_NAME, accessToken);

        const decoded = jose.decodeJwt(accessToken);

        setUser(decoded as AuthUser);
        router.replace("/(protected)/(tabs)/(home)");
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    } else if (response?.type === "error") {
      setError(response.error as AuthError);
    }
  };

  const signIn = async () => {
    try {
      if (!request) {
        console.log("No request");
        return;
      }

      await promptAsync();
    } catch (e) {
      console.log(e);
    }
  };

  const signOut = async () => {
    await tokenCache?.deleteToken(TOKEN_KEY_NAME);
    // await tokenCache?.deleteToken("refreshToken");

    // Clear state
    setUser(null);
    setAccessToken(null);
    // setRefreshToken(null);
  };

  const fetchWithAuth = async (url: string, options: RequestInit) => {
    // For native: Use token in Authorization header
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        isLoading,
        fetchWithAuth,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
