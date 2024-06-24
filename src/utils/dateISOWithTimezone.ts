export const dateISOWithTimezone = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, '0')

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDay())

  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  const timezoneOffset = date.getTimezoneOffset()
  const offsetHours = pad(Math.abs(timezoneOffset) / 60)
  const offsetMinutes = pad(Math.abs(timezoneOffset) % 60)
  const offsetDirection = timezoneOffset < 0 ? '+' : '-'
  const timezone = `${offsetDirection}${offsetHours}:${offsetMinutes}`

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timezone}`
}
