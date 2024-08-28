import { Light } from '../types/yeelight.js'
import { YEELIGHT_BULB_NAME } from '../constants/env.js'
import { throwMsg } from './throw-msg.js'

class MockLight {
  name: string
  power: 'on' | 'off' = 'off'

  constructor(name: string) {
    this.name = name
  }

  async set_power(state: 'on' | 'off') {
    this.power = state
    throwMsg(`MockLight ${this.name} power set to ${state}`)
  }

  exit() {
    throwMsg(`MockLight ${this.name} exited`)
  }
}

export const getMockedYeelights = async (): Promise<Array<Light>> => {
  throwMsg('discovery bulbs (mocked)', true)
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockBulbs = [
        new MockLight(YEELIGHT_BULB_NAME),
        new MockLight('Other Bulb'),
      ]
      resolve(mockBulbs as unknown as Array<Light>)
    }, 1000) // Symulacja opóźnienia sieciowego
  })
}
