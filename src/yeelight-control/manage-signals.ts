import Yeelight from 'yeelight2'
import { getYeelights } from '../utils/get-yeelights.js'
import { YEELIGHT_BULB_NAME } from '../constants/env.js'
import { throwMsg } from '../utils/throw-msg.js'
import { getTime } from '../utils/time.js'
import { checkCalendarEvents } from './calendar.js'

let signalBulb

async function manageCalendar() {
  const { isOngoing, title, startDate } = await checkCalendarEvents()

  if (isOngoing) {
    throwMsg(`ongoing meeting: ${title}`, true)
    await signalBulb.set_power('on')
  } else {
    throwMsg(`upcoming meeting: "${title}" at ${startDate}`, true)
    await signalBulb.set_power('off')
  }

  setTimeout(manageCalendar, 10000)
}

export async function manageSignals() {
  throwMsg(`[${getTime()}] Manage signalisation`)

  try {
    const bulbs: Array<Yeelight> = await getYeelights()
    signalBulb = bulbs.find(({ name }) => name === YEELIGHT_BULB_NAME)

    if (!signalBulb) {
      console.error(`The bulb with name ${YEELIGHT_BULB_NAME} not found`)
      console.error(`Check does it turned on`)
      bulbs.forEach((b) => b.exit())

      return
    }

    throwMsg(`the ${YEELIGHT_BULB_NAME} has been found`, true)

    manageCalendar()
  } catch (error) {
    console.error('Something went wrong while discovering bulbs')
    console.error(error)
  }
}
