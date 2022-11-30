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
