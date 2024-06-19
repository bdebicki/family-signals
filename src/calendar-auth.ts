import express from 'express'
import { google } from 'googleapis'
import { authUrl } from './utils/oauth-clients.js'
import { spawn } from 'node:child_process'

const app = express()
const port = 3000

const { OAuth2 } = google.auth
const oauth2Client = new OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET,
  process.env.OAUTH_YOUR_REDIRECT_URL
)

const url = authUrl(oauth2Client)

console.log('Authorize this app by visiting this url:', url)
spawn('open', [url])

app.get('/oauth2callback', (req, res) => {
  const code = req.query.code

  oauth2Client.getToken(code, (err, token) => {
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
    console.log('Token:', token)

    res.send('Authorization successful! You can close this window.')
    process.exit(0)
  })
})

app.listen(port)
