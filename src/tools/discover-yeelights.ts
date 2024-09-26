import dgram from 'dgram'
import net from 'net'

interface YeelightDevice {
  name: string
  address: string
  port: number
  id: string
  turnOn: () => Promise<void>
  turnOff: () => Promise<void>
  setColor: (red: number, green: number, blue: number) => Promise<void>
  setName: (name: string) => Promise<void>
  getName: () => Promise<string>
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

        this.socket.on('message', (msg, rinfo) => {
          const deviceInfo = this.parseDeviceInfo(msg.toString(), rinfo)
          if (deviceInfo) {
            this.devices.set(deviceInfo.id, deviceInfo)
          }
        })

        setTimeout(() => {
          this.socket.close()
          resolve(Array.from(this.devices.values()))
        }, timeout)
      })
    })
  }

  private parseDeviceInfo(
    message: string,
    rinfo: dgram.RemoteInfo
  ): YeelightDevice | null {
    const lines = message.split('\r\n')
    const deviceInfo: Partial<YeelightDevice> = {
      address: rinfo.address,
      port: rinfo.port,
    }

    for (const line of lines) {
      if (line.startsWith('id:')) deviceInfo.id = line.split(':')[1].trim()
      if (line.startsWith('name:')) deviceInfo.name = line.split(':')[1].trim()
    }

    if (deviceInfo.id && deviceInfo.name) {
      return {
        ...(deviceInfo as YeelightDevice),
        turnOn: async () => {
          await this.sendCommand(
            deviceInfo.address!,
            // deviceInfo.port!,
            '{"id":1,"method":"set_power","params":["on","smooth",500]}'
          )
        },
        turnOff: async () => {
          await this.sendCommand(
            deviceInfo.address!,
            // deviceInfo.port!,
            '{"id":1,"method":"set_power","params":["off","smooth",500]}'
          )
        },
        setColor: async (red: number, green: number, blue: number) => {
          await this.sendCommand(
            deviceInfo.address!,
            // deviceInfo.port!,
            `{"id":1,"method":"set_rgb","params":[${red * 65536 + green * 256 + blue}, "smooth", 500]}`
          )
        },
        setName: async (name: string) => {
          await this.sendCommand(
            deviceInfo.address!,
            // deviceInfo.port!,
            `{"id":1,"method":"set_name","params":["${name}"]}`
          )
        },
        getName: async () => {
          const response = await this.sendCommand(
            deviceInfo.address!,
            // deviceInfo.port!,
            '{"id":1,"method":"get_prop","params":["name"]}'
          )
          return JSON.parse(response).result[0]
        },
      }
    }

    return null
  }

  private async sendCommand(
    address: string,
    // port: number,
    command: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(`Próba połączenia z ${address}:55443`)
      const client = new net.Socket()
      client.setTimeout(5000) // Ustawiamy timeout na 5 sekund

      client.connect(55443, address, () => {
        console.log(`Połączono z ${address}:55443`)
        client.write(command + '\r\n')
      })

      client.on('data', (data) => {
        console.log(`Otrzymano odpowiedź: ${data.toString()}`)
        resolve(data.toString())
        client.destroy()
      })

      client.on('error', (err) => {
        console.error(`Błąd połączenia: ${err.message}`)
        reject(err)
        client.destroy()
      })

      client.on('timeout', () => {
        console.error('Timeout połączenia')
        client.destroy()
        reject(new Error('Connection timeout'))
      })
    })
  }
}
