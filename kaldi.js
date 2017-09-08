(function(window) {
    function Match() {
        this.id = Math.random();
        this.match_i = null;
        this.start_i = null;
        this.start_j = null;
        this.start_k = null;
        this.end_i = null;
        this.end_j = null;
        this.end_k = null;
    }

    var KaldiJs = function() {
        var that = this;

        this.worker_ready = false;
        this.active = false;
        this.stream = null;
        this.context = window.audioContext;
        this.node = this.context.createScriptProcessor(8192, 1, 1);
        this.node.connect(this.context.destination);

        this.worker = new Worker('kaldi-js.js');
        this.worker.onmessage = function(e) {
            if (e.data === 'worker-started') {
                that.worker.postMessage({
                    init: {
                        sampleFrequency: that.context.sampleRate,
                        args: [
                            '--word-symbol-table=exp/tdnn_7b_chain_online/graph_zork/words.txt',
                            '--frame-subsampling-factor=3',
                            '--acoustic-scale=1',
                            '--beam=8',
                            '--lattice-beam=8',
                            '--config=exp/tdnn_7b_chain_online/conf/online.conf',
                            'exp/chain/tdnn_svd_0.6_2900.mdl',
                            'exp/tdnn_7b_chain_online/graph_zork/HCLG.fst'
                        ]
                    }
                });
            } else if (e.data === 'worker-ready') {
                that.worker_ready = true;
                $('#mic').removeClass('active');  // we start with it set to active so the mic is greyed out
                that._maybe_activate();
            } else {
                that.active = false;
                that._deactivate();
                that.handleCommand(e.data.transcript);
            }
        };

        this.handleCommand = function(transcript) {
            var restart_index = transcript.lastIndexOf('[restart]');
            if (restart_index != -1) {
                transcript = transcript.substring(restart_index + '[restart] '.length);
            }

            var space_index = transcript.indexOf(' ');
            if (transcript[0] == '[' && space_index !== -1) {
                terminal.exec(transcript.substring(space_index));
            } else {
                console.log('invalid command: ' + transcript);
            }
        };

        this.toggle = function() {
            if (this.active) {
                this.active = false;
                this._deactivate();
            } else {
                this.active = true;
                this._maybe_activate();
            }
        };

        this._maybe_activate = function() {
            console.log('maybe activate. worker: ' + this.worker_ready + ' active: ' + this.active);
            if (this.worker_ready && this.active) {
                this.node.onaudioprocess = function(e) {
                    that._handle_audio(e.inputBuffer);
                };

                navigator.getUserMedia({
                        audio: true
                    },
                    function(stream) {
                        if (that.active && !that.stream) {  // may have been deactivated or reactivated in the mean-time
                            that.stream = stream;
                            var source = audioContext.createMediaStreamSource(stream);
                            source.connect(that.node);
                            $('#mic').addClass('active');
                            that.worker.postMessage({ start: {} });
                        } else {
                            stream.getAudioTracks().forEach(function (track) {
                                track.stop();
                            });
                        }
                    },
                    function(e) {
                        console.log("No live audio input in this browser");
                    }
                );
            }
        };

        this._deactivate = function() {
            console.log('deactivate');
            if (this.stream) {
                this.stream.getAudioTracks().forEach(function (track) {
                    track.stop();
                });
                this.stream = null;
            }
            this.node.onaudioprocess = null;
            $('#mic').removeClass('active');
            that.worker.postMessage({ cancel: {} });
        }

        this._handle_audio = function(buffer) {
            this.worker.postMessage({
                audio: {
                    audio: Array.prototype.slice.call(buffer.getChannelData(0))
                }
            });
        };
    };

    function main() {
        if (!window.Worker) {
            console.log("Can't use web workers");
            return;
        }

        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        try {
            window.audioContext = new AudioContext();
        } catch (e) {
            console.log("Error initializing Web Audio: " + e);
            return;
        }

        // Actually call getUserMedia
        if (!navigator.getUserMedia) {
            console.log("No web audio support in this browser");
            return;
        }

        window.kaldi = new KaldiJs();

        $('#mic').click(function(e) {
            e.preventDefault();
            window.kaldi.toggle();
        });
    }

    $(main);
})(window);
