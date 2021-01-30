require('dotenv').config();

const express = require('express');
const exec = require('child_process').exec;

const app = express();
const port = process.env.BUILDER_PORT;

app.post('/' + process.env.BUILDER_WEBHOOK_HASH, (req, res) => {
  if(process.env.BUILDER_REQ_HEADER !== '') {
    // An additional header is required
    const header = req.get(process.env.BUILDER_REQ_HEADER)

    if(header === undefined) {
      // Header missing
      res.sendStatus(403);
    }
    else if (header === process.env.BUILDER_REQ_HEADER_VALUE) {
      execute(res);
    }
  } else {
    execute(res);
  }
});

/**
 * Execute defined command
 *
 * @param res
 */
function execute(res) {
  exec(process.env.BUILDER_EXEC, function (err, stdout, stderr) {
    if (err) {
      // Exec throws an error, return 500 Internal Server Error
      console.log("A build error has occurred. Rebuild process not working.")
      console.log(err);
      res.sendStatus(500);
    } else {
      console.log("Executing build");
      res.sendStatus(200);
    }
  });
}

app.listen(port, () => { console.log(`Builder running`); });