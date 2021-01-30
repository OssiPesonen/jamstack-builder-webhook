# Jamstack builder app

> :warning: **This application is still very much untested and might contain security issues. Caution is adviced**

This app servers a webhook, with a user specified path that can be called via HTTP POST to execute a server command.
This command can be something on the lines of rebuilding your front-end application for JAMStack.

## Getting started

1. Clone this repo
2. Run `npm install` or `yarn install`. 
3. Copy `.env.dist` as `.env` and set your variable values.

## Example commands
Example command on how to rebuild Nuxt.js JAMStack app and restart process manager (pm2) so  it's loaded.   

    cd /var/www/html; npm run build && npm run generate && pm2 restart Nuxt

## Troubleshooting

The most likely issues you will run into will be permissions. 
Your process might be running with a user that can't execute these npm commands on the designated path.