import Yeelight from 'yeelight2'
import type { Light } from '../types/yeelight.js'
import { throwMsg } from './throw-msg.js'

export const getYeelights = async (): Promise<Array<Light>> => {
  throwMsg('discovery bulbs', true)
  return new Promise(function (resolve, reject) {
    const bulbs: Array<Light> = []

    Yeelight.discover(function (bulb: Light) {
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
