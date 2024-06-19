import { Auth } from 'googleapis'

export const authUrl = (client: Auth.OAuth2Client) =>
  client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
  })
