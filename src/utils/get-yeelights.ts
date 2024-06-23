import Yeelight from 'yeelight2'

export const getYeelights = async (): Promise<Array<unknown>> => {
  return new Promise((resolve) => {
    const bulbs: Array<unknown> = []

    Yeelight.discover((bulb: unknown) => {
      bulbs.push(bulb)
    })

    setTimeout(() => {
      resolve(bulbs)
    }, 5000)
  })
}
