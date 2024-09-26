import dgram from 'dgram'
import net from 'net'
import { EventEmitter } from 'events'

export interface YeelightDevice extends EventEmitter {
  name: string
  address: string
  port: number
  id: string
  model: string
  firmware_version: string
  supports: string[]
  connected: boolean
  power: string
  bright: number
  color_mode: number
  ct: number
  rgb: number
  hue: number
  sat: number
  turnOn: () => Promise<void>
  turnOff: () => Promise<void>
  setColor: (red: number, green: number, blue: number) => Promise<void>
  setName: (name: string) => Promise<void>
  getName: () => Promise<string>
  setBrightness: (brightness: number) => Promise<void>
  close: () => void
}

export class YeelightController {
  private devices: Map<string, YeelightDevice> = new Map()
  private socket: dgram.Socket

  constructor() {
    this.socket = dgram.createSocket('udp4')
  }

  async discoverDevices(timeout: number = 3000): Promise<YeelightDevice[]> {
    return new Promise((resolve) => {
      this.socket.bind(() => {
        this.socket.setBroadcast(true)
        const message = Buffer.from(
          'M-SEARCH * HTTP/1.1\r\n' +
            'HOST: 239.255.255.250:1982\r\n' +
            'MAN: "ssdp:discover"\r\n' +
            'ST: wifi_bulb\r\n'
        )

        this.socket.send(message, 0, message.length, 1982, '239.255.255.250')

        this.socket.on('message', (msg) => {
          const deviceInfo = this.parseDeviceInfo(msg.toString())
          if (deviceInfo && !this.devices.has(deviceInfo.id)) {
            this.devices.set(deviceInfo.id, deviceInfo)
            this.connectToDevice(deviceInfo)
          }
        })

        setTimeout(() => {
          this.socket.close()
          resolve(Array.from(this.devices.values()))
        }, timeout)
      })
    })
  }

  private parseDeviceInfo(message: string): YeelightDevice | null {
    const headers = message.split('\r\n').reduce(
      (acc, line) => {
        const [key, value] = line.split(': ')
        if (key && value) acc[key.toLowerCase()] = value
        return acc
      },
      {} as Record<string, string>
    )

    if (headers.id && headers.location) {
      const [address] = headers.location.split('//')[1].split(':')
      const device: YeelightDevice = new EventEmitter() as YeelightDevice
      device.id = headers.id
      device.name = headers.name || ''
      device.model = headers.model || ''
      device.firmware_version = headers.fw_ver || ''
      device.address = address
      device.port = 55443
      device.supports = headers.support ? headers.support.split(' ') : []
      device.connected = false
      device.power = 'off'
      device.bright = 100
      device.color_mode = 1
      device.ct = 4000
      device.rgb = 16777215
      device.hue = 0
      device.sat = 0

      device.turnOn = () =>
        this.sendCommand(device, 'set_power', ['on', 'smooth', 500])
      device.turnOff = () =>
        this.sendCommand(device, 'set_power', ['off', 'smooth', 500])
      device.setColor = (red, green, blue) =>
        this.sendCommand(device, 'set_rgb', [
          red * 65536 + green * 256 + blue,
          'smooth',
          500,
        ])
      device.setName = (name) => this.sendCommand(device, 'set_name', [name])
      device.getName = () =>
        this.sendCommand(device, 'get_prop', ['name']).then(
          (res) => res.result[0]
        )
      device.setBrightness = (brightness) =>
        this.sendCommand(device, 'set_bright', [brightness, 'smooth', 500])

      return device
    }
    return null
  }

  private connectToDevice(device: YeelightDevice) {
    const client = new net.Socket()
    let buffer = ''

    client.connect(device.port, device.address, () => {
      console.log(`Connected to ${device.address}:${device.port}`)
      device.connected = true
      device.emit('connect')
    })

    client.on('data', (data) => {
      buffer += data.toString()
      let newlineIndex
      while ((newlineIndex = buffer.indexOf('\r\n')) !== -1) {
        const message = buffer.slice(0, newlineIndex)
        buffer = buffer.slice(newlineIndex + 2)
        this.handleResponse(device, message)
      }
    })

    client.on('error', (err) => {
      console.error(
        `Connection error for ${device.address}:${device.port}:`,
        err.message
      )
      device.connected = false
      device.emit('error', err)
    })

    client.on('close', () => {
      console.log(`Connection closed for ${device.address}:${device.port}`)
      device.connected = false
      device.emit('disconnect')
    })
    ;(device as any).client = client
    ;(device as any).queue = {}

    device.close = () => {
      if ((device as any).client) {
        ;(device as any).client.end()
        ;(device as any).client.destroy()
      }
    }
  }

  private handleResponse(device: YeelightDevice, data: string) {
    try {
      const response = JSON.parse(data)
      console.log('Otrzymano odpowiedź:', response)
      if (response.method === 'props') {
        Object.assign(device, response.params)
        device.emit('update', response.params)
      } else if (response.id && (device as any).queue[response.id]) {
        ;(device as any).queue[response.id](response)
        delete (device as any).queue[response.id]
      }
    } catch (err) {
      console.error('Error parsing response:', err)
    }
  }

  private sendCommand(
    device: YeelightDevice,
    method: string,
    params: any[]
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!device.connected) {
        return reject(new Error('Device not connected'))
      }

      const id = Math.floor(Math.random() * 10000)
      const command = JSON.stringify({ id, method, params }) + '\r\n'
      console.log('Wysyłanie komendy:', command)
      ;(device as any).queue[id] = (res: any) => {
        if (res.error) {
          reject(new Error(res.error.message))
        } else {
          resolve(res)
        }
      }
      ;(device as any).client.write(command, (err: Error | null) => {
        if (err) {
          console.error('Błąd podczas wysyłania komendy:', err)
          delete (device as any).queue[id]
          reject(err)
        }
      })

      // Dodajemy timeout
      setTimeout(() => {
        if ((device as any).queue[id]) {
          delete (device as any).queue[id]
          reject(new Error('Command timeout'))
        }
      }, 5000)
    })
  }
}
