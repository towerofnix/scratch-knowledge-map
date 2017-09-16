'use strict'

class EventEmitter {
  constructor() {
    this.listeners = {}
  }

  addEvent(eventName) {
    if (this.listeners.hasOwnProperty(eventName)) {
      throw new Error('Event already added')
    }

    this.listeners[eventName] = []
  }

  on(eventName, callback) {
    this.assertEventExists(eventName)

    const array = this.listeners[eventName]

    array.push(callback)

    return function remove() {
      const index = array.indexOf(callback)

      if (index < 0) {
        throw new Error('Listener already removed')
      } else {
        array.splice(index, 1)
      }
    }
  }

  emit(eventName, ...callbackArgs) {
    this.assertEventExists(eventName)

    for (let callback of this.listeners[eventName]) {
      callback(...callbackArgs)
    }
  }

  assertEventExists(eventName) {
    if (!this.listeners.hasOwnProperty(eventName)) {
      throw new Error('Nonexistant event: ' + eventName)
    }
  }
}
