import { YeelightController } from '../tools/discover-yeelights.js'

async function main() {
  const controller = new YeelightController()

  console.log('Discovering devices...')
  const devices = await controller.discoverDevices()

  if (devices.length === 0) {
    console.log('No devices found')
    return
  }

  console.log(`Found ${devices.length} device(s)`)

  const device = devices[0]
  console.log(`Connecting to device: ${device.name} (${device.id})`)

  try {
    await controller.connectToDevice(device.id)

    console.log('Turning on the device')
    await device.turnOn()

    console.log('Setting color to red')
    await device.setColor(255, 0, 0)

    console.log('Setting brightness to 50%')
    await device.setBrightness(50)

    console.log('Getting device name')
    const name = await device.getName()
    console.log(`Device name: ${name}`)

    console.log('Turning off the device')
    // await device.turnOff()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    device.close()
  }
}

main().catch(console.error)
