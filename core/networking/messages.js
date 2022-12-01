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

export class RoundTrips {
  sendTimes = {}
  totalRoundTripTime = 0
  totalRoundTripCount = 0
  latestRoundTripTime = 0

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
    }
  }

  getAverageRoundTripTime() {
    return this.totalRoundTripTime / this.totalRoundTripCount
  }

  getLatestRoundTripTime() {
    return this.latestRoundTripTime
  }
}
