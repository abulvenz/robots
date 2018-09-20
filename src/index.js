import m from 'mithril';

import robot from './robot';

// This class was written while crossing Big Bug Creek

class Router {
    oncreate(vnode) {
        m.route(vnode.dom, '/robot', {
            '/robot':robot,
        });
    }
    view(vnode) {
        return m('');
    }
}

m.mount(document.body, {
    view(v) {
        return [
            m('nav',
            m('a[href=#!/robot]','Robot')
            ),m('br'),
            m(Router)
        ];
    }
});