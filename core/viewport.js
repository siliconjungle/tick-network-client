const VIEWPORT_WIDTH = 120
const VIEWPORT_HEIGHT = 64
const VIEWPORT_DEPTH = 120

export const createViewport = (position, size, buffer) => ({
  position,
  size,
  buffer,
})

export const viewport = createViewport(
  { x: 0, y: 0, z: 0 },
  {
    width: VIEWPORT_WIDTH,
    height: VIEWPORT_HEIGHT,
    depth: VIEWPORT_DEPTH,
  },
  new Array(VIEWPORT_WIDTH * VIEWPORT_HEIGHT * VIEWPORT_DEPTH).fill(0),
)

const CHUNK_WIDTH = 8
const CHUNK_HEIGHT = 8
const CHUNK_DEPTH = 8

const createChunks = (width, height, depth) => {
  const chunks = []
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      for (let z = 0; z < depth; z += 1) {
        chunks.push(
          new Array(CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_DEPTH).fill(0)
        )
      }
    }
  }
  return chunks
}

export const chunks = createChunks(
  VIEWPORT_WIDTH / CHUNK_WIDTH,
  VIEWPORT_HEIGHT / CHUNK_HEIGHT,
  VIEWPORT_DEPTH / CHUNK_DEPTH,
)

export const fromPositionToIndex = ({ x, y, z }, height, depth) =>
  x * (height * depth) + y * depth + z

export const setBuffer = (chunks, viewport) => {
  const buffer = []
  for (let x = viewport.position.x; x < viewport.position.x + viewport.size.width; x++) {
    for (let y = viewport.position.y; y < viewport.position.y + viewport.size.height; y++) {
      for (let z = viewport.position.z; z < viewport.position.z + viewport.size.depth; z++) {
        const chunkIndex = fromPositionToIndex({ x, y, z })

        if (chunkIndex >= 0 && chunkIndex < chunks.length) {
          buffer.push(chunks[chunkIndex])
        } else {
          buffer.push(0)
        }
      }
    }
  }

  viewport.buffer = buffer
}

export const voxelToChunk = (x, y, z) => ({
  x: Math.floor(x / CHUNK_WIDTH),
  y: Math.floor(y / CHUNK_HEIGHT),
  z: Math.floor(z / CHUNK_DEPTH),
})

export const globalToLocal = (x, y, z) => ({
  x: x % 8,
  y: y % 8,
  z: z % 8,
})

export const setVoxel = (chunks, position, colorIndex) => {
  // convert the global position to the chunk coordinates
  const chunkPosition = voxelToChunk(position.x, position.y, position.z)

  const chunkIndex = fromPositionToIndex(chunkPosition, CHUNK_HEIGHT, CHUNK_DEPTH)

  if (chunkIndex < 0 || chunkIndex > chunks.length - 1) {
    return
  }

  const chunk = chunks[chunkIndex]

  // convert the global position to the position within the chunk
  const localPosition = globalToLocal(position.x, position.y, position.z)

  const voxelIndex = fromPositionToIndex(localPosition, CHUNK_HEIGHT, CHUNK_DEPTH)

  if (voxelIndex < 0 || voxelIndex > chunk.length - 1) {
    return
  }

  chunk[voxelIndex] = colorIndex
}
