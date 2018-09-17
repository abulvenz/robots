import jp from 'fast-json-patch';

const stack = (obj) => {
    let clone = (o) => JSON.parse(JSON.stringify(o));
    let state = clone(obj);
    let history = [];
    const dirty = () => history.length > 0;
    return {
        push: (newObj) => {
            history.push(jp.compare(newObj, state));
            state = clone(newObj);
        },
        pop: () => {
            if (dirty()) {
                state = jp.applyPatch(state, history.pop()).newDocument;
            }
            return clone(state);
        },
        peek: () => dirty() ? clone(history[history.length - 1]) : [],
        dirty: dirty
    };
};

const testStack = () => {
    let test = {
        a: 0
    };
    let history = stack(test);
    console.log('test_0 dirty false', history.dirty());
    test.b = 1;
    history.push(test);
    console.log('test_1 dirty true', history.dirty());
    console.log('test_2 {op:remove, path:/b}', JSON.stringify(history.peek()))
    test.b = 2;
    history.push(test);
    console.log('test_3 {op:replace, path:/b, value:1}', JSON.stringify(history.peek()))
    console.log('test_4 {a:0,b:1}', JSON.stringify(history.pop()))
    console.log('test_4 {a:0}', JSON.stringify(history.pop()))
    console.log('test_5 dirty false', history.dirty());
};

export default stack;