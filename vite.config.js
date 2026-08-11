import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import quranFoundationHandler from './api/quran/[...path].js'

const quranFoundationDevProxy = () => ({
  name: 'quran-foundation-dev-proxy',
  configureServer(server) {
    server.middlewares.use('/api/quran', async (req, res, next) => {
      if (!req.url) {
        next();
        return;
      }

      const requestUrl = new URL(req.url, 'http://localhost');
      const path = requestUrl.pathname.replace(/^\/+|\/+$/g, '');
      const query = { path: path ? path.split('/') : [] };

      requestUrl.searchParams.forEach((value, key) => {
        if (query[key] === undefined) {
          query[key] = value;
          return;
        }

        query[key] = Array.isArray(query[key]) ? [...query[key], value] : [query[key], value];
      });

      const response = {
        statusCode: 200,
        status(code) {
          this.statusCode = code;
          res.statusCode = code;
          return this;
        },
        setHeader(name, value) {
          res.setHeader(name, value);
          return this;
        },
        send(body) {
          if (!res.headersSent && !res.getHeader('Content-Type')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
          }
          res.end(body);
        },
        end(body) {
          res.end(body);
        },
      };

      try {
        await quranFoundationHandler({
          method: req.method,
          headers: req.headers,
          query,
        }, response);
      } catch (error) {
        next(error);
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      VitePWA({
        registerType: 'prompt',
        injectRegister: 'auto',
        includeAssets: [
          'pwa/apple-touch-icon.png',
          'pwa/icon-192.png',
          'pwa/icon-512.png',
          'pwa/icon-maskable-512.png',
        ],
        manifest: {
          id: '/',
          name: "Kur'an-\u0131 Kerim Sitesi",
          short_name: "Kur'an-\u0131 Kerim",
          description: "Kur'an-\u0131 Kerim'i oku, dinle ve ezberle.",
          lang: 'tr',
          dir: 'ltr',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait-primary',
          background_color: '#faf8ef',
          theme_color: '#596b3d',
          icons: [
            {
              src: '/pwa/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/pwa/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/pwa/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          globPatterns: ['**/*.{js,css,html,json,png,jpg,jpeg,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: ({ url }) => (
                url.origin === 'https://api.quran.com'
                && url.pathname.startsWith('/api/v4/')
              ),
              handler: 'CacheFirst',
              options: {
                cacheName: 'quran-content-v1',
                cacheableResponse: {
                  statuses: [0, 200],
                },
                expiration: {
                  maxEntries: 500,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                  purgeOnQuotaError: true,
                },
              },
            },
          ],
        },
      }),
      quranFoundationDevProxy(),
    ],
  };
})
