

KS = kaldi-wa/src

include $(KS)/kaldi.mk

ADDLIBS = $(KS)/online2/kaldi-online2.a $(KS)/ivector/kaldi-ivector.a \
          $(KS)/nnet3/kaldi-nnet3.a $(KS)/chain/kaldi-chain.a $(KS)/nnet2/kaldi-nnet2.a \
          $(KS)/cudamatrix/kaldi-cudamatrix.a $(KS)/decoder/kaldi-decoder.a \
          $(KS)/lat/kaldi-lat.a $(KS)/fstext/kaldi-fstext.a $(KS)/hmm/kaldi-hmm.a \
          $(KS)/feat/kaldi-feat.a $(KS)/transform/kaldi-transform.a \
          $(KS)/gmm/kaldi-gmm.a $(KS)/tree/kaldi-tree.a $(KS)/util/kaldi-util.a \
          $(KS)/matrix/kaldi-matrix.a \
          $(KS)/base/kaldi-base.a


CXXFLAGS += $(shell PKG_CONFIG_PATH=/Users/adrian/src/protobuf pkg-config --cflags protobuf-lite)
CXXFLAGS += -I$(KS)
CXXFLAGS += -Ikaldi-wa/tools/CLAPACK
LDLIBS += /Users/adrian/src/protobuf/lib/libprotobuf-lite.dylib  #$(shell PKG_CONFIG_PATH=/Users/adrian/src/protobuf pkg-config --libs protobuf-lite)

include kaldi-wa/src/makefiles/default_rules.mk

%.pb.cc %.pb.h: %.proto
	protoc --cpp_out=. $^


GRAPH_DIR = exp/tdnn_7b_chain_online/graph_zork
WORDS_TXT = $(GRAPH_DIR)/words.txt
ZORK_GRAPH = $(GRAPH_DIR)/HCLG.fst
$(ZORK_GRAPH) $(WORDS_TXT): alexa_fst.py
	./alexa_fst.py AlexaZork data/lang_zork/ $(GRAPH_DIR)

kaldi-js.js: kaldi-js.cc $(ZORK_GRAPH) $(WORDS_TXT)  # kaldi-js.pb.cc                 # kaldi-js.pb.cc
	$(CXX) -o $@ -s WASM=1 -s TOTAL_MEMORY=1073741824 -s DEMANGLE_SUPPORT=1 -s ALLOW_MEMORY_GROWTH=1 $(LDFLAGS) $(CXXFLAGS) -I kaldi-wa/src $(LDLIBS) $(XDEPENDS) $(basename $@).cc kaldi-js.pb.cc \
		--preload-file exp/tdnn_7b_chain_online/conf/ivector_extractor.conf \
		--preload-file exp/tdnn_7b_chain_online/conf/mfcc.conf \
		--preload-file exp/tdnn_7b_chain_online/conf/online.conf \
		--preload-file exp/tdnn_7b_chain_online/conf/online_cmvn.conf \
		--preload-file exp/tdnn_7b_chain_online/conf/splice.conf \
		--preload-file exp/chain/tdnn_svd_0.6_2900.mdl \
		--preload-file $(ZORK_GRAPH) \
		--preload-file exp/tdnn_7b_chain_online/ivector_extractor/final.dubm \
		--preload-file exp/tdnn_7b_chain_online/ivector_extractor/final.ie \
		--preload-file exp/tdnn_7b_chain_online/ivector_extractor/final.mat \
		--preload-file exp/tdnn_7b_chain_online/ivector_extractor/global_cmvn.stats \
		--preload-file $(WORDS_TXT) \

zork: $(ZORK_GRAPH) kaldi-js.js
