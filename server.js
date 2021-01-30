require('dotenv').config();

const express = require('express');
const spawn = require('child_process').spawn;

const app = express();
const port = process.env.BUILDER_PORT;

app.post('/' + process.env.BUILDER_WEBHOOK_HASH, (req, res) => {
  if(process.env.BUILDER_REQ_HEADER !== '') {
    // An additional header is required
    const header = req.get(process.env.BUILDER_REQ_HEADER)

    if (header === undefined) {
      // Header missing
      res.sendStatus(403);
    }
    else if (header === process.env.BUILDER_REQ_HEADER_VALUE) {
      spawn(process.env.BUILDER_EXEC, [], { detached: true });
    }
  } else {
    spawn(process.env.BUILDER_EXEC, [], { detached: true });
  }

  res.sendStatus(200);
});

app.listen(port, () => { console.log(`Builder running`); });