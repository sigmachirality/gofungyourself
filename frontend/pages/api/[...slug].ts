import type { NextApiRequest, NextApiResponse } from 'next'
import httpProxyMiddleware from 'next-http-proxy-middleware'

const middleware = (req: NextApiRequest, res: NextApiResponse) => (
    httpProxyMiddleware(req, res, {
        target: process.env.NEXT_PUBLIC_BACKEND_URL 
            ? "https://" + process.env.NEXT_PUBLIC_BACKEND_URL 
            : "http://127.0.0.1:8000",
        pathRewrite: [{
          patternStr: '^/api',
          replaceStr: '/'
        }],
      })
);

export default middleware;
  
