import { padTime } from './patTime.js'

export const dateIsoWithTimezone = (date: Date) => {
  const year = date.getFullYear()
  const month = padTime(date.getMonth() + 1)
  const day = padTime(date.getDate())

  const hours = padTime(date.getHours())
  const minutes = padTime(date.getMinutes())
  const seconds = padTime(date.getSeconds())

  const timezoneOffset = date.getTimezoneOffset()
  const offsetHours = padTime(Math.abs(timezoneOffset) / 60)
  const offsetMinutes = padTime(Math.abs(timezoneOffset) % 60)
  const offsetDirection = timezoneOffset < 0 ? '+' : '-'
  const timezone = `${offsetDirection}${offsetHours}:${offsetMinutes}`

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezone}`
}
