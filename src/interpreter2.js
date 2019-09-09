"use strict";

import m from 'mithril';


import tagl from 'tagl';
import fn from './fn';

import * as esprima from 'esprima';

console.log(esprima)

const camelToHyphen = s =>
    s.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`);

const tagl_hyperscript = tagl(function (tagName, classes, ...args) {
    let cls = classes
        .map(camelToHyphen)
        .join('.');
    return m([tagName, cls].join('.').replace('.$', '#'), ...args);
});

const {
    div,
    svg,
    input,
    button,
    polygon,
    polyline,
    rect,
    circle,
    h1,
    g,
    foreignObject,
    body,
    pre,
    text,
    textarea
} = tagl_hyperscript;

class Editor {
    view(vnode) {
        return textarea(Object.assign({
            value: vnode.attrs.program ? vnode.attrs.program.lines.join('\n') : '',
            oninput: m.withAttr('value', v => {
                vnode.attrs.program.lines = v.split('\n');
            })
        }, vnode.attrs));
    }
}

let program = {
    lines: [],
    tokens: []
};

const tokenizeProgram = (program) => {
    try {
        program.tokens = 
        esprima.parseScript(program.lines.join('\n'));
    }catch(e){
        console.log(e)
        program.tokens=e;
    }

};


export default {
    view(vnode) {
        return [
            button({
                onclick: e => tokenizeProgram(program)
            }, 'Tokenize'),
            m(Editor, {
                rows: '5',
                cols: '80',
                program: program
            }),
            pre(JSON.stringify(program, null, 2))
        ];
    }
};