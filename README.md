This is the [serverless speech recognition Zork demo](https://patter.io/2017/10/20/serverless-speech-recognition-with-webassembly.html).

## Build instructions

First, [install Emscripten](https://kripken.github.io/emscripten-site/docs/getting_started/downloads.html). Then do the following:

```
git clone --recursive https://github.com/adrianbg/kaldi.js.git
cd kaldi.js
wget https://github.com/nlohmann/json/releases/download/v2.1.1/json.hpp
wget http://mirrors.ocf.berkeley.edu/gnu/gsl/gsl-2.4.tar.gz
tar xvzf gsl-2.4.tar.gz
ln -s gsl-2.4 gsl
cd gsl
emconfigure ./configure
emmake make
cd ..
cd CLAPACK-wa
emmake make
cd ..
cd kaldi-wa/tools
emmake make CXXFLAGS=-O3 LDFLAGS=-O3 openfst
cd ../src
CXXFLAGS=-O3 LDFLAGS=-O3 emconfigure ./configure --static --static-fst=no --clapack-root=../../CLAPACK-WA --gsl-root=../../gsl/
emmake make
cd ../..
cd zork
emmake make
cd ..
emmake make zork
npm install
```
