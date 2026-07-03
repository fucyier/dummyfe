const ENVIRONMENT_URLS = {
  production: {
    authBaseUrl: 'https://oauth2.quran.foundation',
    apiBaseUrl: 'https://apis.quran.foundation',
  },
  prelive: {
    authBaseUrl: 'https://prelive-oauth2.quran.foundation',
    apiBaseUrl: 'https://apis-prelive.quran.foundation',
  },
};

const tokenCache = new Map();
const TOKEN_EXPIRY_SKEW_MS = 60 * 1000;

export const getQuranFoundationConfig = () => {
  const environment = (process.env.QF_ENV || process.env.QURAN_FOUNDATION_ENV || 'production').toLowerCase();
  const urls = ENVIRONMENT_URLS[environment] || ENVIRONMENT_URLS.production;
  const clientId = process.env.QF_CLIENT_ID || process.env.QURAN_CLIENT_ID;
  const clientSecret = process.env.QF_CLIENT_SECRET || process.env.QURAN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const missing = [
      !clientId ? 'QF_CLIENT_ID' : null,
      !clientSecret ? 'QF_CLIENT_SECRET' : null,
    ].filter(Boolean).join(', ');

    throw new Error(`Missing Quran Foundation environment variable(s): ${missing}`);
  }

  return {
    ...urls,
    clientId,
    clientSecret,
  };
};

export const getAccessToken = async (scope, { forceRefresh = false } = {}) => {
  const config = getQuranFoundationConfig();
  const cacheKey = `${config.authBaseUrl}:${config.clientId}:${scope}`;
  const cachedToken = tokenCache.get(cacheKey);

  if (!forceRefresh && cachedToken && cachedToken.expiresAt > Date.now() + TOKEN_EXPIRY_SKEW_MS) {
    return cachedToken.accessToken;
  }

  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
  const response = await fetch(`${config.authBaseUrl}/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || !payload.access_token) {
    const message = payload.error_description || payload.error || 'Quran Foundation token request failed.';
    throw new Error(message);
  }

  const expiresInMs = Number(payload.expires_in || 3600) * 1000;
  tokenCache.set(cacheKey, {
    accessToken: payload.access_token,
    expiresAt: Date.now() + expiresInMs,
  });

  return payload.access_token;
};

export const writeJson = (response, statusCode, payload, headers = {}) => {
  response.status(statusCode);
  Object.entries({
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  }).forEach(([key, value]) => response.setHeader(key, value));
  response.send(JSON.stringify(payload));
};
