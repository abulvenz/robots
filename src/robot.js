import m from 'mithril';
import tagl from 'tagl';
import fn from './fn';
import stack from './stack';


const camelToHyphen = s =>
    s.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`);

const hyphenToCamel = s =>
    s.replace(/-([a-z])/gi, ($0, $1) => $1.toUpperCase());

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
    g,
    foreignObject,
    body,
    pre,
    text,
    line,
    textarea
} = tagl_hyperscript;

let innerHeight = window.innerHeight;
let innerWidth = window.innerWidth;

window.addEventListener('resize', ev => {
    innerHeight = ev.target.innerHeight;
    innerWidth = ev.target.innerWidth;
    m.redraw();
});

const Motion = {
    LINEAR: 1,
    AXIS: 0,
    JOINT: 2,
    CIRCLE: 3,
    BELT: 4
};

let positions = [{
    name: 'HOME',
    j: [-100,
        90,
        90
    ]
}, {
    name: 'OHOME',
    j: [-80, -90, -90]
}, {
    name: 'OHOME2',
    type: Motion.AXIS,
    j: [-80, -90, -180]
}, {
    name: 'OHOME3',
    j: [-80, -90, 180]
}];

const posByName = name =>
    positions.filter(p => name === p.name)[0];

let jointAngle = posByName('OHOME').j;

const diff = (j1, j2) => j1.map((j, i) => j - j2[i]);
const add = (j1, j2) => j1.map((j, i) => j + j2[i]);
const scale = (j1, v) => j1.map(j => j * v);

const saturate = (arr, vmin, vmax) =>
    arr.map(v => Math.min(vmax, Math.max(v, vmin)));

const inRange = (arr, eps) => arr.map(Math.abs).every(l => l < eps);

let beltX = 0;

let trajectoryInterpolation = (target) => {
    if (target.type === Motion.BELT) {
        let d = target.beltX - beltX;
        let v = saturate([d], -5, 5);
        beltX = beltX + v[0];
        return inRange([target.beltX - beltX], 0.05);
    } else if (target.type === Motion.AXIS) {
        let d = diff(target.j, jointAngle);
        let v = saturate(d, -5, 5);
        jointAngle = add(jointAngle, v);
        return inRange(diff(target.j, jointAngle), 0.05);
    } else if (target.type === Motion.LINEAR) {
        let current = jToPos(...jointAngle);
        let d = diff(target.p, current);
        let v_ = saturate(d, -5, 5);
        let minRatio = d
            .map((d_, idx) => d_ / v_[idx])
            .filter((d_, idx) => v_[idx] !== 0)
            .reduce((a, b) => Math.max(a, b), 1);
        let v = scale(d, 1 / minRatio);
        let pos = add(current, v);
        jointAngle = jFromPos(...pos);
        return inRange(diff(target.p, pos), 0.05);
    } else { //if (target.type === Motion.JOINT) {
        let d = diff(target.j, jointAngle);
        let v = saturate(d, -5, 5);
        let minRatio = d
            .map((d_, idx) => d_ / v[idx])
            .filter((d_, idx) => v[idx] !== 0)
            .reduce((a, b) => Math.max(a, b), 1);
        v = scale(d, 1 / minRatio);
        jointAngle = add(jointAngle, v);
        return inRange(diff(target.j, jointAngle), 0.05);
    }
};

let time = 0;

let baseprogram = () => [
    'HOME',
    'OHOME',
    'Joint(0,0,0)',
    'Joint(-90,0,0)',
    'HOME'
];

let programIndex = -1;

let programs = [{
    name: 'showcase',
    main: baseprogram()
}, {
    name: 'linear motion',
    main: `conveyor(100)
linear(100,0,-30)
linear(100,-40,30)
linear(100,0,0)
linear(50,0,0)
linear(50,-100,0)
linear(111,0,0)`.split('\n')
}, {
    name: 'ingenieur',
    main: `conveyor(0)
linear(100,-60,30)
conveyor(-200)
linear(85,-30,90)
linear(85,-60,90)
conveyor(-220)
linear(85,-30,90)
linear(85,-60,90)
conveyor(-240)
linear(85,-30,90)
linear(85,-60,90)
conveyor(-260)
linear(85,-30,90)
linear(85,-60,90)
conveyor(-280)
linear(85,-30,90)
linear(85,-60,90)`.split('\n')
}];

let interpreter = program => {
    let motionCounter = 0;
    let programCounter = 0;
    let programStack = stack();
    return {

    };
};



console.log(fn.withoutIdx(fn.str2arr('12345'), 2));
console.log(fn.shuffled(fn.str2arr('12345')));


let program = programs[0];

console.log(positions.map(p => [{
    name: p.name,
    main: [p.name]
}]));

let l1 = 100;
let l2 = 75;

const jFromPos = (x, y, alpha) => {
    let lHypo = Math.sqrt(x * x + y * y);
    if (lHypo > l1 + l2 || lHypo < l1 - l2) {
        errorHandler.setError('position out of range');
        return [0, 0, 0];
    }
    let angleHypo = Math.atan2(y, x) * 180 / Math.PI;
    let j2 = 180 - Math.acos((l1 * l1 + l2 * l2 - lHypo * lHypo) / (2 * l1 * l2)) / Math.PI * 180;
    let j1 = angleHypo - Math.acos((l1 * l1 + lHypo * lHypo - l2 * l2) / (2 * l1 * lHypo)) / Math.PI * 180;
    let j3 = alpha - j1 - j2;
    return [j1, j2, j3];
};

const jToPos = (j1, j2, j3) => {
    //   console.log('jToPos', j1, j2, j3)
    const x = Math.cos(j1 / 180 * Math.PI) * l1 + Math.cos((j1 + j2) / 180 * Math.PI) * l2;
    const y = Math.sin(j1 / 180 * Math.PI) * l1 + Math.sin((j1 + j2) / 180 * Math.PI) * l2;
    let alpha = (j1 + j2 + j3);
    return [x, y, alpha];
};

const getPrograms = () => {
    return [
        ...programs,
        ...(positions
            .map(p => Object.assign({}, {
                name: p.name,
                main: [p.name]
            })))
    ];
};

const createErrorHandler = () => {
    let error = null;
    return {
        isInErrorState: () => {
            return !!error;
        },
        setError: (msg) => {
            error = {
                msg
            };
        },
        getMessage: () => error ? error.msg : '',
        clear: () => error = undefined
    };
};

let errorHandler = createErrorHandler();

const matchFunction = (str) => {
    const regex = /\b(.+)\(([^)]+)\)/;
    let matches = regex.exec(str);
    console.log('matches', matches);
    if (matches !== null && matches.length === 3) {
        if ('joint' === matches[1].toLowerCase()) {
            let joints = matches[2].split(',').map(Number);
            return {
                name: str,
                type: Motion.JOINT,
                j: joints
            };
        }
        if ('linear' === matches[1].toLowerCase()) {
            let coords = matches[2].split(',').map(Number);
            return {
                name: str,
                type: Motion.LINEAR,
                p: coords
            };
        }
        if ('conveyor' === matches[1].toLowerCase()) {
            let coords = Number(matches[2]);
            return {
                name: str,
                type: Motion.BELT,
                beltX: coords
            };
        }
    }
};

const getTarget = () => {
    let line = program.main[programIndex].trim();
    if (!!posByName(line)) {
        return posByName(line);
    }
    console.log('line not a position', line);
    return matchFunction(line);
};

let target = null;

setInterval(() => {
    time += 0.05;
    if (programIndex >= 0 && !errorHandler.isInErrorState()) {
        target = target || getTarget();

        if (!target) {
            errorHandler.setError('In line ' + programIndex + ': Position not found: ' + program.main[programIndex], ' in program ', program);
        } else if (trajectoryInterpolation(target)) {
            target = undefined;
            programIndex = (++programIndex);
            if (programIndex === program.main.length) {
                programIndex = -1;
            }
        }
    }
    m.redraw();
}, 50);

class Joint {
    view(vnode) {
        return g({
                transform: `
                translate(${vnode.attrs.jLength},0) rotate(${vnode.attrs.angle})`
            },
            rect(vnode.attrs), vnode.children
        );
    }
}



export default {
    view: (vnode) => [
        errorHandler.isInErrorState() ? [
            errorHandler.getMessage(), button.btn({
                onclick: () => errorHandler.clear()
            }, 'clear')
        ] :
        programIndex >= 0 ? div('current target: ', program.main[programIndex]) :
        div('no program running', button.btn({
            onclick: () => {
                programIndex = 0;
            }
        }, 'start'), getPrograms().map(prog => button.btn({
            onclick: () => {
                program = prog;
            }
        }, prog.name))),
        svg.debug({
                width: innerWidth,
                height: innerHeight * 2 / 3
            },
            g.debug({
                    transform: `translate(200,340)scale(2)`
                },
                rect({
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 10
                }),
                m(Joint, {
                    rx: 5,
                    width: 100,
                    height: 10,
                    jLength: 90,
                    x: -5,
                    y: -5,
                    fill: 'rgba(123,134,100,.5)',
                    stroke: 'maroon',
                    'stroke-width': '1px',
                    angle: jointAngle[0]
                }, m(Joint, {
                    rx: 5,
                    width: 75,
                    height: 10,
                    jLength: 90,
                    x: -5,
                    y: -5,
                    fill: 'rgba(123,134,100,.5)',
                    stroke: 'red',
                    'stroke-width': '1px',
                    angle: jointAngle[1]
                }, m(Joint, {
                    rx: 0,
                    width: 20,
                    height: 20,
                    jLength: 65,
                    x: -5,
                    y: -10,
                    stroke: 'black',
                    fill: 'rgba(255,255,0,.5)',
                    angle: jointAngle[2]
                }, polyline({
                    points: '10 0 0 0 0 10',
                    stroke: 'black',
                    fill: 'none'
                })))),
                g({
                    transform: `translate(0,0)`
                }, [
                    line({
                        x1: 105,
                        y1: 5,
                        x2: 400,
                        y2: 5,
                        //  stroke:'green',
                        stroke: "#5184AF",
                        'stroke-width': "10",
                        'stroke-linecap': "round",
                        'stroke-dasharray': "1, 10"
                    }), g({
                            transform: `translate(${360+beltX},0)`
                        },
                        fn.str2arr('Test 2').reverse().map((c, idx) =>
                            text({
                                x: 0 + idx * 20,
                                y: 0,
                                key: idx,
                                style: 'font-size:18pt;',
                                stroke: "#518fAF",
                            }, c)))
                ])
            )
        ),
        m('input[type=range][min=-170][max=-10]', {
            value: jointAngle[0],
            oninput: m.withAttr('value', (v) => jointAngle[0] = Number(v))
        }), m('input[type=range][min=-170][max=170]', {
            value: jointAngle[1],
            oninput: m.withAttr('value', (v) => jointAngle[1] = Number(v))
        }), m('input[type=range][min=-170][max=170]', {
            value: jointAngle[2],
            oninput: m.withAttr('value', (v) => jointAngle[2] = Number(v))
        }),
        input.$inppos(), button.btn({
            enabled: false,
            onclick: () => {
                console.log('inppos', document.body.querySelector('#inppos'));
                let name = document.body.querySelector('#inppos').value;
                positions.push({
                    name: name,
                    j: jointAngle
                });
            }
        }, 'Save position'),
        pre(JSON.stringify(jointAngle, null, 2)),
        textarea({
            value: program.main ? program.main.join('\n') : '',
            oninput: m.withAttr('value', v => {
                program.main = v.split('\n');
            })
        }), pre(JSON.stringify(program, null, 2)),
    ]
};