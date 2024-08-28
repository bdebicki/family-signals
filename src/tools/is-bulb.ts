import { getYeelights } from '../utils/get-yeelights.js'
import { Light } from '../types/yeelight.js'
import { YEELIGHT_BULB_NAME } from '../constants/env.js'
import { throwMsg } from '../utils/throw-msg.js'

void (async () => {
  const bulbsInLan: Array<Light> = await getYeelights()
  let msg: string = ''

  bulbsInLan.find((bulb) =>
    bulb.name === YEELIGHT_BULB_NAME
      ? (msg = `The ${YEELIGHT_BULB_NAME} is available in network`)
      : (msg = `There is no bulb called ${YEELIGHT_BULB_NAME}. Check does it is turned on or run npm run tool:name-bulb`)
  )

  throwMsg(msg)
  return
})()
