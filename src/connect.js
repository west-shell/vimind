import Konva from 'konva';
import Minder from './minder';
import MindNode from './node';

Minder.registerInitHook(function initConnect() {
    this._initConnect()
});

var _connectProviders = {};

function register(name, provider) {
    _connectProviders[name] = provider;
}

register('default', function (node, parent, connection) {
    var index = node.getIndex();
    if (index == -1) return;
    if (index == 0)
        connection.points([
            0, 0,
            node.getPosition().x,
            node.getPosition().y
        ]);
    else {
        connection.points([
            parent.children[index - 1].getPosition().x,
            parent.children[index - 1].getPosition().y,
            node.getPosition().x,
            node.getPosition().y

        ])
    }
});

Object.assign(MindNode.prototype, {
    getConnect() {
        return this.data.connect || 'default';
    },

    getConnectProvider() {
        return _connectProviders[this.getConnect()] || _connectProviders['default'];
    },
    getConnection() {
        return this.connection || null;
    }
});

Object.assign(Minder.prototype, {
    _initConnect() {
        this.on('nodecreate', e => {
            this.createConnect(e.node, e.parent);
        });
        this.on('noderemove', e => {
            this.removeConnect(e.node);
        });
        this.on('nodeappend', e => {
            e.node.connection.moveTo(e.parent.container);
            this.updateConnect(e.node);
        })
        this.on('layout', e => {
            this.updateConnect();
        });
        var minder = this;
        this.stage.on('dragmove', e => {
            if (!e.target.mindNode) return;
            var node = e.target.mindNode;
            minder.updateConnect(node.parent);
        })

    },

    createConnect(node, parent) {
        var connection = new Konva.Arrow({
            name: "connection",
            stroke: 'white'
        });
        node.connection = connection;
        if (!parent) return;
        parent.container.add(connection);
    },

    removeConnect(node) {
        node.connection.remove();
    },

    updateConnect(node) {
        function _updateConnect(node) {
            if (!node) return;
            var connection = node.connection;
            var parent = node.parent;
            if (!parent || !connection) return;
            var provider = node.getConnectProvider();
            provider(node, node.parent, connection);
        }
        if (!node) {
            this.root.traverse(node => {
                _updateConnect(node);
            });
        } else {
            node.traverse(element => {
                _updateConnect(element);
            })
        }
        this.stage.draw();
    }
});
export { register };