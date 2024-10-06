import express from 'express'
import type { Request, Response } from 'express'
import { Auth, google } from 'googleapis'
import { authUrl } from '../utils/oauth-clients.js'
import { spawn } from 'node:child_process'
import {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_YOUR_REDIRECT_URL,
} from '../constants/env.js'
import { throwError, throwMsg } from '../utils/throw-msg.js'

const app = express()
const port = 3000

const { OAuth2 } = google.auth
const oauth2Client: Auth.OAuth2Client = new OAuth2(
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_YOUR_REDIRECT_URL
)

const url = authUrl(oauth2Client)

throwMsg('Opening a page to authorize application with google calendar.')
throwMsg('Follow instructions displayed on a page.')
throwMsg(url)
spawn('open', [url])

app.get('/oauth2callback', (req: Request, res: Response) => {
  const code = req.query.code

  oauth2Client.getToken(
    code,
    (err: Auth.gaxios.GaxiosError, token: Auth.Credentials) => {
      if (err) {
        throwError(
          `Error retrieving access token: ${err.response ? err.response.data : err}`
        )
        return res
          .status(400)
          .send(
            'Error retrieving access token: ' +
              (err.response ? err.response.data : err.message)
          )
      }

      oauth2Client.setCredentials(token)

      throwMsg('\nAuthorization successful!')
      throwMsg(`Your tokens are: {
        access_token: ${token.access_token},
        refresh_token: ${token.refresh_token},
      }`)

      res.send(`Authorization successful! You can close this window.
      <br />Your tokens are:
        <br />- access_token: ${token.access_token},
        <br />- refresh_token: ${token.refresh_token},`)
      process.exit(0)
    }
  )
})

app.listen(port)
