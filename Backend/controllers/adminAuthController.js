const generateAdminToken = require('../utils/generateAdminToken');

// @desc    Auth admin/superadmin & get token
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    // Check SuperAdmin credentials first
    if (email === superAdminEmail && password === superAdminPassword) {
      return res.json({
        success: true,
        token: generateAdminToken('superadmin', 'superadmin'),
        admin: {
          email: superAdminEmail,
          role: 'superadmin',
        },
      });
    }

    // Check Admin credentials
    if (email === adminEmail && password === adminPassword) {
      return res.json({
        success: true,
        token: generateAdminToken('admin', 'admin'),
        admin: {
          email: adminEmail,
          role: 'admin',
        },
      });
    }

    // Invalid credentials
    res.status(401).json({
      success: false,
      error: 'Invalid credentials',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error',
    });
  }
};

module.exports = {
  loginAdmin,
};
