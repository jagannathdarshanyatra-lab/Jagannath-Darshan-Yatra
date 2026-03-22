/**
 * Middleware to set Cache-Control headers for public GET requests
 * @param {number} seconds - Cache duration in seconds
 */
const setCache = (seconds) => {
  return (req, res, next) => {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', `public, max-age=${seconds}`);
    }
    next();
  };
};

module.exports = { setCache };
