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
import { throwError } from '../utils/throw-msg.js'

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
    throwError(`Error checking calendar events: ${error}`)
  }

  return { isOngoing: false }
}
