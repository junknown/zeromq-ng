suite.add(`queue proto=${proto} msgsize=${msgsize} zmq=cur`, Object.assign({
  fn: deferred => {
    const client = zmq.cur.socket("dealer")
    client.linger = 0
    client.connect(address)

    gc()

    for (let i = 0; i < n; i++) {
      client.send(Buffer.alloc(msgsize))
    }

    gc()

    client.close()

    deferred.resolve()
  }
}, benchOptions))

suite.add(`queue proto=${proto} msgsize=${msgsize} zmq=ng`, Object.assign({
  fn: async deferred => {
    const client = new zmq.ng.Dealer
    client.linger = 0
    client.sendHighWaterMark = n * 2
    client.connect(address)

    gc()

    for (let i = 0; i < n; i++) {
      await client.send(Buffer.alloc(msgsize))
    }

    gc()

    client.close()

    deferred.resolve()
  }
}, benchOptions))
