import Yeelight from 'yeelight2'
import { EventEmitter } from 'events'
import type { Light } from '../types/yeelight.js'
import { throwError, throwMsg } from './throw-msg.js'

type Bulb = Light & EventEmitter

let bulbsCache: Array<Light> = []
let isDiscovering = false

export const getYeelights = async (): Promise<Array<Light>> => {
  if (bulbsCache.length > 0) {
    throwMsg('Using cached bulbs', true)
    return bulbsCache
  }

  if (isDiscovering) {
    throwMsg('Discovery in progress, please wait', true)

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!isDiscovering) {
          clearInterval(interval)
          resolve(bulbsCache)
        }
      }, 500)
    })
  }

  throwMsg('Discovering bulbs', true)
  isDiscovering = true

  return new Promise((resolve, reject) => {
    const bulbs: Array<Bulb> = []

    Yeelight.discover((bulb: Bulb) => {
      bulbs.push(bulb)

      bulb.on('error', (error) => {
        throwError(`Error with Yeelight: ${error}`)
      })
    })

    setTimeout(() => {
      isDiscovering = false

      if (bulbs.length > 0) {
        bulbsCache = bulbs

        throwMsg(
          `Discovered ${bulbs.length} bulb${bulbs.length !== 1 ? 's' : ''}`,
          true
        )
        resolve(bulbs)
      } else {
        reject(() => throwError('No bulbs found'))
      }
    }, 5000)
  })
}
