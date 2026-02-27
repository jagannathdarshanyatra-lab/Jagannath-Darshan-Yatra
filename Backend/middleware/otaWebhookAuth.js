/**
 * OTA Webhook Authentication Middleware
 * Verifies incoming webhook requests from the OTA provider (e.g., Bookingjini).
 * 
 * How it works:
 * - Checks for a shared secret in the `X-OTA-Webhook-Secret` header
 * - Validates that request body exists and is non-empty
 * - Logs all webhook attempts for debugging
 */

const verifyOtaWebhook = (req, res, next) => {
  const webhookSecret = process.env.OTA_WEBHOOK_SECRET;
  const receivedSecret = req.headers['x-ota-webhook-secret'];

  // Log every incoming webhook attempt
  console.log(`[OTA Webhook] ${new Date().toISOString()} | ${req.method} ${req.path} | IP: ${req.ip}`);

  // 1. Check if webhook secret is configured on our end
  if (!webhookSecret) {
    console.error('[OTA Webhook] ERROR: OTA_WEBHOOK_SECRET is not configured in .env');
    return res.status(500).json({
      success: false,
      error: 'Webhook authentication not configured on server',
    });
  }

  // 2. Validate the shared secret from OTA provider
  if (!receivedSecret || receivedSecret !== webhookSecret) {
    console.warn(`[OTA Webhook] UNAUTHORIZED: Invalid or missing webhook secret from IP ${req.ip}`);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid webhook secret',
    });
  }

  // 3. Validate request body exists
  if (!req.body || Object.keys(req.body).length === 0) {
    console.warn('[OTA Webhook] BAD REQUEST: Empty or missing request body');
    return res.status(400).json({
      success: false,
      error: 'Bad Request: Request body is required',
    });
  }

  // Authentication passed
  console.log('[OTA Webhook] Authentication successful');
  next();
};

module.exports = { verifyOtaWebhook };
