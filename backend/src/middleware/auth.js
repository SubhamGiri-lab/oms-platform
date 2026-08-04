const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { User } = require('../models');

const getToken = (req) => req.headers.authorization?.split(' ')[1];

const getSigningKey = (kid, callback) => {
  const tenantId = process.env.AZURE_AD_TENANT_ID;
  const authority = process.env.AZURE_AD_AUTHORITY || `https://login.microsoftonline.com/${tenantId}`;
  const jwksUri = `${authority}/discovery/v2.0/keys`;

  const client = jwksClient({
    jwksUri,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600000,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
  });

  client.getSigningKey(kid, (err, key) => {
    if (err) {
      return callback(err);
    }

    const signingKey = key.getPublicKey ? key.getPublicKey() : key.rsaPublicKey;
    callback(null, signingKey);
  });
};

const verifyAzureToken = (token) => {
  return new Promise((resolve, reject) => {
    const tenantId = process.env.AZURE_AD_TENANT_ID;
    const clientId = process.env.AZURE_AD_CLIENT_ID;
    const authority = process.env.AZURE_AD_AUTHORITY || `https://login.microsoftonline.com/${tenantId}`;
    const issuer = `${authority}/v2.0`;

    jwt.verify(
      token,
      getSigningKey,
      {
        issuer,
        audience: clientId,
      },
      (err, decoded) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded);
      }
    );
  });
};

const authenticate = async (req, res, next) => {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    let decoded;
    const usingAzure = Boolean(process.env.AZURE_AD_TENANT_ID && process.env.AZURE_AD_CLIENT_ID);

    if (usingAzure) {
      decoded = await verifyAzureToken(token);
      req.user = {
        id: decoded.oid || decoded.sub,
        email: decoded.preferred_username || decoded.email,
        role: decoded.roles?.[0] || 'staff',
        isActive: true,
      };
    } else {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findByPk(decoded.id);

      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'User not found or inactive' });
      }

      req.user = user;
    }

    next();
  } catch (error) {
    console.error('Authentication failed:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        requiredRole: roles
      });
    }

    next();
  };
};

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticate,
  authorize,
  generateToken
};
