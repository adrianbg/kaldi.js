Module.handle_message = Module.cwrap('handle_message', null, ['array', 'number'])

importScripts('protobuf.js');
protobuf.load("kaldi-js.proto", function(err, root) {
    if (err) {
        console.log(err);
        return;
    }
    self.proto = root.nested.kaldi;
    self.onmessage = function(e) {
        var errMsg = self.proto.ClientMessage.verify(e.data);
        if (errMsg) {
            console.log(errMsg);
            return;
        }

        var message = self.proto.ClientMessage.create(e.data); // or use .fromObject if conversion is necessary
        var buffer = self.proto.ClientMessage.encode(message).finish();

        Module.handle_message(buffer, buffer.length);
    };
    self.postByteArray = function(ptr, len) {
        var transcript = ""
        for (var i = 0; i < len; i++) {
            transcript += String.fromCharCode(Module.getValue(ptr + i));
        }
        postMessage({transcript: transcript});
        return;
        var array = new Uint8Array(Module.buffer, ptr, len);
        var message = self.proto.ServerMessage.decode(array);
        postMessage(message);
    };
    postMessage('worker-started');  // notify that our message handler is attached
});
