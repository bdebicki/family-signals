import type { Light } from '../types/yeelight.js'
import { getYeelights } from '../utils/get-yeelights.js'
import { getMockedYeelights } from '../utils/mock-yeelights.js'
import { YEELIGHT_BULB_NAME } from '../constants/env.js'
import { throwError, throwMsg } from '../utils/throw-msg.js'
import { getTime } from '../utils/time.js'
import { checkCalendarEvents } from './calendar.js'
import { isMocked } from '../utils/parameters.js'

let signalBulb: Light

async function manageCalendar() {
  const { isOngoing, title, startDate } = await checkCalendarEvents()

  if (!signalBulb) {
    console.log('nie ma bulb szukam')
    manageBulb()
  } else {
    if (isOngoing) {
      throwMsg(`ongoing meeting: ${title}`, true)
      await signalBulb.set_power('on')
    } else {
      throwMsg(`upcoming meeting: "${title}" at ${startDate}`, true)
      await signalBulb.set_power('off')
    }
  }
  setTimeout(manageCalendar, 10000)
}

async function manageBulb() {
  try {
    const bulbs: Array<Light> = isMocked
      ? await getMockedYeelights()
      : await getYeelights()
    signalBulb = bulbs.find(({ name }) => name === YEELIGHT_BULB_NAME)

    if (!signalBulb) {
      throwError(`The bulb with name ${YEELIGHT_BULB_NAME} not found`)
      throwError(`Check does it turned on`)
      bulbs.forEach((b) => b.exit())

      return
    }

    throwMsg(`the ${YEELIGHT_BULB_NAME} has been found`, true)
  } catch (error) {
    throwError('Something went wrong while discovering bulbs')
    throwError(error)
  }
}

export async function manageSignals() {
  throwMsg(`[${getTime()}] Manage signalisation`)

  manageBulb()
  manageCalendar()
}
