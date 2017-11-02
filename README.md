# Kaldi.js

This is a version of Kaldi tweaked to build to [WebAssembly](https://webassembly.org/). Check out the [Zork demo](https://patter.io/2017/10/20/serverless-speech-recognition-with-webassembly.html). For the Kaldi speech recognition toolkit, see the [official repository](https://github.com/kaldi-asr/kaldi).

## Build instructions

First, [install Emscripten](https://kripken.github.io/emscripten-site/docs/getting_started/downloads.html). Then do the following:

```
git clone --recursive https://github.com/adrianbg/kaldi.js.git

cd kaldi.js/tools
extras/check_dependencies.sh

# ... install anything that's missing

emmake make CXXFLAGS=-O3 LDFLAGS=-O3 openfst

cd ../CLAPACK-wa
emmake make

cd ..
wget http://mirrors.ocf.berkeley.edu/gnu/gsl/gsl-2.4.tar.gz
tar xvzf gsl-2.4.tar.gz
ln -s gsl-2.4 gsl
cd gsl
emconfigure ./configure
emmake make

cd ../src
CXXFLAGS=-O3 LDFLAGS=-O3 emconfigure ./configure --static --static-fst=no --clapack-root=../tools/CLAPACK-WA --gsl-root=../tools/gsl/
emmake make depend
emmake make

# For the Zork demo:

cd js/zork
emmake make

cd ..
wget https://github.com/nlohmann/json/releases/download/v2.1.1/json.hpp
emmake make zork
npm install
```

The original Kaldi README follows.

Kaldi Speech Recognition Toolkit
================================

To build the toolkit: see `./INSTALL`.  These instructions are valid for UNIX
systems including various flavors of Linux; Darwin; and Cygwin (has not been
tested on more "exotic" varieties of UNIX).  For Windows installation
instructions (excluding Cygwin), see `windows/INSTALL`.

To run the example system builds, see `egs/README.txt`

If you encounter problems (and you probably will), please do not hesitate to
contact the developers (see below). In addition to specific questions, please
let us know if there are specific aspects of the project that you feel could be
improved, that you find confusing, etc., and which missing features you most
wish it had.

Kaldi information channels
--------------------------

For HOT news about Kaldi see [the project site](http://kaldi-asr.org/).

[Documentation of Kaldi](http://kaldi-asr.org/doc/):
- Info about the project, description of techniques, tutorial for C++ coding.
- Doxygen reference of the C++ code.

[Kaldi forums and mailing lists](http://kaldi-asr.org/forums.html):

We have two different lists
- User list kaldi-help
- Developer list kaldi-developers:

To sign up to any of those mailing lists, go to
[http://kaldi-asr.org/forums.html](http://kaldi-asr.org/forums.html):


Development pattern for contributors
------------------------------------

1. [Create a personal fork](https://help.github.com/articles/fork-a-repo/)
   of the [main Kaldi repository](https://github.com/kaldi-asr/kaldi) in GitHub.
2. Make your changes in a named branch different from `master`, e.g. you create
   a branch `my-awesome-feature`.
3. [Generate a pull request](https://help.github.com/articles/creating-a-pull-request/)
   through the Web interface of GitHub.
4. As a general rule, please follow [Google C++ Style Guide](https://google.github.io/styleguide/cppguide.html).
   There are a [few exceptions in Kaldi](http://kaldi-asr.org/doc/style.html).
   You can use the [Google's cpplint.py](https://raw.githubusercontent.com/google/styleguide/gh-pages/cpplint/cpplint.py)
   to verify that your code is free of basic mistakes.

Platform specific notes
-----------------------

### PowerPC 64bits little-endian (ppc64le)

- Kaldi is expected to work out of the box in RHEL >= 7 and Ubuntu >= 16.04 with
  OpenBLAS, ATLAS, or CUDA.
- CUDA drivers for ppc64le can be found at [https://developer.nvidia.com/cuda-downloads](https://developer.nvidia.com/cuda-downloads).
- An [IBM Redbook](https://www.redbooks.ibm.com/abstracts/redp5169.html) is
  available as a guide to install and configure CUDA.

### Android

- Kaldi supports cross compiling for Android using Android NDK, clang++ and
  OpenBLAS.
- See [this blog post](http://jcsilva.github.io/2017/03/18/compile-kaldi-android/)
  for details.
