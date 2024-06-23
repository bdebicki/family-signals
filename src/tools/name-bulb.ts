import { getYeelights } from '../utils/get-yeelights.js'
import inquirer from 'inquirer'

let bulbIp: string
let bulbName: string
let bulbs: Array<any>

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
  console.log(`Looking for bulb with ${bulbIp} ip ...`)
  const resultBulb = bulbs.find(
    (bulb) => bulb.address === `yeelight://${bulbIp}:55443`
  )

  if (resultBulb) {
    setBulbName(resultBulb)
  } else {
    console.error(`The bulb with ${bulbIp} IP does not appear in network.`)
  }
}

const setBulbName = (bulb) => {
  bulb.set_name(bulbName)
  console.log('The bulb name has been set!')
}

console.log('Looking for bulbs in your network ...')

void (async () => {
  try {
    bulbs = await getYeelights()
    console.log('Discovered Yeelights:', bulbs.length)

    inquirer.prompt(questions).then((answers: { ip: string; name: string }) => {
      bulbIp = answers.ip
      bulbName = answers.name
      searchBulb()
      process.exit()
    })
  } catch (error) {
    console.error('Error discovering Yeelights:', error)
  }
})()
