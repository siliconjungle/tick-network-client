import Renderer2D from './renderer2D'
import Renderer3D from './renderer3D'
import Scene from './scene'

class Game {
  constructor() {
    this.lastTime = (new Date()).getTime()
    this.currentTime = 0
    this.dt = 0
    this.running = false

    this.init = this.init.bind(this)
    this.shutdown = this.shutdown.bind(this)
    this.update = this.update.bind(this)
    this.render = this.render.bind(this)
    this.renderer2D = new Renderer2D()
    this.renderer3D = new Renderer3D()
    this.scene = new Scene()
  }

  async init(canvas, canvas3D) {
    if (this.running === true) {
      return
    }

    this.running = true

    this.canvas = canvas
    this.context = canvas.getContext('2d')
    this.canvas3D = canvas3D

    this.scene.init(this.canvas, this.canvas3D)
    this.renderer2D.init(this.context, this.scene)
    this.renderer3D.init(this.canvas3D, this.scene)

    this.lastTime = (new Date()).getTime()
    this.currentTime = 0
    this.dt = 0

    this.running = true
    window.requestAnimationFrame(this.update)
  }

  shutdown() {
    this.running = false
    this.scene.shutdown()
  }

  update() {
    this.currentTime = (new Date()).getTime()
    this.dt = (this.currentTime - this.lastTime) / 1000

    this.renderer2D.update(this.dt)
    this.renderer3D.update(this.dt)
    this.scene.update(this.dt)

    this.render()

    this.lastTime = this.currentTime

    if (this.running) {
      window.requestAnimationFrame(this.update)
    }
  }

  render() {
    this.renderer2D.render(this.canvas, this.context)
    this.renderer3D.render(this.canvas3D)
    this.scene.render(this.canvas, this.context)
  }
}

export default Game
