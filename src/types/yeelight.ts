import type { Light as LightBase } from 'yeelight2'

export type Light = LightBase & {
  address: `yeelight://${string}:55443`
}
