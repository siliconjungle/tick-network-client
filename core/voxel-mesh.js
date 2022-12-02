import { pointInSphere } from './collisions'

export const createSphereChunk = (radius, colorIndex) => {
  const arr = []

  for (let z = 0; z < radius * 2; z++) {
    const zArr = []
    for (let y = 0; y < radius * 2; y++) {
      const yArr = []
      for (let x = 0; x < radius * 2; x++) {
        if (
          pointInSphere(
            { position: { x: radius, y: radius, z: radius }, radius },
            { x, y, z }
          )
        ) {
          yArr.push(colorIndex)
        } else {
          yArr.push(0)
        }
      }
      zArr.push(yArr)
    }
    arr.push(zArr)
  }

  return arr
}

export const createCubeChunk = (size, colorIndex) => {
  const arr = []

  for (let z = 0; z < size.depth; z++) {
    const zArr = []
    for (let y = 0; y < size.height; y++) {
      const yArr = []
      for (let x = 0; x < size.width; x++) {
        yArr.push(colorIndex)
      }
      zArr.push(yArr)
    }
    arr.push(zArr)
  }

  return arr
}

export const createPlaneChunk = (size, colorIndex) => {
  const arr = []

  for (let z = 0; z < size.depth; z++) {
    const zArr = []
    for (let y = 0; y < size.height; y++) {
      const yArr = []
      for (let x = 0; x < size.width; x++) {
        if (y === 0) {
          yArr.push(colorIndex)
        } else {
          yArr.push(0)
        }
      }
      zArr.push(yArr)
    }
    arr.push(zArr)
  }

  return arr
}
