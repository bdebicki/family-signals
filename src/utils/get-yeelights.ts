import Yeelight from 'yeelight2'
import { throwMsg } from './throw-msg.js'

export const getYeelights = async (): Promise<Array<unknown>> => {
  throwMsg('discovery bulbs', true)
  return new Promise(function (resolve, reject) {
    const bulbs: Array<unknown> = []

    Yeelight.discover(function (bulb: unknown) {
      bulbs.push(bulb)

      setTimeout(() => {
        this.close()

        if (bulbs.length > 0) {
          resolve(bulbs)
        } else {
          reject((error) => {
            bulbs.forEach((b) => b.exit())

            throwMsg(
              `bulbs discovering has been failed because of an error:\n${error}`,
              true
            )
          })
        }
      }, 5000)
    })
  })
}
