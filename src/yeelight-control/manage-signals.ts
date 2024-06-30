import { checkCalendarEvents } from './calendar.js'
import { YEELIGHT_BULB_NAME } from '../constants/env.js'
import { getYeelights } from '../utils/get-yeelights.js'
import { throwMsg } from '../utils/throw-msg.js'
import { padTime } from '../utils/patTime.js'

export const manageSignals = async () => {
  const date = new Date()
  throwMsg(
    `[${padTime(date.getHours())}:${padTime(date.getMinutes())}:${padTime(date.getSeconds())}] Manage signalisation`
  )

  try {
    const bulbs: Array<unknown> = await getYeelights()

    const signalBulb = bulbs.find(({ name }) => name === YEELIGHT_BULB_NAME)

    if (!signalBulb) {
      console.error(`The bulb with name ${YEELIGHT_BULB_NAME} not found`)
      console.error(`Check does it turned on`)

      return
    }

    throwMsg(`the ${YEELIGHT_BULB_NAME} has been found`, true)

    const { isOngoing, title, startDate } = await checkCalendarEvents()

    if (isOngoing) {
      throwMsg(`ongoing meeting: ${title}`)
      await signalBulb.set_power('on')
    } else {
      throwMsg(`upcoming meeting: ${title} at ${startDate}`, true)
      await signalBulb.set_power('off')
    }
  } catch (error) {
    console.error('Something went wrong')
    console.error(error)
  }

  setTimeout(manageSignals, 10000)
}
