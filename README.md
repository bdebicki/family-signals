# Family Signals
Integrate yeelight bulb with google calendar or slack status.

## Available Scripts
- `clean` - remove coverage data, Jest cache and transpiled files,
- `prebuild` - lint source files and tests before building,
- `build` - transpile TypeScript to ES6,
- `build:watch` - interactive watch mode to automatically transpile source files,
- `lint` - lint source files and tests,
- `prettier` - reformat files,
- `test` - run tests,
- `test:watch` - interactive watch mode to automatically re-run tests

## How to start
0. copy .env.template to .env file
1. fill out .env file by OAuth tokens:
   - OAUTH_CLIENT_ID - client id
   - OAUTH_CLIENT_SECRET - client secret
   and yeelight ip:
   - YEELIGHT_IP - yeelight bulb in your local network
2. run `npm run auth:calendar` to generate necessary tokens and authorize app with Google
3. fill out .env file by generated OAuth tokens:
   - OAUTH_ACCESS_TOKEN - access_token
   - OAUTH_REFRESH_TOKEN - refrest_token