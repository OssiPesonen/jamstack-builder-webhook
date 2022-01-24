require('dotenv').config();

const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const spawn = require('child_process').spawn;

// Prefix all logging with timestamp
require('./utils/console-prefix');

const app = express();

const port = process.env.BUILDER_PORT;
const secret = process.env.BUILDER_WEBHOOK_SECRET;
const secretKey = process.env.BUILDER_HEADER_BODY_KEY;
const sigHeaderName = 'X-Hub-Signature';

app.use(bodyParser.json());

/**
 * Verifies Github webhook event signature
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function verifyGithubWebhook (req, res, next) {
  if (!req.body || Object.keys(req.body).length === 0 || Object.getPrototypeOf(req.body) !== Object.prototype) {
    return res.status(403).json({ success: false, message: 'Request body is empty' });
  }

  const payload = JSON.stringify(req.body);
  const sig = req.get(sigHeaderName) || '';
  const hmac = crypto.createHmac('sha1', secret);
  const digest = Buffer.from('sha1=' + hmac.update(payload).digest('hex'), 'utf8');
  const checksum = Buffer.from(sig, 'utf8');

  if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
    console.warn(`Request body digest (${digest}) did not match ${sigHeaderName} (${checksum})`);
    return res.status(401).json({ success: false, message: 'Invalid signature' });
  }

  return next();
}

/**
 * Verifies custom webhook secret in header or body
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function verifyWebhook (req, res, next) {
  const headerSecret = req.get(secretKey) || undefined;
  const bodySecret = req.body[secretKey] || undefined;

  if (headerSecret === secret || bodySecret === secret) {
    return next();
  }

  return res.status(401).json({ success : false, message: "Invalid secret" });}

/**
 * Initiate the build process and log stdout
 */
function redeploy () {
  const exec = process.env.BUILDER_EXEC;

  if (!exec) {
    // Nothing defined to run, no need to go any further
    return;
  }

  console.log(process.env.PATH);

  const child = spawn(exec, [], {
    shell: true,
    env: { ...process.env, PATH: process.env.PATH + (process.env.NODE_PATH ?? '') }
  });

  child.stdout.on('data',
    function (data) {
      console.log('INFO: ' + data);
    });

  child.stderr.on('data', function (data) {
    //throw errors
    console.error('ERROR: ' + data);
  });

  child.on('close', function (code) {
    console.info('Deployment finished. Exited with code ' + code);
  });
}

/**
 * Run deployment
 *
 * @param res
 * @returns {*}
 */
function runDeployment (res) {
  try {
    console.log('Running deployment...');
    redeploy();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "An error has occurred. Build could not be triggered." });
  }

  return res.status(200).json({ success: true });
}

app.post('/' + process.env.BUILDER_CONTENT_WEBHOOK_PATH, verifyWebhook, (req, res) => runDeployment(res));
app.post('/' + process.env.BUILDER_GITHUB_WEBHOOK_PATH, verifyGithubWebhook, (req, res) => runDeployment(res));

app.listen(port, () => { console.log(`Builder running on port ${port}`); });