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

    const averageLatency = this.client?.roundTrips.getAverageRoundTripTime().toFixed(2) || 0
    const latency = this.client?.roundTrips.getLatestRoundTripTime().toFixed(2) || 0
    const latencyHistory = this.client?.roundTrips.getHistory() || []
    renderMetric(
      context,
      'Latency',
      'ms',
      latency,
      averageLatency,
      latencyHistory,
      { x: 10, y: 30 }
    )

    const averageSentSize = this.client?.localMessageSizes.getAverageMessageSize().toFixed(2) || 0
    const latestSentSize = this.client?.localMessageSizes.getLatestMessageSize() || 0
    const sentHistory = this.client?.localMessageSizes.getHistory() || []

    renderMetric(
      context,
      'Sent message size',
      'bytes',
      latestSentSize,
      averageSentSize,
      sentHistory,
      { x: 10, y: 170 }
    )

    const averageReceivedSize = this.client?.serverMessageSizes.getAverageMessageSize().toFixed(2) || 0
    const latestReceivedSize = this.client?.serverMessageSizes.getLatestMessageSize() || 0
    const receivedHistory = this.client?.serverMessageSizes.getHistory() || []

    renderMetric(
      context,
      'Received message size',
      'bytes',
      latestReceivedSize,
      averageReceivedSize,
      receivedHistory,
      { x: 10, y: 310 }
    )
  }
}

const renderMetric = (context, name, suffix, latest, average, history, position) => {
  context.fillText(`Average ${name}: ${average} ${suffix}`, position.x, position.y)
  context.fillText(`${name}: ${latest} ${suffix}`, position.x, position.y + 30)

  context.lineWidth = 2
  context.strokeStyle = 'green'

  const startY = position.y + 45
  const width = 200
  const height = 50
  const step = width / MAX_HISTORY
  const scale = height / history.reduce((acc, val) => Math.max(acc, val), 0)
  
  context.beginPath()
  context.moveTo(position.x, (history[0] || 0) * scale + startY)
  for (let i = 1; i < history.length; i++) {
    context.lineTo(position.x + step * i, history[i] * scale + startY)
  }
  context.stroke()
}

export default Scene
