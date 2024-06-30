import Yeelight from 'yeelight2'
import { throwMsg } from './throw-msg.js'

export const getYeelights = async (): Promise<Array<unknown>> => {
  throwMsg('discovery bulbs', true)
  return new Promise((resolve, reject) => {
    const bulbs: Array<unknown> = []

    Yeelight.discover(function (bulb: unknown) {
      bulbs.push(bulb)

      setTimeout(() => {
        if (bulbs.length > 0) {
          this.close()
          resolve(bulbs)
        } else {
          reject((error) =>
            throwMsg(
              `bulbs discovering has been failed because of an error:\n${error}`,
              true
            )
          )
        }
      }, 5000)
    })
  })
}
