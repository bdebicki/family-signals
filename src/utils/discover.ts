import {
  YeelightController,
  YeelightDevice,
} from '../tools/discover-yeelights.js'

const controller = new YeelightController()

console.log('Rozpoczynam wyszukiwanie urządzeń...')

const discoveryTimeout = 10000 // 10 sekund na odkrycie urządzeń

const discoveryPromise = controller.discoverDevices()
const timeoutPromise = new Promise<YeelightDevice[]>((_, reject) =>
  setTimeout(
    () => reject(new Error('Timeout podczas wyszukiwania urządzeń')),
    discoveryTimeout
  )
)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

Promise.race([discoveryPromise, timeoutPromise])
  .then(async (devices: YeelightDevice[]) => {
    console.log('Znalezione urządzenia:', devices)

    if (devices.length > 0) {
      const firstDevice = devices[0]
      console.log('Pierwsze urządzenie:', firstDevice)

      if (firstDevice.connected) {
        console.log('Urządzenie jest już połączone, rozpoczynam operacje')
        await performOperations(firstDevice)
      } else {
        console.log('Oczekiwanie na połączenie z urządzeniem...')
        firstDevice.once('connect', async () => {
          console.log('Połączono z urządzeniem')
          await performOperations(firstDevice)
        })
      }

      firstDevice.on('update', (props) => {
        console.log('Aktualizacja stanu urządzenia:', props)
      })

      firstDevice.on('error', (err) => {
        console.error('Błąd urządzenia:', err)
      })

      firstDevice.on('disconnect', () => {
        console.log('Urządzenie rozłączone')
        process.exit(0)
      })
    } else {
      console.log('Nie znaleziono żadnych urządzeń')
      process.exit(0)
    }
  })
  .catch((error) => {
    console.error('Wystąpił błąd:', error)
    process.exit(1)
  })

async function performOperations(device: YeelightDevice) {
  try {
    console.log('Próba włączenia urządzenia...')
    const turnOnResponse = await device.turnOn()
    console.log('Odpowiedź na włączenie:', turnOnResponse)
    await delay(4000)

    console.log('Próba ustawienia koloru na czerwony...')
    const setColorResponse = await device.setColor(255, 0, 0)
    console.log('Odpowiedź na ustawienie koloru:', setColorResponse)
    await delay(4000)

    console.log('Pobieranie nazwy urządzenia...')
    const name = await device.getName()
    console.log('Nazwa urządzenia:', name)

    console.log('Próba wyłączenia urządzenia...')
    const turnOffResponse = await device.turnOff()
    console.log('Odpowiedź na wyłączenie:', turnOffResponse)
    await delay(4000)

    console.log('Wszystkie operacje zakończone')
  } catch (error) {
    console.error('Wystąpił błąd podczas komunikacji z urządzeniem:', error)
  } finally {
    console.log('Zamykanie połączenia...')
    if ('close' in device && typeof device.close === 'function') {
      device.close()
    }
    console.log('Połączenie zamknięte')
    process.exit(0)
  }
}

// Dodajemy ogólny handler dla nieobsłużonych błędów
process.on('unhandledRejection', (reason) => {
  console.error('Nieobsłużone odrzucenie obietnicy:', reason)
  process.exit(1)
})

// Dodajemy handler dla sygnału SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Otrzymano sygnał SIGINT. Zamykanie aplikacji...')
  process.exit(0)
})
