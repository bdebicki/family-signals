import Yeelight from 'yeelight2'
import { throwMsg } from './throw-msg.js'

export const getYeelights = async (): Promise<Array<unknown>> => {
  throwMsg('discovery bulbs', true)
  return new Promise((resolve) => {
    const bulbs: Array<unknown> = []

    Yeelight.discover(function (bulb: unknown) {
      bulbs.push(bulb)

      setTimeout(() => {
        this.close()
        resolve(bulbs)
      }, 5000)
    })
  })
}
