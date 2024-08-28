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
- `test:watch` - interactive watch mode to automatically re-run tests,
- `tool:auth-calendar` - authenticate the calendar,
- `tool:is-bulb` - check does the signalisation bulb is turned on, 
- `tool:name-bulb` - set up name of the signalisation bulb

## How to start
0. copy .env.template to .env file
1. fill out .env file by OAuth tokens:
   - OAUTH_CLIENT_ID - client id
   - OAUTH_CLIENT_SECRET - client secret
   and yeelight ip:
   - YEELIGHT_BULB_NAME - yeelight bulb name (the name, but name from api not the one you set in the application. if you dont know your bulb name run the `npm run tool:name-bulb`)
2. run `npm run build` - to buld the dist files
3. run `npm run tool:auth-calendar` to generate necessary tokens and authorize app with Google
4. fill out .env file by generated OAuth tokens:
   - OAUTH_ACCESS_TOKEN - access_token
   - OAUTH_REFRESH_TOKEN - refrest_token
5. run `npm run start` and start the script

## Roadmap:
- [ ] **1.0.0** 
  - re-discover bulbs while bulb is turned off during calendar management
  - restart script while user log in again to system
- [ ] **2.0.0** - handle slack huddle
- [ ] **2.1.0** - allow multiple google calendars
- [ ] **2.2.0** - reconcile manual and automatic (huddle / calendar) toggle
- [ ] **2.3.0** - add possibility to turn on/off bulb from iphone widget or try icon
- [ ] **3.0.0** - handle script on load of system
- [ ] **4.0.0** - allow multiple bulbs