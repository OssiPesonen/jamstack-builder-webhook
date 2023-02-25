This repository has been archived in favor of a [new implementation](https://github.com/OssiPesonen/builder-app-go) written in golang.

# Jamstack builder app

This app serves a webhook, with a user specified path that can be called via HTTP POST to execute a server command.
This command can be something on the lines of rebuilding your front-end application that uses JAMStack.

This application has only been tested on a Linux server with a successful build process. Error scenarios have not been tested.

## Getting started

1. Clone this repo
2. Run `npm install` or `yarn install`. 
3. Copy `.env.dist` as `.env` and set your variable values.
4. Start the server using pm2 with `pm2 start server.js` or just `node server.js`   
5. Do a POST call to your server's address with the specified `BUILDER_PORT` and `BUILDER_CONTENT_WEBHOOK_PATH`. Don't forget to include the additional header, if you set one in the `BUILDER_REQ_HEADER`. For example `POST http://localhost:8082/gxrjg4y6s6kjshznb1a5` (with headers).
6. (optional) Set your Github repository webhook to point to the same server,to `BUILDER_GITHUB_WEBHOOK_PATH`, and set the same secret as the content (or change the server implementation if you want different secrets) 

## Example .env file

```bash
BUILDER_CONTENT_WEBHOOK_PATH=abcd12345

BUILDER_GITHUB_WEBHOOK_PATH=deploy

BUILDER_PORT=8080

BUILDER_EXEC=". /var/www/jamstack-builder-webhook/build"

BUILDER_HEADER_BODY_KEY=WEBHOOK_KEY

BUILDER_WEBHOOK_SECRET=iambatman

NODE_PATH=
```

## Recommendations

- Install a process manager like [pm2](https://www.npmjs.com/package/pm2) to manage this server and your front-end
- Use a CMS which can automatically call your webhook, like [Strapi](https://strapi.io), when content changes.

## Example commands

Example command for `BUILDER_EXEC` on how to rebuild Nuxt.js JAMStack app and restart process manager (pm2) so  it's loaded.   

    cd /var/www/html; npm run build && npm run generate && pm2 restart <ProcessName>

Another would be to just call a bash script:

    . /var/www/build

And that bash script would include something like this

    #!/bin/bash
    
    cd /var/www/html;
    git pull;
    rm -rm node_modules;
    npm install;
    npm run build && npm run generate && pm2 restart <ProcessName>;

A better option would be to use a separate directory to host the repository and then copy files to the public one, leaving git and other deployment/development stuff behind.

Another solution to run bash scripts is to not use the `shell` option with `spawn`, but rather use the command directly:

```
const child = spawn('bash', [process.env.BUILDER_EXEC]);
````

This means dropping the dot from the `BUILDER_EXEC` environment variable.

## Security considerations

> :warning: **Some caution is advised**

Executing server commands based on a user-initiated input could potentially be dangerous, but in this instance the user can only initiate the process, not define it or it's arguments.
I do advice you to consider the execution commands you put in the `BUILDER_EXEC` command to make sure it can't do anything harmful.

I've added an optional header, which can be used to authorize the request on the server's side, much like a password, so a user can't just guess the web address and initiate multiple build processes.

## Troubleshooting

The most likely issues you will run into will be permissions.
Your process might be running with a user that can't execute the commands. 
To debug this, my recommendation is to change the `spawn` arguments to not run the command in a detached state so you can monitor logs for any errors.
