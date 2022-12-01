export const createMessage = {
  connected: (agentId) => ({
    type: 'connect',
    agentId,
  }),
  disconnected: (agentId) => ({
    type: 'disconnect',
    agentId,
  }),
  patch: (ops) => ({
    type: 'patch',
    ops,
  }),
}

export const MAX_HISTORY = 100

export class RoundTrips {
  sendTimes = {}
  totalRoundTripTime = 0
  totalRoundTripCount = 0
  latestRoundTripTime = 0
  history = []

  resetTimes() {
    this.sendTimes = {}
    this.totalRoundTripTime = 0
    this.totalRoundTripCount = 0
  }

  setSendTime(seq, time) {
    this.sendTimes[seq] = time
  }

  setReceivedTime(seq, time) {
    const sendTime = this.sendTimes[seq]
    if (sendTime !== undefined) {
      this.latestRoundTripTime = time - sendTime
      this.totalRoundTripTime += this.latestRoundTripTime
      this.totalRoundTripCount += 1
      delete this.sendTimes[seq]
      for (const key in this.sendTimes) {
        if (key < seq) {
          delete this.sendTimes[key]
        }
      }
      this.history.push(this.latestRoundTripTime)
      if (this.history.length > MAX_HISTORY) {
        this.history.shift()
      }
    }
  }

  getAverageRoundTripTime() {
    return this.totalRoundTripTime / this.totalRoundTripCount
  }

  getLatestRoundTripTime() {
    return this.latestRoundTripTime
  }

  getHistory() {
    return this.history
  }
}
