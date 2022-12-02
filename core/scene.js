import {
  registerActions,
  handleKeyDown,
  handleKeyUp,
} from './controller'
import Client from './networking/client'
import Kernal from './networking/kernal'
import { MAX_HISTORY, createMessage } from './networking/messages'
// import { randomHeartbeat, getRandomInt } from './networking/utils'

class Scene {
  init (canvas, canvas3d) {
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
      {
        name: 'left2',
        keycode: '74', // j
      },
      {
        name: 'right2',
        keycode: '76', // l
      },
      {
        name: 'up2',
        keycode: '73', // i
      },
      {
        name: 'down2',
        keycode: '75', // k
      },
      {
        name: 'jump',
        keycode: '67', // c
      },
      {
        name: 'bomb',
        keycode: '86', // v
      },
      {
        name: 'jump2',
        keycode: '78', // n
      },
      {
        name: 'paint',
        keycode: '49', // 1
      },
      {
        name: 'paint2',
        keycode: '50', // 2
      },
    ])

    canvas.addEventListener('keydown', (e) => {
      handleKeyDown(e)
    }, false)

    canvas.addEventListener('keyup', e => {
      handleKeyUp(e)
    }, false)

    canvas3d.addEventListener('keydown', (e) => {
      handleKeyDown(e)
    }, false)

    canvas3d.addEventListener('keyup', e => {
      handleKeyUp(e)
    }, false)

    const client = new Client()
    client.init()

    this.client = client

    client.on('open', () => {
      const snapshotOps = this.kernal.getSnapshotOps()
      if (snapshotOps.length > 0) {
        client.addMessage(createMessage.patch(snapshotOps))
      }
    })

    client.on('message', message => {
      if (message.type === 'patch') {
        this.kernal.applyOps(message.ops)
      }
    })

    this.kernal = new Kernal()

    // This adds random messages to the client's message queue
    // randomHeartbeat(() => {
    //   const ops = []

    //   // const opsCount = getRandomInt(1, 10)
    //   // for (let i = 0; i < opsCount; i++) {
    //   //   ops.push({
    //   //     version: [this.kernal.latestSeq, '123abc'],
    //   //     id: 'test',
    //   //     fields: [0, 1, 2],
    //   //     values: [getRandomInt(0, 100), getRandomInt(0, 100), 'hello'],
    //   //   })
    //   // }

    //   const patch = createMessage.patch(ops)
    //   client.addMessage(patch)
    //   // this.kernal.latestSeq++
    //   return true
    // }, 5, 100)
  }

  shutdown () {
    this.client?.shutdown()
  }

  update (dt) {}

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
