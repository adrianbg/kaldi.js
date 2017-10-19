(function(window) {
    window.Kaldi = function(config) {
        var that = this;
        
        this.config = {};
        $.extend(this.config, config);
        this.worker_path = this.config['worker-path'];
        delete this.config['worker-path'];

        this.ready = false;
        this.error = null;
        this.active = false;

        this.onready = null;
        this.onactive = null;
        this.oninactive = null;
        this.oncommand = null;
        this.onerror = null;

        this._stream = null;

        if (!window.Worker) {
            this.error = "Can't use web workers";
            return;
        }

        var AudioContext = window.AudioContext || window.webkitAudioContext;
        try {
            this._audioContext = new AudioContext();
        } catch (e) {
            this.error = "Error initializing Web Audio: " + e;
            return;
        }

        this._getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!this._getUserMedia) {
            this.error = "No web audio support in this browser";
            return;
        }

        var bufferSize = 8192;
        this._node = this._audioContext.createScriptProcessor(bufferSize, 1, 1);
        this._node.connect(this._audioContext.destination);

        this._worker = new Worker(this.worker_path);
        this._worker.onmessage = function(e) {
            if (e.data === 'worker-listening') {
                that.config['input-buffer-size'] = bufferSize;
                that.config['input-sample-frequency'] = that._audioContext.sampleRate;
            
                that._worker.postMessage({ init: that.config });
                if (that.onready) {
                    that.onready();
                }
                that.ready = true;
            } else {
                if (e.data.final) {
                    that.deactivate();
                }
                if (e.data.transcript) {
                    that._handleCommand(e.data.transcript, e.data.final);
                }
            }
        };

        this.setonready = function(readyHandler) {
            this.onready = readyHandler;
            if (this.ready && readyHandler) {
                readyHandler();
            }
        }

        this.setonerror = function(errorHandler) {
            this.onerror = errorHandler;
            if (this.error && errorHandler) {
                errorHandler(error);
            }
        }

        this._handleCommand = function(transcript, final) {
            var restartIndex = transcript.lastIndexOf('[restart]');
            if (restartIndex != -1) {
                transcript = transcript.substring(restartIndex + '[restart] '.length);
            }

            var spaceIndex = transcript.indexOf(' ');
            if (transcript[0] == '[' && spaceIndex !== -1) {
                if (that.oncommand) {
                    that.oncommand(transcript.substring(spaceIndex), final);
                }
            } else {
                console.log('invalid command: ' + transcript);
            }
        };

        this.toggle = function() {
            if (!this.ready) {
                return;
            }
            if (this.active) {
                this.deactivate();
            } else {
                this.activate();
            }
        };

        this.activate = function() {
            if (!this.ready || this.error || this.active) {
                return;
            }

            this.active = true;

            this._node.onaudioprocess = function(e) {
                that._handleAudio(e.inputBuffer);
            };

            this._getUserMedia.call(navigator, {
                    audio: true
                },
                function(stream) {
                    if (that.active && !that._stream) {  // may have been deactivated and/or reactivated in the mean-time
                        that._stream = stream;
                        var source = that._audioContext.createMediaStreamSource(stream);
                        source.connect(that._node);
                        if (that.onactive) {
                            that.onactive();
                        }
                    } else {
                        stream.getAudioTracks().forEach(function (track) {
                            track.stop();
                        });
                    }
                },
                function(e) {
                    that.error = "No live audio input in this browser: " + e;
                    that.active = false;
                    if (that.onerror) {
                        that.onerror(that.error);
                    }
                }
            );
        };

        this.deactivate = function() {
            if (!this.ready || !this.active) {
                return;
            }

            this.active = false;

            if (this._stream) {
                this._stream.getAudioTracks().forEach(function(track) {
                    track.stop();
                });
                this._stream = null;
            }
            this._node.onaudioprocess = null;
            this._worker.postMessage({ reset: 0 });

            if (this.oninactive) {
                this.oninactive();
            }
        }

        this._handleAudio = function(buffer) {
            this._worker.postMessage({
                audio: Array.prototype.slice.call(buffer.getChannelData(0))
            });
        };
    };
})(window);
