import type { NextApiRequest, NextApiResponse } from 'next'
import httpProxyMiddleware from 'next-http-proxy-middleware'

export default (req: NextApiRequest, res: NextApiResponse) => (
    httpProxyMiddleware(req, res, {
        target: process.env.BACKEND_URL 
            ? "https://" + process.env.BACKEND_URL 
            : "http://127.0.0.1:8000",
        pathRewrite: [{
          patternStr: '^/api',
          replaceStr: '/'
        }],
      })
  );
  
