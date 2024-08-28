import Yeelight from 'yeelight2'
import { EventEmitter } from 'events'
import type { Light } from '../types/yeelight.js'
import { throwError, throwMsg } from './throw-msg.js'

type Bulb = Light & EventEmitter
type Bulbs = Array<Bulb>
type BulbsCache = Array<Light>

let bulbsCache: BulbsCache = []
let isDiscovering = false

const waitForDiscovery = (): Promise<void> =>
  new Promise((resolve) => {
    const interval = setInterval(() => {
      if (!isDiscovering) {
        clearInterval(interval)
        resolve()
      }
    }, 500)
  })

const discoverBulbs = (): Promise<Bulbs> =>
  new Promise((resolve, reject) => {
    const bulbs: Bulbs = []

    Yeelight.discover((bulb: Bulb) => {
      bulbs.push(bulb)

      bulb.on('error', (error) => {
        throwError(`Error with Yeelight: ${error}`)
      })
    })

    setTimeout(() => {
      if (bulbs.length > 0) {
        resolve(bulbs)
      } else {
        reject(() => throwError('No bulbs found'))
      }
    }, 5000)
  })

export const getYeelights = async (): Promise<BulbsCache> => {
  if (bulbsCache.length > 0) {
    throwMsg('Using cached bulbs', true)

    return bulbsCache
  }

  if (isDiscovering) {
    throwMsg('Discovery in progress, please wait', true)

    await waitForDiscovery()

    return bulbsCache
  }

  throwMsg('Discovering bulbs', true)
  isDiscovering = true

  try {
    const bulbs = await discoverBulbs()
    if (bulbs.length > 0) {
      bulbsCache = bulbs

      throwMsg(
        `Discovered ${bulbs.length} bulb${bulbs.length !== 1 ? 's' : ''}`,
        true
      )
    } else {
      throwError('No bulbs found')
    }
    return bulbs
  } finally {
    isDiscovering = false
  }
}
