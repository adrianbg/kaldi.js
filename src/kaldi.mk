# This file was generated using the following command:
# ./configure --static --static-fst=no --clapack-root=../../CLAPACK-WA --gsl-root=../../gsl/

CONFIGURE_VERSION := 6

# Toolchain configuration

CXX = /Users/adrian/src/emsdk/emscripten/1.37.21/em++
AR = /Users/adrian/src/emsdk/emscripten/1.37.21/emar
AS = as
RANLIB = /Users/adrian/src/emsdk/emscripten/1.37.21/emranlib

# Base configuration

DOUBLE_PRECISION = 0
OPENFSTINC = /Users/adrian/src/kaldi.js/kaldi-wa/tools/openfst/include
OPENFSTLIBS = /Users/adrian/src/kaldi.js/kaldi-wa/tools/openfst/lib/libfst.dylib
OPENFSTLDFLAGS = -Wl,-rpath -Wl,/Users/adrian/src/kaldi.js/kaldi-wa/tools/openfst/lib

CLAPACKLIBS =  /Users/adrian/src/kaldi.js/CLAPACK-WA/F2CLIBS/libf2c.bc /Users/adrian/src/kaldi.js/CLAPACK-WA/lapack_WA.bc /Users/adrian/src/kaldi.js/CLAPACK-WA/libcblaswr.bc /Users/adrian/src/kaldi.js/gsl/cblas/.libs/libgslcblas.dylib
# WebAssembly/CLAPACK configuration

ifndef DOUBLE_PRECISION
$(error DOUBLE_PRECISION not defined.)
endif
ifndef OPENFSTINC
$(error OPENFSTINC not defined.)
endif
ifndef OPENFSTLIBS
$(error OPENFSTLIBS not defined.)
endif

CXXFLAGS = -std=c++11 -I.. -I$(OPENFSTINC) $(EXTRA_CXXFLAGS) \
           -Wall -Wno-sign-compare -Wno-unused-local-typedefs \
           -Wno-deprecated-declarations -Winit-self \
           -DKALDI_DOUBLEPRECISION=$(DOUBLE_PRECISION) \
           -DHAVE_CXXABI_H -DHAVE_CLAPACK -I../../tools/CLAPACK \
           -g # -DKALDI_PARANOID

ifeq ($(KALDI_FLAVOR), dynamic)
CXXFLAGS += -fPIC
endif

# Compiler specific flags
COMPILER = $(shell $(CXX) -v 2>&1)
ifeq ($(findstring clang,$(COMPILER)),clang)
# Suppress annoying clang warnings that are perfectly valid per spec.
CXXFLAGS += -Wno-mismatched-tags
endif

LDFLAGS = $(EXTRA_LDFLAGS) $(OPENFSTLDFLAGS) -g
LDLIBS = $(EXTRA_LDLIBS) $(OPENFSTLIBS) $(CLAPACKLIBS) -lm # -lpthread -ldl

# Environment configuration

CXXFLAGS += -O3
LDFLAGS += -O3
