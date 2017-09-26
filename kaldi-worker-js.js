Module.init = Module.cwrap('KaldiJsInit', 'number', ['string']);
Module.reset = Module.cwrap('KaldiJsReset', null, []);
Module.handleAudio = Module.cwrap('KaldiJsHandleAudio', null, []);

self.onmessage = function(e) {
    if ('init' in e.data) {
        var audioPtr = Module.init(JSON.stringify(e.data.init));
        self.audio = new Float32Array(Module.buffer, audioPtr, e.data.init.bufferSize);
    } else if ('reset' in e.data) {
        Module.reset();
    } else if ('audio' in e.data) {
        self.audio.set(e.data.audio);
        Module.handleAudio();
    } else {
        console.log('invalid message:');
        console.log(e.data);
    }
};

self.postByteArray = function(ptr, len) {
    var transcript = ""
    for (var i = 0; i < len; i++) {
        transcript += String.fromCharCode(Module.getValue(ptr + i));
    }
    self.postMessage({transcript: transcript});
    return;
    var array = new Uint8Array(Module.buffer, ptr, len);
    var message = self.proto.ServerMessage.decode(array);
    self.postMessage(message);
};

self.postMessage('worker-listening');  // notify that our message handler is attached
