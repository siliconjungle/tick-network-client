export const fromPositionToIndex = ({ x, y, z }, height, depth) =>
  x * (height * depth) + y * depth + z

export const fromIndexToPosition = (index, height, depth) => {
  const x = Math.floor(index / (height * depth))
  const y = Math.floor((index % (height * depth)) / depth)
  const z = index % depth

  return { x, y, z }
}

export const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const throttle = (fn, delay = 1000) => {
  let shouldWait = false
  let waitingArgs
  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false
    } else {
      fn(...waitingArgs)
      waitingArgs = null
      setTimeout(timeoutFunc, delay)
    }
  }

  return (...args) => {
    if (shouldWait) {
      waitingArgs = args
      return
    }

    fn(...args)
    shouldWait = true
    setTimeout(timeoutFunc, delay)
  }
}

export const perf = (fn, name) => {
  const start = performance.now()
  fn()
  const end = performance.now()
  const ms = end - start
  console.log(`${name || 'Function call'}: ${ms}ms`)
}

export const heartbeat = (fn, delay = 1000) => {
  const running = fn()
  if (running === true) {
    setTimeout(() => {
      heartbeat(fn, delay)
    }, delay)
  }
}

export const randomHeartbeat = (fn, min = 5, max = 500) => {
  const running = fn()
  if (running === true) {
    setTimeout(() => {
      randomHeartbeat(fn, min, max)
    }, getRandomInt(min, max))
  }
}
