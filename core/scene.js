import {
  registerActions,
  handleKeyDown,
  handleKeyUp,
} from './controller'
import Client from './networking/client'

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
  }
}

export default Scene
