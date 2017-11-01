KS = kaldi-wa/src

include $(KS)/kaldi.mk

ADDLIBS = $(KS)/online2/kaldi-online2.bc $(KS)/ivector/kaldi-ivector.bc \
          $(KS)/nnet3/kaldi-nnet3.bc $(KS)/chain/kaldi-chain.bc \
          $(KS)/cudamatrix/kaldi-cudamatrix.bc $(KS)/decoder/kaldi-decoder.bc \
          $(KS)/lat/kaldi-lat.bc $(KS)/fstext/kaldi-fstext.bc $(KS)/hmm/kaldi-hmm.bc \
          $(KS)/feat/kaldi-feat.bc $(KS)/transform/kaldi-transform.bc \
          $(KS)/gmm/kaldi-gmm.bc $(KS)/tree/kaldi-tree.bc $(KS)/util/kaldi-util.bc \
          $(KS)/matrix/kaldi-matrix.bc $(KS)/base/kaldi-base.bc

CXXFLAGS += -I$(KS) -I. -Ikaldi-wa/tools/CLAPACK
LDFLAGS += -s WASM=1 -s TOTAL_MEMORY=314572800 -s ALLOW_MEMORY_GROWTH=1 -s DISABLE_EXCEPTION_CATCHING=0 -s DEMANGLE_SUPPORT=1

include kaldi-wa/src/makefiles/default_rules.mk

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
