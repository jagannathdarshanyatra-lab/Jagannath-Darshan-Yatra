const jwt = require('jsonwebtoken');

// Protect routes - allows both admin and superadmin
const protectAdmin = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized as admin',
        });
      }

      req.admin = decoded;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({
        success: false,
        error: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Not authorized, no token',
    });
  }
};

// Protect routes - only superadmin
const requireSuperAdmin = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized. SuperAdmin access required.',
        });
      }

      req.admin = decoded;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({
        success: false,
        error: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Not authorized, no token',
    });
  }
};

module.exports = { protectAdmin, requireSuperAdmin };
