# Jamstack builder app

This app serves a webhook, with a user specified path that can be called via HTTP POST to execute a server command.
This command can be something on the lines of rebuilding your front-end application that uses JAMStack.

This application has only been tested on a Linux server with a successful build process. Error scenarios have not been tested.

## Getting started

1. Clone this repo
2. Run `npm install` or `yarn install`. 
3. Copy `.env.dist` as `.env` and set your variable values.
4. Start the server using pm2 with `pm2 start server.js` or just `node server.js`   
4. Do a POST call to your server's address with the specified `BUILDER_PORT` and `BUILDER_WEBHOOK_HASH`. Don't forget to include the additional header, if you set one in the `BUILDER_REQ_HEADER`. For example `POST http://localhost:8082/gxrjg4y6s6kjshznb1a5` (with headers).

## Recommendations

- Install a process manager like [pm2](https://www.npmjs.com/package/pm2) to manage this server and your front-end
- Use a CMS which can automatically call your webhook, like [Strapi](https://strapi.io), when content changes.

## Example commands

Example command for `BUILDER_EXEC` on how to rebuild Nuxt.js JAMStack app and restart process manager (pm2) so  it's loaded.   

    cd /var/www/html; npm run build && npm run generate && pm2 restart <ProcessName>

## Security considerations

> :warning: **Some caution is advised**

Executing server commands based on a user-initiated input could potentially be dangerous, but in this instance the user can only initiate the process, not define it or it's arguments.
I do advice you to consider the execution commands you put in the `BUILDER_EXEC` command to make sure it can't do anything harmful.

I've added an optional header, which can be used to authorize the request on the server's side, much like a password, so a user can't just guess the web address and initiate multiple build processes.

## Troubleshooting

The most likely issues you will run into will be permissions.
Your process might be running with a user that can't execute the commands. 
To debug this, my recommendation is to change the `spawn` arguments to not run the command in a detached state so you can monitor logs for any errors.