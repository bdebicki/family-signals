import type { Auth } from 'googleapis'
import { google } from 'googleapis'
import {
  OAUTH_ACCESS_TOKEN,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REFRESH_TOKEN,
  OAUTH_YOUR_REDIRECT_URL,
} from '../constants/env.js'
import { time } from '../utils/time.js'
import { throwError, throwMsg } from '../utils/throw-msg.js'
import { exec } from 'node:child_process'

type Event = {
  start: { dateTime: string }
  end: { dateTime: string }
  status: 'confirmed' // 'rejected' | 'not accepted'
  summary: string
}

const { OAuth2 } = google.auth

const oauth2Client: Auth.OAuth2Client = new OAuth2(
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_YOUR_REDIRECT_URL
)
oauth2Client.setCredentials({
  access_token: OAUTH_ACCESS_TOKEN,
  refresh_token: OAUTH_REFRESH_TOKEN,
})

const minInMs = 60000
const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

export const checkCalendarEvents = async () => {
  try {
    const date = time(new Date())
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: date,
      eventTypes: ['default'],
      maxResults: 1,
      singleEvents: true,
      orderBy: 'startTime',
    })

    const {
      start: { dateTime: startDate },
      end: { dateTime: endDate },
      status,
      summary: title,
    } = res.data.items[0] as Event

    const isOngoing =
      status === 'confirmed' &&
      new Date(startDate).getTime() - minInMs < new Date(date).getTime() &&
      new Date(endDate).getTime() + minInMs > new Date(date).getTime()

    return { isOngoing, title, startDate, endDate }
  } catch (error) {
    const {
      response: {
        data: { error: type, error_description: msg },
      },
    } = error

    if (type === 'invalid_grant') {
      if (!OAUTH_ACCESS_TOKEN) {
        throwError('You have to generate google calendar credential first.')
      } else {
        throwError('Your google calendar credentials are outdated.')
      }

      throwMsg('Opening a page to authorize application with google calendar.')
      throwMsg('Follow instructions displayed on a page and run program again.')

      exec('npm run tool:auth-calendar')
      process.exit()
    } else {
      throwError(`Error checking calendar events: ${msg}`)
    }
  }

  return { isOngoing: false }
}
