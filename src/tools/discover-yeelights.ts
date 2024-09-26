import dgram from 'dgram'
import net from 'net'
import { EventEmitter } from 'events'

export class YeelightDevice extends EventEmitter {
  private client: net.Socket | null = null
  public connected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 5000 // 5 seconds

  constructor(
    public readonly id: string,
    public readonly address: string,
    public readonly port: number,
    public name: string,
    public power: 'on' | 'off' = 'off',
    public bright: number = 100,
    public colorMode: number = 1,
    public ct: number = 4000,
    public rgb: number = 16777215,
    public hue: number = 0,
    public sat: number = 0
  ) {
    super()
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new net.Socket()

      const connectHandler = () => {
        this.connected = true
        this.reconnectAttempts = 0
        this.emit('connect')
        resolve()
      }

      const errorHandler = (error: Error) => {
        this.emit('error', error)
        if (!this.connected) {
          reject(error)
        }
      }

      const closeHandler = () => {
        this.connected = false
        this.emit('disconnect')
        this.reconnect()
      }

      this.client.on('connect', connectHandler)
      this.client.on('error', errorHandler)
      this.client.on('close', closeHandler)
      this.client.on('data', (data) => this.handleResponse(data.toString()))

      this.client.connect(this.port, this.address)
    })
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      )
      setTimeout(() => this.connect(), this.reconnectInterval)
    } else {
      console.log('Max reconnection attempts reached. Giving up.')
      this.emit('reconnect_failed')
    }
  }

  private handleResponse(data: string) {
    const responses = data.split('\r\n').filter((line) => line.trim() !== '')
    for (const response of responses) {
      try {
        const parsedResponse = JSON.parse(response)
        if (parsedResponse.method === 'props') {
          Object.assign(this, parsedResponse.params)
          this.emit('update', parsedResponse.params)
        }
        this.emit('response', parsedResponse)
      } catch (error) {
        console.error('Error parsing response:', error)
      }
    }
  }

  async sendCommand(method: string, params: any[]): Promise<any> {
    if (!this.connected || !this.client) {
      throw new Error('Device not connected')
    }

    return new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 10000)
      const command = JSON.stringify({ id, method, params }) + '\r\n'

      const timeout = setTimeout(() => {
        this.removeListener('response', responseHandler)
        reject(new Error('Command timeout'))
      }, 5000)

      const responseHandler = (response: any) => {
        if (response.id === id) {
          clearTimeout(timeout)
          this.removeListener('response', responseHandler)
          if (response.error) {
            reject(new Error(response.error.message))
          } else {
            resolve(response.result)
          }
        }
      }

      this.on('response', responseHandler)
      this.client.write(command, (error) => {
        if (error) {
          clearTimeout(timeout)
          this.removeListener('response', responseHandler)
          reject(error)
        }
      })
    })
  }

  // Device control methods
  async turnOn(): Promise<void> {
    await this.sendCommand('set_power', ['on', 'smooth', 500])
  }

  async turnOff(): Promise<void> {
    await this.sendCommand('set_power', ['off', 'smooth', 500])
  }

  async setColor(red: number, green: number, blue: number): Promise<void> {
    const rgb = (red << 16) | (green << 8) | blue
    await this.sendCommand('set_rgb', [rgb, 'smooth', 500])
  }

  async setBrightness(brightness: number): Promise<void> {
    await this.sendCommand('set_bright', [brightness, 'smooth', 500])
  }

  async setName(name: string): Promise<void> {
    await this.sendCommand('set_name', [name])
    this.name = name
  }

  async getName(): Promise<string> {
    const result = await this.sendCommand('get_prop', ['name'])
    return result[0]
  }

  close() {
    if (this.client) {
      this.client.destroy()
      this.client = null
    }
    this.connected = false
  }
}

export class YeelightController {
  private devices: Map<string, YeelightDevice> = new Map()
  private discoverySocket: dgram.Socket

  constructor() {
    this.discoverySocket = dgram.createSocket('udp4')
  }

  async discoverDevices(timeout: number = 3000): Promise<YeelightDevice[]> {
    return new Promise((resolve) => {
      this.discoverySocket.bind(() => {
        this.discoverySocket.setBroadcast(true)
        const message = Buffer.from(
          'M-SEARCH * HTTP/1.1\r\n' +
            'HOST: 239.255.255.250:1982\r\n' +
            'MAN: "ssdp:discover"\r\n' +
            'ST: wifi_bulb\r\n'
        )

        this.discoverySocket.send(
          message,
          0,
          message.length,
          1982,
          '239.255.255.250'
        )

        this.discoverySocket.on('message', (msg) => {
          const deviceInfo = this.parseDiscoveryResponse(msg.toString())
          if (deviceInfo && !this.devices.has(deviceInfo.id)) {
            const device = new YeelightDevice(
              deviceInfo.id,
              deviceInfo.address,
              deviceInfo.port,
              deviceInfo.name
            )
            this.devices.set(device.id, device)
          }
        })

        setTimeout(() => {
          this.discoverySocket.close()
          resolve(Array.from(this.devices.values()))
        }, timeout)
      })
    })
  }

  private parseDiscoveryResponse(message: string): any {
    const headers = message.split('\r\n').reduce(
      (acc, line) => {
        const [key, value] = line.split(': ')
        if (key && value) acc[key.toLowerCase()] = value
        return acc
      },
      {} as Record<string, string>
    )

    if (headers.id && headers.location) {
      const [address, port] = headers.location.split('//')[1].split(':')
      return {
        id: headers.id,
        address: address,
        port: parseInt(port, 10),
        name: headers.name || '',
      }
    }
    return null
  }

  async connectToDevice(deviceId: string): Promise<YeelightDevice> {
    const device = this.devices.get(deviceId)
    if (!device) {
      throw new Error('Device not found')
    }

    device.on('disconnect', () => {
      console.log(`Device ${deviceId} disconnected. Attempting to reconnect...`)
    })

    device.on('reconnect_failed', () => {
      console.log(
        `Failed to reconnect to device ${deviceId}. Removing from active devices.`
      )
      this.devices.delete(deviceId)
    })

    await device.connect()
    return device
  }

  getDevice(deviceId: string): YeelightDevice | undefined {
    return this.devices.get(deviceId)
  }

  getAllDevices(): YeelightDevice[] {
    return Array.from(this.devices.values())
  }
}
