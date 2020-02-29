import Minder from './minder';
import MindNode from './node';
Minder.registerInitHook(function initEvents() {
    this._initEvents();
});
MindNode.registerInitHook(function initEvents() {
    this._initEvents();
})
class MindEvent {
    constructor(type, params) {
        var event = this;
        var params = params || {};
        for (var key in params) {
            event[key] = params[key];
        }
        this.type = type;
    }
    getPosition(node) {
        if (!this.minder) return;
        node = node ? this.minder.stage : node.container;
        var transform = node.getAbsoluteTransform().copy();
        transform.invert();
        var evt = this.evt;
        var pos = {
            x: evt.x,
            y: evt.y
        };
        return transform.point(pos);
    }
    getTargetNode() {
        return this.mindNode || null;
    }
    getKeyCode() {
        var evt = this;
        return evt.keyCode || evt.which;
    }
};

Object.assign(Minder.prototype, {
    _initEvents() {
        this.eventCallbacks = {};
    },
    _listen(type, callback) {
        var callbacks = this.eventCallbacks[type] || (this.eventCallbacks[type] = []);
        callbacks.push(callback);
    },
    _fire(e) {
        var status = this.getStatus();
        var callbacks = this.eventCallbacks[e.type] || [];
        if (status) {
            callbacks = callbacks.concat(this.eventCallbacks[status + '.' + e.type.toLowerCase()] || []);
        }
        if (callbacks.length === 0) {
            return ;
        }
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i].call(this, e);
        }
    },

    on(name, callback) {
        var mind = this;
        name.split(/\s+/).forEach(function (n) {
            mind._listen(n.toLowerCase(), callback);
        });
    },

    off(name, callback) {
        var types = name.split(/\s+/);
        var i, j, callbacks, removeIndex;
        for (i = 0; i < types.length; i++) {
            callbacks = this.eventCallbacks[types[i].toLowerCase()];
            if (callbacks) {
                removeIndex = null;
                for (j = 0; j < callbacks.length; j++) {
                    if (callbacks[j] == callback) {
                        removeIndex = j;
                    }
                }
                if (removeIndex !== null) {
                    callbacks.splice(removeIndex, 1);
                }
            }
        }
    },

    fire(type, params) {
        var e = new MindEvent(type, params);
        return this._fire(e);
    }
});
Object.assign(MindNode.prototype, {
    _initEvents() {
        var mindNode = this;
        var node = this.node;
        node.on('click dblclick ', e => {
            e.cancelBubble = true;
            this.fire('node-' + e.type, {
                mindNode
            });
        })
    },
    fire(type, params) {
        this.minder.fire(type, params)
    }
})

export default MindEvent;