include ../kaldi.mk

ADDLIBS = ../online2/kaldi-online2.bc ../ivector/kaldi-ivector.bc \
          ../nnet3/kaldi-nnet3.bc ../chain/kaldi-chain.bc \
          ../cudamatrix/kaldi-cudamatrix.bc ../decoder/kaldi-decoder.bc \
          ../lat/kaldi-lat.bc ../fstext/kaldi-fstext.bc ../hmm/kaldi-hmm.bc \
          ../feat/kaldi-feat.bc ../transform/kaldi-transform.bc \
          ../gmm/kaldi-gmm.bc ../tree/kaldi-tree.bc ../util/kaldi-util.bc \
          ../matrix/kaldi-matrix.bc ../base/kaldi-base.bc

#CXXFLAGS += -I.
LDFLAGS += -s WASM=1 -s TOTAL_MEMORY=314572800 -s ALLOW_MEMORY_GROWTH=1 -s DISABLE_EXCEPTION_CATCHING=0 -s DEMANGLE_SUPPORT=1

include ../makefiles/default_rules.mk

GRAPH_DIR = zork_graph
WORDS_TXT = $(GRAPH_DIR)/words.txt
ZORK_GRAPH = $(GRAPH_DIR)/HCLG.fst
$(ZORK_GRAPH) $(WORDS_TXT): alexa_fst.py
	./alexa_fst.py AlexaZork zork_lang acoustic_model $(GRAPH_DIR)

zork-worker.js: kaldi-worker.cc kaldi-worker-js.js $(ZORK_GRAPH) $(WORDS_TXT)
	$(CXX) -o zork-worker.js $(LDFLAGS) $(CXXFLAGS) $(LDLIBS) $(XDEPENDS) kaldi-worker.cc \
		--preload-file acoustic_model/final.mdl \
		--preload-file acoustic_model/mfcc.conf \
		--preload-file $(ZORK_GRAPH) \
		--preload-file $(WORDS_TXT)

zork: zork-worker.js
