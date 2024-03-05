import { EventEmitter } from '@herbcaudill/eventemitter42'

export class TestChannel extends EventEmitter<TestChannelEvents> {
  private peers = 0
  private readonly buffer: Array<{ senderId: string; msg: Uint8Array }> = []

  addPeer() {
    this.peers += 1
    if (this.peers > 1) {
      // Someone was already connected, emit any buffered messages
      while (this.buffer.length > 0) {
        const { senderId, msg } = this.buffer.pop() as {
          senderId: string
          msg: Uint8Array
        }
        this.emit('data', senderId, msg)
      }
    }
  }

  write(senderId: string, message: Uint8Array) {
    if (this.peers > 1) {
      // At least one peer besides us connected
      this.emit('data', senderId, message)
    } else {
      // Nobody else connected, buffer messages until someone connects
      this.buffer.unshift({ senderId, msg: message })
    }
  }
}

type TestChannelEvents = {
  data: (senderId: string, message: Uint8Array) => void
}
