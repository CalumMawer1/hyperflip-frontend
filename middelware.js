
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Since middleware runs at build time, the env var is inlined.
  if (process.env.NEXT_PUBLIC_SITE_OFFLINE === 'true') {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Site Under Maintenance</title>
          <style>
            body {
              margin: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background-color: #000;
              color: #fff;
              font-family: sans-serif;
            }
            h1 {
              font-size: 3rem;
              color: #04e6e0;
            }
            p {
              font-size: 1.25rem;
            }
          </style>
        </head>
        <body>
          <div style="text-align:center;">
            <h1>🚧 Site Under Maintenance</h1>
            <p>We’re performing scheduled maintenance. Please check back soon.</p>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*', 
};
