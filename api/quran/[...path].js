import { getAccessToken, getQuranFoundationConfig, writeJson } from '../_quranFoundation.js';

const API_FAMILIES = {
  content: {
    scope: 'content',
    pathPrefix: '/content',
  },
  search: {
    scope: 'search',
    pathPrefix: '/search',
  },
};

const getProxyTarget = (pathParts = []) => {
  const [familyName, ...restPathParts] = pathParts;
  const family = API_FAMILIES[familyName];

  if (!family || restPathParts.length === 0) {
    return null;
  }

  return {
    scope: family.scope,
    path: `${family.pathPrefix}/${restPathParts.map(encodeURIComponent).join('/')}`,
  };
};

const proxyQuranFoundationRequest = async (request, response, retryOnUnauthorized = true) => {
  const pathParts = Array.isArray(request.query.path) ? request.query.path : [request.query.path].filter(Boolean);
  const target = getProxyTarget(pathParts);

  if (!target) {
    return writeJson(response, 400, {
      error: 'invalid_quran_proxy_path',
      message: 'Use /api/quran/content/... or /api/quran/search/...',
    });
  }

  const config = getQuranFoundationConfig();
  const accessToken = await getAccessToken(target.scope, { forceRefresh: !retryOnUnauthorized });
  const query = new URLSearchParams();

  Object.entries(request.query).forEach(([key, value]) => {
    if (key === 'path') return;

    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
      return;
    }

    if (value !== undefined) {
      query.append(key, value);
    }
  });

  const upstreamUrl = `${config.apiBaseUrl}${target.path}${query.size ? `?${query.toString()}` : ''}`;
  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers: {
      'x-auth-token': accessToken,
      'x-client-id': config.clientId,
      Accept: request.headers.accept || 'application/json',
    },
  });

  if (upstreamResponse.status === 401 && retryOnUnauthorized) {
    return proxyQuranFoundationRequest(request, response, false);
  }

  const contentType = upstreamResponse.headers.get('content-type') || 'application/json; charset=utf-8';
  const body = await upstreamResponse.text();

  response.status(upstreamResponse.status);
  response.setHeader('Content-Type', contentType);
  response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  response.send(body);
};

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    response.setHeader('Allow', 'GET, HEAD, OPTIONS');
    return response.status(204).end();
  }

  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD, OPTIONS');
    return writeJson(response, 405, {
      error: 'method_not_allowed',
      message: 'Only GET requests are supported by the Quran Foundation proxy.',
    });
  }

  try {
    return await proxyQuranFoundationRequest(request, response);
  } catch (error) {
    return writeJson(response, 500, {
      error: 'quran_foundation_proxy_error',
      message: error.message || 'Quran Foundation request failed.',
    });
  }
}
