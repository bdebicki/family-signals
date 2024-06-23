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

const app = express()
const port = 3000

const { OAuth2 } = google.auth
const oauth2Client: Auth.OAuth2Client = new OAuth2(
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_YOUR_REDIRECT_URL
)

const url = authUrl(oauth2Client)

console.log('Opening a page to authorize application with google calendar.')
console.log('Follow instructions displayed on a page.')
console.log(url)
spawn('open', [url])

app.get('/oauth2callback', (req: Request, res: Response) => {
  const code = req.query.code

  oauth2Client.getToken(
    code,
    (err: Auth.gaxios.GaxiosError, token: Auth.Credentials) => {
      if (err) {
        console.error(
          'Error retrieving access token:',
          err.response ? err.response.data : err
        )
        return res
          .status(400)
          .send(
            'Error retrieving access token: ' +
              (err.response ? err.response.data : err.message)
          )
      }

      oauth2Client.setCredentials(token)

      console.log('\nAuthorization successful!')
      console.log('Your tokens are:', {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
      })

      res.send('Authorization successful! You can close this window.')
      process.exit(0)
    }
  )
})

app.listen(port)
