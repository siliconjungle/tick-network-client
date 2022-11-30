class Renderer2D {
  init(context) {
    context.mozImageSmoothingEnabled = false
    context.webkitImageSmoothingEnabled = false
    context.msImageSmoothingEnabled = false
    context.imageSmoothingEnabled = false
  }

  update(dt) {

  }

  render(canvas, context) {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }
}

export default Renderer2D
