import m from 'mithril';

import robot from './robot';
import test from './interpreter';
import test2 from './interpreter2';

// This class was written while crossing Big Bug Creek

class Router {
    oncreate(vnode) {
        m.route(vnode.dom, '/robot', {
            '/robot': robot,
            '/test': test,
            '/test2': test2,
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
                m('a[href=#!/robot]', 'Robot'),
                m.trust('&nbsp;'),
                m('a[href=#!/test]', 'Test'),
                m.trust('&nbsp;'),
                m('a[href=#!/test2]', 'Test 2')
            ),
            m('br'),
            m(Router)
        ];
    }
});