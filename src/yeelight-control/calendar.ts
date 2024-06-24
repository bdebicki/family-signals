import { google } from 'googleapis'
import type { Auth } from 'googleapis'
import {
  OAUTH_ACCESS_TOKEN,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REFRESH_TOKEN,
  OAUTH_YOUR_REDIRECT_URL,
} from '../constants/env.js'
import { dateISOWithTimezone } from '../utils/dateISOWithTimezone.js'

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

const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

export const checkCalendarEvents = async () => {
  try {
    const date = dateISOWithTimezone(new Date())
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: date,
      maxResults: 1,
      singleEvents: true,
      orderBy: 'startTime',
    })

    const { start, end, status, eventType, summary } = res.data.items[0]

    // status === 'confirmed
    // eventType === 'default'

    console.log({ date, start, end })

    return res.data.items[0]
  } catch (error) {
    console.error('Error checking calendar events:', error)
  }

  return false
}

checkCalendarEvents()
