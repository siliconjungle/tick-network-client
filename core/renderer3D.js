import * as THREE from 'three'
import { createSphereChunk } from './voxel-mesh'
import { getActionState } from './controller'
import { fromPositionToIndex, fromIndexToPosition, getRandomInt } from './networking/utils'
import { createMessage } from './networking/messages'
import {
  sprite,
  spriteDominantIndex,
  tile,
  tileDominantIndex,
  tile2,
  tile2DominantIndex,
  tile3,
  tile3DominantIndex,
  tile4,
  tile4DominantIndex,
  createCube,
  project2DArrayOnto3DArray,
  createCharacter,
} from './brick'

const WIDTH = 128
const HEIGHT = 32
const DEPTH = 128
const INSTANCE_COUNT = WIDTH * HEIGHT * DEPTH
const PLAYER_RADIUS = 6
const PLAYER_SPEED = 50
const GRAVITY = 350
const MAX_VELOCITY = 100
const JUMP_VELOCITY = 110

// DB32 Color Palette
const PALETTE = [
  0x000000,
  0x222034,
  0x45283c,
  0x663931,
  0x8f563b,
  0xdf7126,
  0xd9a066,
  0xeec39a,
  0xfbf236,
  0x99e550,
  0x6abe30,
  0x37946e,
  0x4b692f,
  0x524b24,
  0x323c39,
  0x3f3f74,
  0x306082,
  0x5b6ee1,
  0x639bff,
  0x5fcde4,
  0xcbdbfc,
  0xffffff,
  0x9badb7,
  0x847e87,
  0x696a6a,
  0x595652,
  0x76428a,
  0xac3232,
  0xd95763,
  0xd77bba,
  0x8f974a,
  0x8a6f30
]

class Renderer3D {
  changes = {}
  entityChanges = {}
  lastEntityChanges = {}
  init(canvas, gameScene) {
    this.gameScene = gameScene
    this.kernal = gameScene.kernal
    // ops: [
    //   {
    //     version: [seq, agentId],
    //     id: ‘test’,
    //     fields: [0, 1, 2],
    //     values: [5, 10, ‘hello’],
    //   },
    // ]
    this.kernal.on('ops', ops => {
      ops.forEach(op => {
        if (op.id === 'world') {
          op.fields.forEach((field, i) => {
            this.changes[field] = true
          })
        }
      })
    })
    this.camera = new THREE.PerspectiveCamera(
      70,
      canvas.width / canvas.height,
      0.01,
      400
    )

    this.camOffset = this.camera.position

    this.camera.position.set(0, 1, -1)
    this.camera.lookAt(0, 0, 0)
    this.camera.position.set(0, 95, -100)

    this.scene = new THREE.Scene()

    this.light = new THREE.DirectionalLight(0xffffff, 0.25)
    this.light.position.set(0, 30, -34)
    this.light.target.position.set(0, 0, 0)

    this.scene.add(this.light)
    this.scene.add(this.light.target)

    this.hLight = new THREE.HemisphereLight(0xb1e1ff, 0x888888, 1)
    this.scene.add(this.hLight)

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas,
    })

    window.onresize = () => {
      this.camera.aspect = canvas.width / canvas.height
      this.camera.updateProjectionMatrix()
    }

    this.setupScene()
  }

  setupScene() {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial()
    // const material = new THREE.MeshBasicMaterial()
    const mesh = new THREE.InstancedMesh(geometry, material, INSTANCE_COUNT)
    mesh.frustumCulled = true
    this.mesh = mesh
    this.dummy = new THREE.Object3D()
    this.emptyMatrix = new THREE.Matrix4()
    this.color = new THREE.Color()
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.scene.add(mesh)
    const world = []
    for (let i = 0; i < WIDTH * HEIGHT * DEPTH; i++) {
      world[i] = 0
    }

    // Create a floor
    for (let z = 0; z < DEPTH; z++) {
      for (let x = 0; x < WIDTH; x++) {
        const index = fromPositionToIndex({ x, y: 0, z }, HEIGHT, DEPTH)
        world[index] = 8
      }
    }

    const cube = createCube(16, spriteDominantIndex)
    const cube2 = createCube(16, tileDominantIndex + 1)
    const cube3 = createCube(16, tile2DominantIndex + 1)
    const cube4 = createCube(16, tile3DominantIndex + 1)
    const cube5 = createCube(16, tile4DominantIndex + 1)

    project2DArrayOnto3DArray(sprite, cube)
    project2DArrayOnto3DArray(tile, cube2)
    project2DArrayOnto3DArray(tile2, cube3)
    project2DArrayOnto3DArray(tile3, cube4)
    project2DArrayOnto3DArray(tile4, cube5)

    for (let tilesZ = 0; tilesZ < DEPTH; tilesZ += 16) {
      const currentTileIndex = getRandomInt(0, 4)
      for (let z = 0; z < 16; z++) {
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const index = fromPositionToIndex({ x, y, z: z + tilesZ }, HEIGHT, DEPTH)
            if (currentTileIndex === 0) {
              world[index] = cube[z][y][x]
            } else if (currentTileIndex === 1) {
              world[index] = cube2[z][y][x] + 1
            } else if (currentTileIndex === 2) {
              world[index] = cube3[z][y][x] + 1
            } else if (currentTileIndex === 3) {
              world[index] = cube4[z][y][x] + 1
            } else if (currentTileIndex === 4) {
              world[index] = cube5[z][y][x] + 1
            }
          }
        }
      }
    }

    for (let tilesZ = 0; tilesZ < DEPTH; tilesZ += 16) {
      const currentTileIndex = getRandomInt(0, 4)
      for (let z = 0; z < 16; z++) {
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const index = fromPositionToIndex({ x: x + WIDTH - 16, y, z: z + tilesZ }, HEIGHT, DEPTH)
            if (currentTileIndex === 0) {
              world[index] = cube[z][y][x]
            } else if (currentTileIndex === 1) {
              world[index] = cube2[z][y][x] + 1
            } else if (currentTileIndex === 2) {
              world[index] = cube3[z][y][x] + 1
            } else if (currentTileIndex === 3) {
              world[index] = cube4[z][y][x] + 1
            } else if (currentTileIndex === 4) {
              world[index] = cube5[z][y][x] + 1
            }
          }
        }
      }
    }

    for (let tilesX = 16; tilesX < DEPTH - 16; tilesX += 16) {
      const currentTileIndex = getRandomInt(0, 4)
      for (let z = 0; z < 16; z++) {
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const index = fromPositionToIndex({ x: x + tilesX, y, z: z }, HEIGHT, DEPTH)
            if (currentTileIndex === 0) {
              world[index] = cube[z][y][x]
            } else if (currentTileIndex === 1) {
              world[index] = cube2[z][y][x] + 1
            } else if (currentTileIndex === 2) {
              world[index] = cube3[z][y][x] + 1
            } else if (currentTileIndex === 3) {
              world[index] = cube4[z][y][x] + 1
            } else if (currentTileIndex === 4) {
              world[index] = cube5[z][y][x] + 1
            }
          }
        }
      }
    }

    for (let tilesX = 16; tilesX < DEPTH - 16; tilesX += 16) {
      const currentTileIndex = getRandomInt(0, 4)
      for (let z = 0; z < 16; z++) {
        for (let y = 0; y < 16; y++) {
          for (let x = 0; x < 16; x++) {
            const index = fromPositionToIndex({ x: x + tilesX, y, z: z + DEPTH - 16 }, HEIGHT, DEPTH)
            if (currentTileIndex === 0) {
              world[index] = cube[z][y][x]
            } else if (currentTileIndex === 1) {
              world[index] = cube2[z][y][x] + 1
            } else if (currentTileIndex === 2) {
              world[index] = cube3[z][y][x] + 1
            } else if (currentTileIndex === 3) {
              world[index] = cube4[z][y][x] + 1
            } else if (currentTileIndex === 4) {
              world[index] = cube5[z][y][x] + 1
            }
          }
        }
      }
    }

    const ops = [
      {
        version: [this.kernal.latestSeq + 1, '123abc'],
        id: 'world',
        fields: world.map((_, i) => i),
        values: world,
      },
    ]

    this.kernal.applyOps(ops)
    this.gameScene.client.addMessage(createMessage.patch(ops))

    this.player = {
      x: 32,
      y: 0,
      z: 32,
      vy: 0,
      grounded: false,
    }

    this.playerMesh = createSphereChunk(PLAYER_RADIUS, 18)
    this.playerPaintMesh = createSphereChunk(PLAYER_RADIUS - 2, 19)
    this.bombMesh = createSphereChunk(PLAYER_RADIUS, 1)
    this.playerPaintMesh2 = createSphereChunk(PLAYER_RADIUS - 2, 11)
  }

  update(dt) {
    this.updateEntityRenders()

    if (getActionState('left')) {
      this.player.x -= PLAYER_SPEED * dt
    }

    if (getActionState('right')) {
      this.player.x += PLAYER_SPEED * dt
    }

    if (getActionState('up')) {
      this.player.z -= PLAYER_SPEED * dt
    }

    if (getActionState('down')) {
      this.player.z += PLAYER_SPEED * dt
    }

    if (getActionState('jump') && this.player.grounded) {
      this.player.vy = JUMP_VELOCITY
      this.player.grounded = false
    }

    const ops = []

    if (getActionState('bomb')) {
      const bombMesh = this.bombMesh
      const player = this.player
      const position = { x: Math.round(player.x) - PLAYER_RADIUS, y: Math.round(player.y), z: Math.round(player.z) - PLAYER_RADIUS }

      for (let z = 0; z < bombMesh.length; z++) {
        for (let y = 0; y < bombMesh[z].length; y++) {
          for (let x = 0; x < bombMesh[z][y].length; x++) {
            const block = bombMesh[z][y][x]
            if (block) {
              if (position.z + z < 0 || position.z + z >= DEPTH) continue
              if (position.y + y < 1 || position.y + y >= HEIGHT) continue
              if (position.x + x < 0 || position.x + x >= WIDTH) continue
              if (block === 1) {
                const index = fromPositionToIndex({ x: position.x + x, y: position.y + y, z: position.z + z }, HEIGHT, DEPTH)
                if (this.kernal.getDocument('world')[index] !== 0) {
                  ops.push({
                    version: [this.kernal.latestSeq + 1, '123abc'],
                    id: 'world',
                    fields: [index],
                    values: [0],
                  })
                }
              }
            }
          }
        }
      }
    }

    this.player.vy -= GRAVITY * dt
    this.player.vy = Math.max(this.player.vy, -MAX_VELOCITY)
    this.player.y += this.player.vy * dt

    if (this.player.y < 0) {
      this.player.y = 0
      this.player.vy = 0
      this.player.grounded = true
    }

    if (getActionState('paint')) {
      const paintMesh = this.playerPaintMesh
      const player = this.player
      const position = { x: Math.round(player.x) - PLAYER_RADIUS, y: Math.round(player.y) - 6, z: Math.round(player.z) - PLAYER_RADIUS }

      for (let z = 0; z < paintMesh.length; z++) {
        for (let y = 0; y < paintMesh[z].length; y++) {
          for (let x = 0; x < paintMesh[z][y].length; x++) {
            const block = paintMesh[z][y][x]
            if (block) {
              if (position.z + z < 0 || position.z + z >= DEPTH) continue
              if (position.y + y < 0 || position.y + y >= HEIGHT) continue
              if (position.x + x < 0 || position.x + x >= WIDTH) continue

              const index = fromPositionToIndex({ x: position.x + x, y: position.y + y, z: position.z + z }, HEIGHT, DEPTH)
              if (this.kernal.getDocument('world')[index] !== block) {
                ops.push({
                  version: [this.kernal.latestSeq + 1, '123abc'],
                  id: 'world',
                  fields: [index],
                  values: [block],
                })
              }
            }
          }
        }
      }
    }

    if (getActionState('paint2')) {
      const paintMesh2 = this.playerPaintMesh2
      const player2 = this.player
      const position2 = { x: Math.round(player2.x) - PLAYER_RADIUS, y: Math.round(player2.y) - 6, z: Math.round(player2.z) - PLAYER_RADIUS }

      for (let z = 0; z < paintMesh2.length; z++) {
        for (let y = 0; y < paintMesh2[z].length; y++) {
          for (let x = 0; x < paintMesh2[z][y].length; x++) {
            const block = paintMesh2[z][y][x]
            if (block) {
              if (position2.z + z < 0 || position2.z + z >= DEPTH) continue
              if (position2.y + y < 0 || position2.y + y >= HEIGHT) continue
              if (position2.x + x < 0 || position2.x + x >= WIDTH) continue

              const index = fromPositionToIndex({ x: position2.x + x, y: position2.y + y, z: position2.z + z }, HEIGHT, DEPTH)
              if (this.kernal.getDocument('world')[index] !== block) {
                ops.push({
                  version: [this.kernal.latestSeq + 1, '123abc'],
                  id: 'world',
                  fields: [index],
                  values: [block],
                })
              }
            }
          }
        }
      }
    }

    if (ops.length > 0) {
      this.kernal.applyOps(ops)
      const patch = createMessage.patch(ops)
      this.gameScene.client.addMessage(patch)
    }
  }

  renderMesh(mesh, position) {
    for (let z = 0; z < mesh.length; z++) {
      for (let y = 0; y < mesh[z].length; y++) {
        for (let x = 0; x < mesh[z][y].length; x++) {
          if (position.z + z < 0 || position.z + z >= DEPTH) continue
          if (position.y + y < 0 || position.y + y >= HEIGHT) continue
          if (position.x + x < 0 || position.x + x >= WIDTH) continue

          const index = fromPositionToIndex({ x: position.x + x, y: position.y + y, z: position.z + z }, HEIGHT, DEPTH)
          const block = mesh[z][y][x]
          if (block) {
            this.changes[index] = true
          }
        }
      }
    }
  }

  renderMeshAndChunk(mesh, position, chunk) {
    for (let z = 0; z < mesh.length; z++) {
      for (let y = 0; y < mesh[z].length; y++) {
        for (let x = 0; x < mesh[z][y].length; x++) {
          if (position.z + z < 0 || position.z + z >= DEPTH) continue
          if (position.y + y < 0 || position.y + y >= HEIGHT) continue
          if (position.x + x < 0 || position.x + x >= WIDTH) continue

          const index = fromPositionToIndex({ x: position.x + x, y: position.y + y, z: position.z + z }, HEIGHT, DEPTH)

          const block = mesh[z][y][x]

          if (block) {
            this.changes[index] = true
            if (chunk) {
              chunk[index] = block
            }
          }
        }
      }
    }
  }

  updateEntityRenders() {
    const player = this.player
    const position = { x: Math.round(player.x) - PLAYER_RADIUS, y: Math.round(player.y), z: Math.round(player.z) - PLAYER_RADIUS }
    const playerMesh = this.playerMesh
    this.renderMesh(playerMesh, position)
  }

  updateEntityRendersAndChunk(chunk) {
    const player = this.player
    const position = { x: Math.round(player.x) - PLAYER_RADIUS, y: Math.round(player.y), z: Math.round(player.z) - PLAYER_RADIUS }
    const playerMesh = this.playerMesh
    this.renderMeshAndChunk(playerMesh, position, chunk)
  }

  render() {
    const world = this.kernal.getDocument('world')
    const chunk = JSON.parse(JSON.stringify(world))

    this.updateEntityRendersAndChunk(chunk)

    this.renderScene(chunk)
    this.renderer.render(this.scene, this.camera)
    this.changes = {}
  }

  renderScene(chunk) {
    const mesh = this.mesh
    const dummy = this.dummy
    const color = this.color
    if (mesh) {
      const xOffset = (WIDTH - 1) / 2
      const yOffset = (HEIGHT - 1) / 2
      const zOffset = (DEPTH - 1) / 2

      const keys = Object.keys(this.changes)
      const indices = keys.map(key => parseInt(key))

      for (let i = 0; i < indices.length; i++) {
        const index = indices[i]
        const { x, y, z } = fromIndexToPosition(index, HEIGHT, DEPTH)
        if (chunk[index] === 0) {
          dummy.scale.set(0, 0, 0)
          dummy.position.set(xOffset - x, yOffset - y, zOffset - z)
        } else {
          dummy.scale.set(1, 1, 1)
          mesh.setColorAt(index, color.setHex(PALETTE[chunk[index] - 1]))
          dummy.position.set(xOffset - x, yOffset + y, zOffset - z)
        }

        dummy.updateMatrix()
        mesh.setMatrixAt(index, dummy.matrix)
      }

      if (indices.length > 0) {
        mesh.instanceMatrix.needsUpdate = true
        if (mesh.instanceColor !== null) {
          mesh.instanceColor.needsUpdate = true
        }
      }
    }
  }
}

export default Renderer3D
