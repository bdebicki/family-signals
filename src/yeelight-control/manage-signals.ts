import { checkCalendarEvents } from './calendar.js'
import { YEELIGHT_BULB_NAME } from '../constants/env.js'
import { getYeelights } from '../utils/get-yeelights.js'

export const manageSignals = async () => {
  console.log('manage signals')

  try {
    const bulbs: Array<unknown> = await getYeelights()

    const signalBulb = bulbs.find(({ name }) => name === YEELIGHT_BULB_NAME)

    if (!signalBulb) {
      console.error(`The bulb with name ${YEELIGHT_BULB_NAME} not found`)
      console.error(`Check does it turned on`)

      return
    }

    const { isOngoing, title, startDate, endDate } = await checkCalendarEvents()

    console.log({ isOngoing, title, startDate, endDate })
  } catch (error) {
    console.error('Something went wrong')
    console.error(error)
  }
}
