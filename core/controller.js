import { EventEmitter } from 'events'

const actionDownEmitter = new EventEmitter()
const actionUpEmitter = new EventEmitter()

// Stores the state of each action as a true or false value
// e.g. forward: true
let actionStates = {}
// Stores the mapping between keys and actions
// e.g. 47: 'forward'
const keyMapping = {}

// As part of init, all of the actions being listened for should be registered.
export const registerActions = actions => {
  actions.forEach(({ name, keycode }) => {
    keyMapping[keycode] = name
    actionStates[name] = false
  })
}

export const getActionState = name => {
  return actionStates[name] || false
}

export const handleKeyDown = e => {
  const actionName = keyMapping[e.which]
  if (actionName) {
    actionDownEmitter.emit(actionName)
    actionStates[actionName] = true
  }
}

export const handleKeyUp = e => {
  const actionName = keyMapping[e.which]
  if (actionName) {
    actionUpEmitter.emit(actionName)
    actionStates[actionName] = false
  }
}

export const clearKeys = e => {
  actionStates = {}
}

export const addActionDownListener = (actionName, callback) => {
  actionDownEmitter.addListener(actionName, callback)
}

export const addActionUpListener = (actionName, callback) => {
  actionUpEmitter.addListener(actionName, callback)
}

export const removeActionDownListener = (actionName, callback) => {
  actionDownEmitter.removeListener(actionName, callback)
}

export const removeActionUpListener = (actionName, callback) => {
  actionUpEmitter.removeListener(actionName, callback)
}
