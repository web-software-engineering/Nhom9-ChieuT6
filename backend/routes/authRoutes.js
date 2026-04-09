import express from "express";

const router = express.Router();

const providerConfig = {
  google: {
    name: "Google",
    authUrlEnv: "GOOGLE_OAUTH_START_URL",
    callbackEnv: "GOOGLE_OAUTH_CALLBACK_URL",
  },
  facebook: {
    name: "Facebook",
    authUrlEnv: "FACEBOOK_OAUTH_START_URL",
    callbackEnv: "FACEBOOK_OAUTH_CALLBACK_URL",
  },
};

const getFrontendRedirectBase = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

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

  const authUrl = process.env[config.authUrlEnv];

  if (!authUrl) {
    return res.status(501).json({
      success: false,
      message: `${config.name} OAuth is not configured yet`,
      requiredEnv: config.authUrlEnv,
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
  const callbackTarget = process.env[config.callbackEnv];

  if (!callbackTarget) {
    return res.redirect(
      `${frontendBase}/login?oauth_error=${provider}_callback_not_configured`,
    );
  }

  return res.redirect(callbackTarget);
});

export default router;
