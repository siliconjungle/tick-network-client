import { encode, decode } from 'messagepack'
import { heartbeat } from './utils'
import { RoundTrips, MessageSizes } from './messages'

const isBrowser = typeof window !== 'undefined'

const RECONNECT_TIMEOUT = 10000
const PONG_TIMEOUT = 10000
const SEND_RATE = 33.333

const SERVER_URL = 'ws://localhost:8080'

class Client {
	latestSeq = -1
	latestServerSeq = -1
	latestAck = -1
	running = false
	roundTrips = new RoundTrips()
	localMessageSizes = new MessageSizes()
	serverMessageSizes = new MessageSizes()

	constructor() {
    this.messages = []
		this.connection = null
	}

	init() {
		this.connection = isBrowser ? this.createConnection() : null
	}

	shutdown() {
		this.stop()
		if (this.connection?.readyState === WebSocket.OPEN) {
			this.connection?.close()
		}
	}

	start() {
    if (this.running === false) {
      this.running = true

			this.lastPong = Date.now()

      heartbeat(() => {
				this.detectDisconnect()
        this.sendMessages()
        return this.running
      }, SEND_RATE)
    }
  }

  stop() {
    this.running = false
  }

	detectDisconnect() {
		if (this.connection?.readyState === WebSocket.OPEN) {
			if (this.lastPong + PONG_TIMEOUT < Date.now()) {
				console.log('_SERVER_DISCONNECTED_')
				this.connection = this.createConnection()
			}
		}
	}

	handleMessage = (event) => {
		const messageList = decode(event.data)
		this.serverMessageSizes.addMessageSize(event.data.byteLength)

		if (messageList.seq !== -1) {
			// this.roundTrips.setReceivedTime(messageList.seq, Date.now() - messageList.delay)
			this.roundTrips.setReceivedTime(messageList.seq, performance.now() - messageList.delay)
		}

		this.latestServerSeq = messageList.serverSeq
		this.latestAck = messageList.seq
		const messages = messageList.messages

		this.lastPong = Date.now()

		for (const message of messages) {
			// noop
		}
	}

	handleOpen = (event) => {
		console.log('_OPEN_')
		this.start()
	}

	handleClose = (event) => {
		console.log('_CLOSE_')
		this.stop()
		setTimeout(() => {
			this.connection = this.createConnection()
		}, RECONNECT_TIMEOUT)
	}

	handleError = (event) => {
		console.log('_ERROR_')
		this.stop()
		setTimeout(() => {
			this.connection = this.createConnection()
		}, RECONNECT_TIMEOUT)
	}

	createConnection = () => {
		this.latestSeq = -1
		this.latestServerSeq = -1
		this.latestAck = -1
		this.roundTrips.resetTimes()
		this.localMessageSizes.resetSizes()
		this.serverMessageSizes.resetSizes()
		const connection = new WebSocket(SERVER_URL)
		connection.binaryType = 'arraybuffer'
		connection.addEventListener('message', this.handleMessage)
		connection.addEventListener('open', this.handleOpen)
		connection.addEventListener('close', this.handleClose)
		connection.addEventListener('error', this.handleError)
		this.messages = []
		return connection
	}

	addMessage(message) {
		this.messages.push(message)
	}

	sendMessages() {
		const connection = this.connection
		if (connection?.readyState === WebSocket.OPEN) {
			this.latestSeq++
			const messageList = {
				seq: this.latestSeq,
				serverSeq: this.latestServerSeq,
				messages: this.messages,
			}
			// this.roundTrips.setSendTime(this.latestSeq, Date.now())
			this.roundTrips.setSendTime(this.latestSeq, performance.now())
			const data = encode(messageList)
			console.log('SEND', data.byteLength)
			this.localMessageSizes.addMessageSize(data.byteLength)
			connection.send(data)
		}
		this.messages = []
	}
}

export default Client
