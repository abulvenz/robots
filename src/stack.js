const stack = () => {
    let history = [];
    const empty = () => history.length > 0;
    return {
        push: newObj => {
            history.push(newObj);
        },
        pop: () => {
            return empty() ? null : history.pop();
        },
        peek: () => empty() ? null : history[history.length - 1],
        empty: empty
    };
};

export default stack;