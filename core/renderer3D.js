import * as THREE from 'three'
import { createSphereChunk } from './voxel-mesh'
import { getActionState } from './controller'
import { fromIndexToPosition, fromPositionToIndex } from './networking/utils'
import { createMessage } from './networking/messages'

const WIDTH = 60
const HEIGHT = 30
const DEPTH = 60
const INSTANCE_COUNT = WIDTH * HEIGHT * DEPTH
const PLAYER_RADIUS = 7
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
  init(canvas, gameScene) {
    this.gameScene = gameScene
    this.kernal = gameScene.kernal
    this.camera = new THREE.PerspectiveCamera(
      70,
      canvas.width / canvas.height,
      0.01,
      200
    )

    this.camOffset = this.camera.position

    this.camera.position.set(0, 1, -1)
    this.camera.lookAt(0, 0, 0)
    this.camera.position.set(0, 75, -79)

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
    // geometry.computeVertexNormals()
    // geometry.scale(0.5, 0.5, 0.5)
    // const material = new THREE.MeshNormalMaterial()
    const material = new THREE.MeshStandardMaterial()
    // const material = new THREE.MeshBasicMaterial()
    const mesh = new THREE.InstancedMesh(geometry, material, INSTANCE_COUNT)
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
    // for (let z = 0; z < DEPTH; z++) {
    //   world[z] = []
    //   for (let y = 0; y < HEIGHT; y++) {
    //     world[z][y] = []
    //     for (let x = 0; x < WIDTH; x++) {
    //       world[z][y][x] = 0
    //     }
    //   }
    // }

    // Create a floor
    for (let z = 0; z < DEPTH; z++) {
      for (let x = 0; x < WIDTH; x++) {
        const index = fromPositionToIndex({ x, y: 0, z }, WIDTH, HEIGHT)
        // world[z][0][x] = 8
        world[index] = 8
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

    this.player2 = {
      x: 64,
      y: 0,
      z: 64,
      vy: 0,
      grounded: false,
    }

    // this.playerMesh = createSphereChunk(PLAYER_RADIUS, 18)
    // this.playerMesh = createSphereChunk(PLAYER_RADIUS, 4)
    this.playerMesh = createSphereChunk(PLAYER_RADIUS, 18)

    // this.playerMesh2 = createSphereChunk(PLAYER_RADIUS, 29)
    this.playerMesh2 = createSphereChunk(PLAYER_RADIUS, 12)

    // this.playerPaintMesh = createSphereChunk(PLAYER_RADIUS - 2, 5)
    this.playerPaintMesh = createSphereChunk(PLAYER_RADIUS - 2, 19)

    this.bombMesh = createSphereChunk(PLAYER_RADIUS, 1)

    // this.playerPaintMesh2 = createSphereChunk(PLAYER_RADIUS - 2, 30)
    this.playerPaintMesh2 = createSphereChunk(PLAYER_RADIUS - 2, 11)

    // this.world = world
  }

  update(dt) {
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
      const world = this.kernal.getDocument('world') // this.world
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
                const index = fromPositionToIndex({ x: position.x + x, y: position.y + y, z: position.z + z }, WIDTH, HEIGHT)
                ops.push({
                  version: [this.kernal.latestSeq + 1, '123abc'],
                  id: 'world',
                  fields: [index],
                  values: [0],
                })
                // world[index] = 0
                // world[position.z + z][position.y + y][position.x + x] = 0
              }
            }
          }
        }
      }
    }

    if (getActionState('left2')) {
      this.player2.x -= PLAYER_SPEED * dt
    }

    if (getActionState('right2')) {
      this.player2.x += PLAYER_SPEED * dt
    }

    if (getActionState('up2')) {
      this.player2.z -= PLAYER_SPEED * dt
    }

    if (getActionState('down2')) {
      this.player2.z += PLAYER_SPEED * dt
    }

    if (getActionState('jump2') && this.player2.grounded) {
      this.player2.vy = JUMP_VELOCITY
      this.player2.grounded = false
    }

    this.player.vy -= GRAVITY * dt
    this.player.vy = Math.max(this.player.vy, -MAX_VELOCITY)
    this.player.y += this.player.vy * dt

    if (this.player.y < 0) {
      this.player.y = 0
      this.player.vy = 0
      this.player.grounded = true
    }

    this.player2.vy -= GRAVITY * dt
    this.player2.vy = Math.max(this.player2.vy, -MAX_VELOCITY)
    this.player2.y += this.player2.vy * dt

    if (this.player2.y < 0) {
      this.player2.y = 0
      this.player2.vy = 0
      this.player2.grounded = true
    }

    // const world = this.world

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

              const index = fromPositionToIndex({ x: position.x + x, y: position.y + y, z: position.z + z }, WIDTH, HEIGHT)
              // world[position.z + z][position.y + y][position.x + x] = block
              // world[index] = block
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

    if (getActionState('paint2')) {
      const paintMesh2 = this.playerPaintMesh2
      const player2 = this.player2
      const position2 = { x: Math.round(player2.x), y: Math.round(player2.y) - 6, z: Math.round(player2.z) }

      for (let z = 0; z < paintMesh2.length; z++) {
        for (let y = 0; y < paintMesh2[z].length; y++) {
          for (let x = 0; x < paintMesh2[z][y].length; x++) {
            const block = paintMesh2[z][y][x]
            if (block) {
              if (position2.z + z < 0 || position2.z + z >= DEPTH) continue
              if (position2.y + y < 0 || position2.y + y >= HEIGHT) continue
              if (position2.x + x < 0 || position2.x + x >= WIDTH) continue

              const index = fromPositionToIndex({ x: position2.x + x, y: position2.y + y, z: position2.z + z }, WIDTH, HEIGHT)
              // world[position2.z + z][position2.y + y][position2.x + x] = block
              // world[index] = block
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

    if (ops.length > 0) {
      this.kernal.applyOps(ops)
      // apply the patch
      const patch = createMessage.patch(ops)
      this.gameScene.client.addMessage(patch)
    }
  }

  render() {
    const world = this.kernal.getDocument('world')
    const chunk = JSON.parse(JSON.stringify(world))
    const player = this.player
    const position = { x: Math.round(player.x) - PLAYER_RADIUS, y: Math.round(player.y), z: Math.round(player.z) - PLAYER_RADIUS }
    const playerMesh = this.playerMesh
    // Loop through the player mesh and add it to the chunk
    for (let z = 0; z < playerMesh.length; z++) {
      for (let y = 0; y < playerMesh[z].length; y++) {
        for (let x = 0; x < playerMesh[z][y].length; x++) {
          const block = playerMesh[z][y][x]
          if (block) {
            if (position.z + z < 0 || position.z + z >= DEPTH) continue
            if (position.y + y < 0 || position.y + y >= HEIGHT) continue
            if (position.x + x < 0 || position.x + x >= WIDTH) continue

            const index = fromPositionToIndex({ x: position.x + x, y: position.y + y, z: position.z + z }, WIDTH, HEIGHT)
            // chunk[position.z + z][position.y + y][position.x + x] = block
            chunk[index] = block
          }
        }
      }
    }

    // player 2
    const player2 = this.player2
    const position2 = { x: Math.round(player2.x), y: Math.round(player2.y), z: Math.round(player2.z) }
    const playerMesh2 = this.playerMesh2
    // Loop through the player mesh and add it to the chunk
    for (let z = 0; z < playerMesh2.length; z++) {
      for (let y = 0; y < playerMesh2[z].length; y++) {
        for (let x = 0; x < playerMesh2[z][y].length; x++) {
          const block = playerMesh2[z][y][x]
          if (block) {
            if (position2.z + z < 0 || position2.z + z >= DEPTH) continue
            if (position2.y + y < 0 || position2.y + y >= HEIGHT) continue
            if (position2.x + x < 0 || position2.x + x >= WIDTH) continue

            const index = fromPositionToIndex({ x: position2.x + x, y: position2.y + y, z: position2.z + z }, WIDTH, HEIGHT)
            // chunk[position2.z + z][position2.y + y][position2.x + x] = block
            chunk[index] = block
          }
        }
      }
    }

    this.renderScene(chunk)
    this.renderer.render(this.scene, this.camera)
  }

  renderScene(chunk) {
    const mesh = this.mesh
    const dummy = this.dummy
    const color = this.color
    if (mesh) {
      // const time = Date.now() * 0.001

      // mesh.rotation.x = Math.sin(time / 4)
      // mesh.rotation.y = Math.sin(time / 2)

      let i = 0
      const xOffset = (WIDTH - 1) / 2
      const yOffset = (HEIGHT - 1) / 2
      const zOffset = (DEPTH - 1) / 2
      // const offset = ( amount - 1 ) / 2

      for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
          for (let z = 0; z < DEPTH; z++) {
            const index = fromPositionToIndex({ x, y, z }, WIDTH, HEIGHT)

            // dummy.rotation.y = ( Math.sin( x / 4 + time ) + Math.sin( y / 4 + time ) + Math.sin( z / 4 + time ) )
            // dummy.rotation.z = dummy.rotation.y * 2
            // mesh.setColorAt(i, color.setHex( 0xffffff * Math.random() ) )
            // mesh.setColorAt(i, color.setHex(PALETTE[getRandomInt(0, PALETTE.length)]))

            // dummy.updateMatrix()

            // if (getRandomInt(0, 1) === 0) {
            //   mesh.setMatrixAt(i++, dummy.matrix)
            // } else {
            //   mesh.setMatrixAt(i++, this.emptyMatrix)
            // }

            if (chunk[index] === 0) {
              dummy.scale.set(0, 0, 0)
              dummy.position.set(xOffset - x, yOffset - y, zOffset - z)
              dummy.updateMatrix()
              mesh.setMatrixAt(i, dummy.matrix)
              // mesh.setMatrixAt(i, this.emptyMatrix)
              i++
              // dummy.position.set(xOffset - x, yOffset - y, zOffset - z)
            //   mesh.setMatrixAt(i++, dummy.matrix)
            } else {
              dummy.scale.set(1, 1, 1)
              dummy.position.set(xOffset - x, yOffset + y, zOffset - z)
              dummy.updateMatrix()
              mesh.setMatrixAt(i, dummy.matrix)
              mesh.setColorAt(i, color.setHex(PALETTE[chunk[index] - 1]))
              i++
            }
          }
        }
      }
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor !== null) {
        mesh.instanceColor.needsUpdate = true
      }
    }
  }
}

export default Renderer3D
