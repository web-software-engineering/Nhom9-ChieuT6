import express from "express";

const router = express.Router();

const providerConfig = {
  google: {
    name: "Google",
    authUrlEnv: "GOOGLE_OAUTH_START_URL",
    callbackEnv: "GOOGLE_OAUTH_CALLBACK_URL",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    callbackUrlEnv: "GOOGLE_CALLBACK_URL",
    providerAuthBase: "https://accounts.google.com/o/oauth2/v2/auth",
    defaultScopes: ["openid", "email", "profile"],
  },
  facebook: {
    name: "Facebook",
    authUrlEnv: "FACEBOOK_OAUTH_START_URL",
    callbackEnv: "FACEBOOK_OAUTH_CALLBACK_URL",
    clientIdEnv: "FACEBOOK_CLIENT_ID",
    callbackUrlEnv: "FACEBOOK_CALLBACK_URL",
    providerAuthBase: "https://www.facebook.com/v20.0/dialog/oauth",
    defaultScopes: ["email", "public_profile"],
  },
};

const getFrontendRedirectBase = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

const getBackendBase = () =>
  (process.env.BACKEND_URL || "http://localhost:3000").replace(/\/+$/, "");

const buildCallbackUrl = (provider, config) => {
  return (
    process.env[config.callbackUrlEnv] ||
    `${getBackendBase()}/api/auth/${provider}/callback`
  );
};

const buildProviderAuthUrl = (provider, config) => {
  const clientId = process.env[config.clientIdEnv];

  if (!clientId) {
    return null;
  }

  const redirectUri = buildCallbackUrl(provider, config);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  if (provider === "google") {
    params.set("response_type", "code");
    params.set("scope", config.defaultScopes.join(" "));
    params.set("prompt", "select_account");
  }

  if (provider === "facebook") {
    params.set("scope", config.defaultScopes.join(","));
  }

  return `${config.providerAuthBase}?${params.toString()}`;
};

const unsupportedProvider = (res, provider) => {
  res.status(404).json({
    success: false,
    message: `Unsupported provider: ${provider}`,
  });
};

router.get("/:provider(google|facebook)", (req, res) => {
  const provider = req.params.provider;
  const config = providerConfig[provider];

  if (!config) {
    return unsupportedProvider(res, provider);
  }

  const authUrl =
    process.env[config.authUrlEnv] || buildProviderAuthUrl(provider, config);

  if (!authUrl) {
    return res.status(501).json({
      success: false,
      message: `${config.name} OAuth is not configured yet`,
      requiredEnv: [config.authUrlEnv, config.clientIdEnv],
    });
  }

  return res.redirect(authUrl);
});

router.get("/:provider(google|facebook)/callback", (req, res) => {
  const provider = req.params.provider;
  const config = providerConfig[provider];

  if (!config) {
    return unsupportedProvider(res, provider);
  }

  const frontendBase = getFrontendRedirectBase();
  const callbackTarget =
    process.env[config.callbackEnv] || `${frontendBase}/login`;

  if (!callbackTarget) {
    return res.redirect(
      `${frontendBase}/login?oauth_error=${provider}_callback_not_configured`,
    );
  }

  const callbackParams = new URLSearchParams(req.query);
  const separator = callbackTarget.includes("?") ? "&" : "?";

  return res.redirect(
    callbackParams.toString()
      ? `${callbackTarget}${separator}${callbackParams.toString()}`
      : callbackTarget,
  );
});

export default router;
