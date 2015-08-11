# -*- coding: utf-8 -*-
from path import path

PATH = path(__file__).dirname()
BIN = PATH / 'node_modules' / '.bin'
SRC = PATH / 'src'


COFFEE_SOURCES = list(SRC.walkfiles('*.coffee'))
JS_SOURCES = list(SRC.walkfiles('*.js'))

SOURCES = COFFEE_SOURCES + JS_SOURCES

COFFEE_TARGETS = [
    (PATH / src.relpath(SRC)).replace('.coffee', '.js')
    for src in COFFEE_SOURCES
]

JS_TARGETS = [
    PATH / src.relpath(SRC)
    for src in JS_SOURCES
]

def as_strings(items):
    return [str(i) for i in items]



def task_build():
    """Build the sources
    """
    yield {
        'name': 'coffee',
        'actions': [
            [BIN / 'coffee', '--compile', '--map', '--output', '%s' % PATH, src]
            for src in COFFEE_SOURCES
        ],
        'targets': as_strings(COFFEE_TARGETS),
        'file_dep': as_strings(COFFEE_SOURCES),
        'watch': [str(SRC)],
    }

    yield {
        'name': 'js',
        'actions': [
            ['cp', src, dest]
            for src, dest in zip(JS_SOURCES, JS_TARGETS)
        ],
        'targets': as_strings(JS_TARGETS),
        'file_dep': as_strings(JS_SOURCES),
        'watch': [str(SRC)],
    }
