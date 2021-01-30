require('dotenv').config();

const express = require('express');
const crypto = require('crypto');

const bodyParser = require('body-parser');
const spawn = require('child_process').spawn;

const app = express();

const port = process.env.BUILDER_PORT;
const secret = process.env.BUILDER_WEBHOOK_SECRET;
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
function verifyPostData (req, res, next) {
  const payload = JSON.stringify(req.body);

  if (!payload) {
    return next('Request body empty');
  }

  const sig = req.get(sigHeaderName) || '';
  const hmac = crypto.createHmac('sha1', secret);
  const digest = Buffer.from('sha1=' + hmac.update(payload).digest('hex'), 'utf8');
  const checksum = Buffer.from(sig, 'utf8');

  if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
    return next(`Request body digest (${digest}) did not match ${sigHeaderName} (${checksum})`);
  }

  console.log('Github webhook signature validated');

  return next();
}

/**
 * Initiate the build process and log stdout
 */
function redeploy () {
  const child = spawn(process.env.BUILDER_EXEC, [], { shell: true });

  child.stdout.on('data',
    function (data) {
      console.log('INFO: ' + data);
    });

  child.stderr.on('data', function (data) {
    //throw errors
    console.log('ERROR: ' + data);
  });

  child.on('close', function (code) {
    console.log('EXITED WITH CODE ' + code);
  });
}

app.post('/' + process.env.BUILDER_CONTENT_WEBHOOK_PATH, (req, res) => {
  const headerSecretValue = req.get(process.env.BUILDER_SECRET_HEADER_NAME);

  if (headerSecretValue === undefined || headerSecretValue !== secret) {
    res.sendStatus(403);
  }

  console.log('Re-building front-end application...');

  redeploy();
  res.sendStatus(200);
});

app.post('/' + process.env.BUILDER_GITHUB_WEBHOOK_PATH, verifyPostData, (req, res) => {
  console.log('Re-deploying front-end application...');

  redeploy();
  res.sendStatus(200);
});

app.listen(port, () => { console.log(`Builder running`); });