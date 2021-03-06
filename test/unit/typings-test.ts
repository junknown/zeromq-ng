/* To test the typings this file should compile successfully with TypeScript.
   It is not necessary for it to run successfully. */
import * as zmq from "../.."

const version: string = zmq.version

const capability = zmq.capability
if (capability.ipc) console.log("ipc")
if (capability.pgm) console.log("pgm")
if (capability.tipc) console.log("tipc")
if (capability.norm) console.log("norm")
if (capability.curve) console.log("curve")
if (capability.gssapi) console.log("gssapi")
if (capability.draft) console.log("draft")

const keypair = zmq.curveKeypair()
console.log(keypair.publicKey)
console.log(keypair.secretKey)

const context = new zmq.Context({
  ioThreads: 1,
  ipv6: true,
})

context.threadPriority = 4

console.log(context.ioThreads)
console.log(context.ipv6)

zmq.global.ioThreads = 5
zmq.global.ipv6 = true

const socket = new zmq.Dealer({
  context: zmq.global,
  sendTimeout: 200,
  probeRouter: true,
  routingId: "foobar",
})

console.log(socket.context)
console.log(socket.sendTimeout)
console.log(socket.routingId)

const stuff = async () => {
  await socket.bind("tcp://foobar")
  await socket.unbind("tcp://foobar")

  socket.connect("tcp://foobar")
  socket.disconnect("tcp://foobar")

  for await (const [part1, part2] of socket) {
    console.log(part1)
    console.log(part2)
  }

  const [part1, part2] = await socket.receive()

  await socket.send(part1)
  await socket.send([part1, part2])

  socket.close()

  socket.events.on("listening", details => {
    console.log(details.address)
    console.log(details.reconnectInterval)
    console.log(details.error)
  })

  for await (const [event, details] of socket.events) {
    if (event == "listening") {
      console.log(details.address)
      console.log(details.reconnectInterval)
      console.log(details.error)
    }
  }

  const proxy = new zmq.Proxy(new zmq.Router, new zmq.Dealer)
  await proxy.run()

  proxy.pause()
  proxy.resume()
  proxy.terminate()

  proxy.frontEnd.close()
  proxy.backEnd.close()
}

