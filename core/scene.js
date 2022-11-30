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
    context.font = '30px Arial'
    context.fillText('Hello World', 10, 50)
  }
}

export default Scene
