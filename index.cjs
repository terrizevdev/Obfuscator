const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (!isProduction) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'],
      imgSrc: ["'self'", 'data:']
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Request logging and tracing
app.use((req, res, next) => {
  req.id = uuidv4();
  logger.info(`${req.method} ${req.path}`, { 
    requestId: req.id,
    ip: req.ip,
    userAgent: req.get('User-Agent') 
  });
  next();
});

// Serve static files with cache control
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: isProduction ? '1y' : '0',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// API endpoint for server-side obfuscation
app.post('/api/obfuscate', apiLimiter, (req, res) => {
  try {
    const { code, securityLevel = 'standard', domainLock = [] } = req.body;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid input: JavaScript code is required',
        requestId: req.id
      });
    }

    const options = getObfuscationOptions(securityLevel, domainLock);
    const result = JavaScriptObfuscator.obfuscate(code, options);
    
    logger.info('Obfuscation successful', {
      requestId: req.id,
      securityLevel,
      domainLockCount: domainLock.length,
      codeLength: code.length
    });

    res.json({ 
      obfuscatedCode: result.getObfuscatedCode(),
      sourceMap: result.getSourceMap(),
      requestId: req.id
    });

  } catch (error) {
    logger.error('Obfuscation failed', {
      requestId: req.id,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Obfuscation failed',
      message: error.message,
      requestId: req.id
    });
  }
});

// Obfuscation options configuration
function getObfuscationOptions(level = 'standard', domainLock = []) {
  const baseOptions = {
    compact: true,
    disableConsoleOutput: false,
    log: false,
    sourceMap: false,
    sourceMapMode: 'separate',
    stringArray: true,
    stringArrayThreshold: 0.75,
    target: 'browser'
  };

  const optionsByLevel = {
    basic: {
      ...baseOptions,
      controlFlowFlattening: false,
      stringArrayEncoding: []
    },
    standard: {
      ...baseOptions,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      debugProtection: false,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 0.5
    },
    advanced: {
      ...baseOptions,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.85,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.3,
      debugProtection: true,
      debugProtectionInterval: 1000,
      selfDefending: true,
      stringArrayEncoding: ['rc4'],
      stringArrayThreshold: 0.4
    },
    enterprise: {
      ...baseOptions,
      compact: false,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.5,
      debugProtection: true,
      debugProtectionInterval: 500,
      disableConsoleOutput: true,
      domainLock: domainLock.length ? domainLock : undefined,
      identifierNamesGenerator: 'mangled',
      renameGlobals: true,
      selfDefending: true,
      stringArrayEncoding: ['rc4', 'base64'],
      stringArrayThreshold: 0.3,
      transformObjectKeys: true
    },
    ultra: {
      ...baseOptions,
      compact: false,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.75,
      debugProtection: true,
      debugProtectionInterval: 200,
      disableConsoleOutput: true,
      domainLock: domainLock.length ? domainLock : undefined,
      domainLockRedirectUrl: 'about:blank',
      identifierNamesGenerator: 'mangled-shuffled',
      numbersToExpressions: true,
      renameGlobals: true,
      renameProperties: true,
      selfDefending: true,
      simplify: false,
      splitStrings: true,
      splitStringsChunkLength: 5,
      stringArrayEncoding: ['rc4', 'base64', 'none'],
      stringArrayThreshold: 0.1,
      transformObjectKeys: true,
      unicodeEscapeSequence: true,
      rotateStringArray: true,
      shuffleStringArray: true
    }
  };

  return optionsByLevel[level] || optionsByLevel.standard;
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error', {
    requestId: req.id,
    error: err.message,
    stack: err.stack
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    requestId: req.id
  });
});

// Serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
  logger.info(`Server started on port ${port}`, {
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
  console.log(`VERONICA Obfuscator Pro running at http://localhost:${port}`);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { error: reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});
