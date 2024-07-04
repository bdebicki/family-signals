import { getYeelights } from '../utils/get-yeelights.js'
import inquirer from 'inquirer'
import type { Light } from '../types/yeelight.js'
import { throwError, throwMsg } from '../utils/throw-msg.js'

let bulbIp: string
let bulbName: string
let bulbs: Array<Light>

const questions = [
  {
    type: 'input',
    name: 'ip',
    message: "What's the light ip?",
  },
  {
    type: 'input',
    name: 'name',
    message: 'What name should I give to it?',
  },
]

const searchBulb = () => {
  throwMsg(`Looking for bulb with ${bulbIp} ip ...`)
  const resultBulb = bulbs.find(
    (bulb) => bulb.address === `yeelight://${bulbIp}:55443`
  )

  if (resultBulb) {
    setBulbName(resultBulb)
  } else {
    throwError(`The bulb with ${bulbIp} IP does not appear in network.`)
  }
}

const setBulbName = (bulb) => {
  bulb.set_name(bulbName)
  throwMsg('The bulb name has been set!')
}

throwMsg('Looking for bulbs in your network ...')

void (async () => {
  try {
    bulbs = await getYeelights()
    throwMsg(`Discovered Yeelights: ${bulbs.length}`)

    inquirer.prompt(questions).then((answers: { ip: string; name: string }) => {
      bulbIp = answers.ip
      bulbName = answers.name
      searchBulb()
      process.exit()
    })
  } catch (error) {
    throwError(`Error discovering Yeelights: ${error}`)
  }
})()
