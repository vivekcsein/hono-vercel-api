import helmet from "helmet";

const isProd = process.env.NODE_ENV === "production";

const helmetMiddleware = helmet({
  contentSecurityPolicy: isProd
    ? {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          // scriptSrc: ["'self'", "https://trusted.cdn.com"],
          // styleSrc: ["'self'", "https://fonts.googleapis.com"],
          // fontSrc: ["'self'", "https://fonts.gstatic.com"],
          // imgSrc: ["'self'", "data:", "https://images.example.com"],
          // connectSrc: ["'self'", "https://api.example.com"],
          // frameSrc: ["'self'", "https://trusted-embed.com"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      }
    : false,
  crossOriginEmbedderPolicy: false, // disable if using SharedArrayBuffer or WebAssembly
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xContentTypeOptions: true,
  xDnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: isProd
    ? {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      }
    : false,
  ieNoOpen: true,
  // noSniff: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
});

export default helmetMiddleware;
