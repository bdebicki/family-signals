import Yeelight from 'yeelight2'
import { EventEmitter } from 'events'
import type { Light } from '../types/yeelight.js'
import { throwMsg } from './throw-msg.js'

// Global variables to cache bulbs and track discovery state
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
    const bulbs: Array<Light & EventEmitter> = [] // Make sure bulb is typed as EventEmitter

    // Start SSDP discovery for Yeelight bulbs
    Yeelight.discover((bulb: Light & EventEmitter) => {
      // Ensure bulb is an EventEmitter
      bulbs.push(bulb)
      bulb.on('error', (err) => {
        console.error('Error with Yeelight:', err)
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
        reject(new Error('No bulbs found'))
      }
    }, 5000)
  })
}
