import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
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
      quranFoundationDevProxy(),
    ],
  };
})
