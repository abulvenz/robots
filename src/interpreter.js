import m from 'mithril';
import tagl from 'tagl';
import fn from './fn';

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

let program = {
    main: `a3:=p(0,0,0)
joint(0,0,0)
p1:={klo:"test"}
b:=p(0,0,90)`.split('\n'),
    lines: []
};

let variables = {};

const matchFunctionCall = /\b(.+)\(([^)]+)\)/;
const matchFunctionDefinition = /function\(([^)]+)\)/;

const matchObject = /\{.*\}/;
const detectAssignment = /([a-zA-Z][a-zA-Z0-9]*)\s*\:\=\s*(.*)/gi;
const str = `
j := h(0,0,0)
sin := function(a) Math.sin(a)
`;

const id = e => e;

const match = (regex, str, cb) => {
    let match_;
    let count = 0;
    while ((match_ = regex.exec(str)) !== null && count++ < 1) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (match_.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        let result = match_.map(id).slice(1);
        cb(result[0], result[1]);
    }
    return count > 0;
};


const parseProgram = (program) =>
    program.main.forEach(line => {
        if (match(detectAssignment, line, (e1, e2) => program.lines.push({
                type: 'assigment',
                e1,
                e2
            })))
            return;
        if (match(matchFunctionCall, line, (e1, e2) => program.lines.push({
                type: 'function',
                e1,
                e2
            })))
            return;
    });

parseProgram(program);

export default {
    view(vnode) {
        return [textarea({
                value: program.main ? program.main.join('\n') : '',
                oninput: m.withAttr('value', v => {
                    program.main = v.split('\n');
                })
            }),
            pre(JSON.stringify(program, null, 2))
        ];
    }
};