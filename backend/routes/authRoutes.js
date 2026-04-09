import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import db from "../services/db.js";

const router = express.Router();

const providerConfig = {
  google: {
    name: "Google",
    authUrlEnv: "GOOGLE_OAUTH_START_URL",
    callbackEnv: "GOOGLE_OAUTH_CALLBACK_URL",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    callbackUrlEnv: "GOOGLE_CALLBACK_URL",
    providerAuthBase: "https://accounts.google.com/o/oauth2/v2/auth",
    defaultScopes: ["openid", "email", "profile"],
  },
  facebook: {
    name: "Facebook",
    authUrlEnv: "FACEBOOK_OAUTH_START_URL",
    callbackEnv: "FACEBOOK_OAUTH_CALLBACK_URL",
    clientIdEnv: "FACEBOOK_CLIENT_ID",
    clientSecretEnv: "FACEBOOK_CLIENT_SECRET",
    callbackUrlEnv: "FACEBOOK_CALLBACK_URL",
    providerAuthBase: "https://www.facebook.com/v20.0/dialog/oauth",
    defaultScopes: ["email", "public_profile"],
  },
};

const getFrontendRedirectBase = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

const getBackendBase = () =>
  (process.env.BACKEND_URL || "http://localhost:3000").replace(/\/+$/, "");

const getJwtSecrets = () => ({
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret_change_me",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || "dev_jwt_refresh_secret_change_me",
});

const providerIdColumn = {
  google: "google_id",
  facebook: "facebook_id",
};

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

const toUsernameBase = (value) => {
  return String(value || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 28);
};

const ensureUniqueUsername = async (preferred) => {
  const base = toUsernameBase(preferred) || "user";

  for (let i = 0; i < 1000; i += 1) {
    const candidate = i === 0 ? base : `${base}_${i}`;
    const [rows] = await db.query(
      "SELECT user_ID FROM users WHERE username = ? LIMIT 1",
      [candidate],
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      return candidate;
    }
  }

  return `${base}_${Date.now()}`;
};

const createTokensForUser = (user) => {
  const { jwtSecret, jwtRefreshSecret } = getJwtSecrets();
  const payload = {
    user_ID: user.user_ID,
    username: user.username || "",
    name: user.name || user.username || "",
    email: user.email || "",
    role: user.role || "customer",
  };

  const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
  const refreshToken = jwt.sign({ user_ID: user.user_ID }, jwtRefreshSecret, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const redirectWithOAuthError = (res, provider, code) => {
  const frontendBase = getFrontendRedirectBase();
  return res.redirect(`${frontendBase}/login?oauth_error=${provider}_${code}`);
};

const exchangeGoogleCode = async (code, redirectUri, config) => {
  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];

  if (!clientId || !clientSecret) {
    throw new Error("google_client_missing");
  }

  const tokenBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const tokenResponse = await axios.post(
    "https://oauth2.googleapis.com/token",
    tokenBody.toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 15000,
    },
  );

  const googleAccessToken = tokenResponse.data?.access_token;
  if (!googleAccessToken) {
    throw new Error("google_token_missing");
  }

  const profileResponse = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: { Authorization: `Bearer ${googleAccessToken}` },
      timeout: 15000,
    },
  );

  const profile = profileResponse.data || {};
  return {
    providerId: String(profile.sub || ""),
    email: String(profile.email || ""),
    name: String(profile.name || profile.given_name || "Google User"),
  };
};

const exchangeFacebookCode = async (code, redirectUri, config) => {
  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv];

  if (!clientId || !clientSecret) {
    throw new Error("facebook_client_missing");
  }

  const tokenResponse = await axios.get(
    "https://graph.facebook.com/v20.0/oauth/access_token",
    {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      },
      timeout: 15000,
    },
  );

  const facebookAccessToken = tokenResponse.data?.access_token;
  if (!facebookAccessToken) {
    throw new Error("facebook_token_missing");
  }

  const profileResponse = await axios.get("https://graph.facebook.com/me", {
    params: {
      fields: "id,name,email",
      access_token: facebookAccessToken,
    },
    timeout: 15000,
  });

  const profile = profileResponse.data || {};
  return {
    providerId: String(profile.id || ""),
    email: String(profile.email || ""),
    name: String(profile.name || "Facebook User"),
  };
};

const findOrCreateOAuthUser = async ({ provider, providerId, email, name }) => {
  const column = providerIdColumn[provider];
  const normalizedEmail = email ? String(email).toLowerCase() : "";

  let rows;
  if (normalizedEmail) {
    [rows] = await db.query(
      `SELECT * FROM users WHERE ${column} = ? OR email = ? LIMIT 1`,
      [providerId, normalizedEmail],
    );
  } else {
    [rows] = await db.query(`SELECT * FROM users WHERE ${column} = ? LIMIT 1`, [
      providerId,
    ]);
  }

  let user = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

  if (user) {
    const updates = [];
    const values = [];

    if (!user[column]) {
      updates.push(`${column} = ?`);
      values.push(providerId);
    }

    if (normalizedEmail && !user.email) {
      updates.push("email = ?");
      values.push(normalizedEmail);
    }

    if (name && !user.name) {
      updates.push("name = ?");
      values.push(name);
    }

    if (updates.length > 0) {
      values.push(user.user_ID);
      await db.query(
        `UPDATE users SET ${updates.join(", ")} WHERE user_ID = ?`,
        values,
      );
      const [freshRows] = await db.query(
        "SELECT * FROM users WHERE user_ID = ? LIMIT 1",
        [user.user_ID],
      );
      user = freshRows[0];
    }

    return user;
  }

  const usernameSeed = normalizedEmail || `${provider}_${providerId}`;
  const username = await ensureUniqueUsername(usernameSeed);

  const insertData = {
    username,
    name: name || username,
    email: normalizedEmail || null,
    role: "customer",
    google_id: provider === "google" ? providerId : null,
    facebook_id: provider === "facebook" ? providerId : null,
  };

  const [insertResult] = await db.query(
    "INSERT INTO users (username, name, email, role, google_id, facebook_id) VALUES (?, ?, ?, ?, ?, ?)",
    [
      insertData.username,
      insertData.name,
      insertData.email,
      insertData.role,
      insertData.google_id,
      insertData.facebook_id,
    ],
  );

  const [newRows] = await db.query(
    "SELECT * FROM users WHERE user_ID = ? LIMIT 1",
    [insertResult.insertId],
  );
  return newRows[0];
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

  const execute = async () => {
    const error = req.query.error;
    const code = req.query.code;

    if (error) {
      return redirectWithOAuthError(res, provider, "provider_rejected");
    }

    if (!code) {
      return redirectWithOAuthError(res, provider, "missing_code");
    }

    const redirectUri = buildCallbackUrl(provider, config);

    const profile =
      provider === "google"
        ? await exchangeGoogleCode(String(code), redirectUri, config)
        : await exchangeFacebookCode(String(code), redirectUri, config);

    if (!profile.providerId) {
      return redirectWithOAuthError(res, provider, "profile_missing_id");
    }

    const user = await findOrCreateOAuthUser({ provider, ...profile });
    const { accessToken, refreshToken } = createTokensForUser(user);

    await db.query("UPDATE users SET refresh_token = ? WHERE user_ID = ?", [
      refreshToken,
      user.user_ID,
    ]);

    const frontendBase = getFrontendRedirectBase();
    const callbackTarget =
      process.env[config.callbackEnv] || `${frontendBase}/login`;

    const redirectParams = new URLSearchParams({
      accessToken,
      refreshToken,
    });
    const separator = callbackTarget.includes("?") ? "&" : "?";

    return res.redirect(
      `${callbackTarget}${separator}${redirectParams.toString()}`,
    );
  };

  execute().catch((error) => {
    console.error(`[OAuth ${provider}] callback error:`, error.message);
    return redirectWithOAuthError(res, provider, "callback_failed");
  });
});

export default router;
