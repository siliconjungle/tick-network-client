import {
  registerActions,
  handleKeyDown,
  handleKeyUp,
} from './controller'
import Client from './networking/client'
import { MAX_HISTORY } from './networking/messages'

class Scene {
  init (canvas) {
    registerActions([
      {
        name: 'left',
        keycode: '65', // a
      },
      {
        name: 'right',
        keycode: '68', // d
      },
      {
        name: 'up',
        keycode: '87', // w
      },
      {
        name: 'down',
        keycode: '83', // s
      },
    ])

    canvas.addEventListener('keydown', (e) => {
      handleKeyDown(e)
    }, false)

    canvas.addEventListener('keyup', e => {
      handleKeyUp(e)
    }, false)

    const client = new Client()
    client.init()
    this.client = client
  }

  shutdown () {
    this.client?.shutdown()
  }

  update (dt) {

  }

  render (canvas, context) {
    context.fillStyle = 'black'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = 'white'
    context.font = '18px Arial'
    const avgLatency = this.client?.roundTrips.getAverageRoundTripTime().toFixed(2) || 0
    const latency = this.client?.roundTrips.getLatestRoundTripTime().toFixed(2) || 0
    context.fillText(`Average latency: ${avgLatency}`, 10, 30)
    context.fillText(`Latency: ${latency}`, 10, 60)

    context.lineWidth = 2
    context.strokeStyle = 'green'
    const startX = 10
    const startY = 85
    const width = 200
    const height = 50
    const step = width / MAX_HISTORY
    const history = this.client?.roundTrips.getHistory() || []
    const scale = height / history.reduce((acc, val) => Math.max(acc, val), 0)
    context.beginPath()
    context.moveTo(startX, (history[0] || 0) * scale + startY)
    for (let i = 1; i < history.length; i++) {
      context.lineTo(startX + step * i, history[i] * scale + startY)
    }
    context.stroke()
  }
}

export default Scene
