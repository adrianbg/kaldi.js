#!/bin/bash

#CXXFLAGS=-O3 LDFLAGS=-O3 emconfigure ./configure --static --clapack-root=../tools/CLAPACK-3.2.1/
CXXFLAGS=-O3 LDFLAGS=-O3 emconfigure ./configure --static --static-fst=no --clapack-root=../../CLAPACK-WA --gsl-root=../../gsl/
