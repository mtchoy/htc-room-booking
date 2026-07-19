const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

require('dotenv').config();

function getValidationConfig() {
    const tenantId = process.env.MICROSOFT_TENANT_ID;
    const audience = process.env.MICROSOFT_CLIENT_ID;

    if (!tenantId || !audience) {
        return null;
    }

    return { tenantId, audience };
}

// 1. Setup the JWKS client to fetch Microsoft's public keys dynamically
// 2. The Express Middleware
const validateMicrosoftToken = (req, res, next) => {
    const validationConfig = getValidationConfig();

    if (!validationConfig) {
        return res.status(500).json({ error: 'Server misconfiguration: Microsoft token validation is not configured.' });
    }

    const { tenantId, audience } = validationConfig;
    const client = jwksClient({
        jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5
    });

    const getKey = (header, callback) => {
        client.getSigningKey(header.kid, function (err, key) {
            if (err) return callback(err);
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
        });
    };

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format.' });
    }

    const token = authHeader.split(' ')[1];

    // Configure validation constraints
    const options = {
        audience,
        issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
        algorithms: ['RS256']
    };

    // Verify the JWT signature against Microsoft's public keys
    jwt.verify(token, getKey, options, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unauthorized: Token validation failed.', details: err.message });
        }

        if (decoded.tid !== tenantId) {
            return res.status(401).json({ error: 'Unauthorized: Token tenant does not match the configured tenant.' });
        }

        if (!decoded.preferred_username && !decoded.upn) {
            return res.status(401).json({ error: 'Unauthorized: Token does not include a user identity claim.' });
        }

        if (!decoded.scp && !decoded.roles) {
            return res.status(401).json({ error: 'Unauthorized: Token is missing delegated scopes or application roles.' });
        }

        if (decoded._claim_names && decoded._claim_names.groups) {
            return res.status(403).json({
                error: 'Forbidden: Token group claims are overage-managed. Group-based authorization is not supported for this token.'
            });
        }

        // Attach decoded user claims to the request object for use down the line
        // req.user = decoded;
        const email = decoded.preferred_username || decoded.upn || '';
        const username = email ? email.split('@')[0] : 'unknown';

        req.user = {
            // ...decoded,
            username,
            canApprove: false,
            canSeeList: false,
            canSeeOne: false
        };

        const userGroups = decoded.groups;

        if (!Array.isArray(userGroups) || userGroups.length === 0) {
            return next();
        }

        if (userGroups.includes("f6f8e7d4-647a-434f-86d6-3949165d955f")) {
            req.user.canApprove = true;
            req.user.canSeeList = true;
            req.user.canSeeOne = true;
        } else if (
            userGroups.includes("54b58a85-c262-417b-ae80-4181067b3509") ||
            userGroups.includes("ab785f76-33a5-4562-83f0-438a0287b95b")
        ) {
            req.user.canSeeList = true;
            req.user.canSeeOne = true;
        } else if (userGroups.includes("f1c9b0a0-1f1a-4f1e-8f1e-8f1e8f1e8f1e")) {
            req.user.canSeeOne = true;
        }

        next();
    });
};

module.exports = validateMicrosoftToken;