import { NetworkAdapter, type Message } from '@automerge/automerge-repo'
import { type ShareId } from 'types.js'

/**
 * An AuthenticatedNetworkAdapter is a NetworkAdapter that wraps another NetworkAdapter and
 * transforms outbound messages.
 */
export class AuthenticatedNetworkAdapter<T extends NetworkAdapter> //
  extends NetworkAdapter
{
  isReady: typeof NetworkAdapter.prototype.isReady
  whenReady: typeof NetworkAdapter.prototype.whenReady
  connect: typeof NetworkAdapter.prototype.connect
  disconnect: typeof NetworkAdapter.prototype.disconnect

  constructor(
    public baseAdapter: T,
    private readonly sendFn: (msg: Message) => void,
    private readonly shareIds: ShareId[] = []
  ) {
    super()

    // pass through the base adapter's connect & disconnect methods
    this.connect = this.baseAdapter.connect.bind(this.baseAdapter)
    this.disconnect = this.baseAdapter.disconnect.bind(this.baseAdapter)
    this.isReady = this.baseAdapter.isReady.bind(this.baseAdapter)
    this.whenReady = this.baseAdapter.whenReady.bind(this.baseAdapter)
  }

  send(msg: Message) {
    if (!this.isReady()) {
      // wait for base adapter to be ready
      this.baseAdapter
        .whenReady()
        .then(() => this.sendFn(msg))
        .catch(error => {
          throw error as Error
        })
    } else {
      // send immediately
      this.sendFn(msg)
    }
  }
}
