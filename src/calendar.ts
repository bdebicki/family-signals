import { google } from 'googleapis'
import type { Auth } from 'googleapis'
import {
  OAUTH_ACCESS_TOKEN,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REFRESH_TOKEN,
  OAUTH_YOUR_REDIRECT_URL,
} from './constants/env.js'

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
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 1,
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events = res.data.items
    return events.length > 0
  } catch (error) {
    console.error('Error checking calendar events:', error)
  }

  return false
}

checkCalendarEvents()
