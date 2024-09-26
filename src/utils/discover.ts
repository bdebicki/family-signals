import { YeelightController } from '../tools/discover-yeelights.js'

async function main() {
  const controller = new YeelightController()
  const devices = await controller.discoverDevices()

  console.log('Znalezione urządzenia:', devices)

  if (devices.length > 0) {
    const firstDevice = devices[0]
    try {
      await firstDevice.turnOn()
      await firstDevice.setColor(255, 0, 0) // Ustawienie koloru na czerwony
      const name = await firstDevice.getName()
      console.log('Nazwa urządzenia:', name)
      // await firstDevice.setName('Nowa nazwa');
      // await firstDevice.turnOff()
    } catch (error) {
      console.error('Wystąpił błąd podczas komunikacji z urządzeniem:', error)
    }
  }
}

main().catch(console.error)
