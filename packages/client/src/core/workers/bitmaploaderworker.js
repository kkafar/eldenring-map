onmessage = function (msg) {
  console.log(`Worker run with message ${JSON.stringify(msg.data)}`);
}

