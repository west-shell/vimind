import Konva from 'konva';
import Minder from './minder';

var ATTR_CHANGE_LIST = [
    'fontFamily',
    'fontSize',
    'fontStyle',
    'padding',
    'lineHeight',
    'text',
    'width'
];
var CHANGE_KONVA = 'Change.konva'
var attrChangeListLen = ATTR_CHANGE_LIST.length;

class Node extends Konva.Group {
    constructor(config) {
        super(config)
        this.background = new Konva.Circle({
            fill: 'green',
            shadowColor: 'yellow',
            shadowBlur: 10,
            shadowOffsetX: 12,
            shadowOffsetY: 10,
            shadowOpacity: 0.2,
            cornerRadius: 10,
        });
        var text = this.text = new Konva.Text({
            text: 'vimind',
            fontSize: 30,
            align: 'center',
        })
        text.offsetX(text.width() / 2);
        text.offsetY(text.height() / 2);
        this.add(this.background);
        this.add(this.text);
        this._addListeners(this.background);
        this._addListeners(this.text);
        this._sync();
    }
    getText() {
        return this.text;
    }
    getBackgroud() {
        return this.background;
    }
    _addListeners(text) {
        var that = this, n;
        var func = function () {
            that._sync();
        };
        // update text data for certain attr changes
        for (n = 0; n < attrChangeListLen; n++) {
            text.on(ATTR_CHANGE_LIST[n] + CHANGE_KONVA, func);
        }
    }
    getWidth() {
        return this.getText().width();
    }
    getHeight() {
        return this.getText().height();
    }
    _sync() {
        var text = this.getText(),
            background = this.getBackgroud(),
            width,
            height,
            radius = 20;
        if (text && background) {
            width = text.width();
            height = text.height();
            radius = Math.max(width, height, 50) * 0.6
        }
        background.setAttrs({
            radius
        });
        text.offsetX(width / 2);
        text.offsetY(height / 2);
    }
}
let initHooks = [];
class MindNode {
    static registerInitHook(hook) {
        initHooks.push(hook);
    }
    constructor(textOrData) {
        this.parent = null;
        this.root = this;
        this.children = [];
        this.initContainer(textOrData);
        initHooks.forEach(initHook => {
            if (initHook instanceof Function) {
                initHook.call(this, this.data);
            }
        })
    }
    initContainer(textOrData) {
        var data = {
            text: "vimind",
            x: 0,
            y: 0,
            draggable: true
        }
        if (textOrData instanceof String) {
            data.text = textOrData;
        } else if (textOrData instanceof Object)
            data = Object.assign(data, textOrData);
        var container = this.container = new Konva.Group({
            x: data.x,
            y: data.y,
            draggable: data.draggable
        });
        var node = this.node = new Node();
        node.mindNode = this;
        node.background.mindNode = this;
        node.text.mindNode = this;
        container.add(node);
        container.mindNode = this;
        this.data = {
            get text() { return node.text.text(); },
            set text(text) { node.text.text(text) },
            get x() { return container.x(); },
            set x(x) { container.x(x); },
            get y() { return container.y(); },
            set y(y) { container.y(y); }
        };
    }
    isRoot() {
        return this.root === this;
    }
    isLeaf() {
        return this.children.length === 0;
    }
    getRoot() {
        return this.root || this;
    }
    getParent() {
        return this.parent;
    }
    getSiblings() {
        var children = this.parent.children;
        var siblings = [];
        var self = this;
        children.forEach(function (child) {
            if (child != self) siblings.push(child);
        });
        return siblings;
    }
    getLevel() {
        var level = 0;
        var ancestor = this.parent;
        while (ancestor) {
            level++;
            ancestor = ancestor.parent;
        }
        return level;
    }
    //   获得节点的复杂度（即子树中节点的数量）
    getComplex() {
        var complex = 0;
        this.traverse(function () {
            complex++;
        });
        return complex;
    }
    getType() {
        this.type = ['root', 'main', 'sub'][Math.min(this.getLevel(), 2)];
        return this.type;
    }
    isAncestorOf(test) {
        var ancestor = test.parent;
        while (ancestor) {
            if (ancestor == this) return true;
            ancestor = ancestor.parent;
        }
        return false;
    }
    getData(key) {
        return key ? this.data[key] : this.data;
    }
    setData(key, value) {
        if (typeof key == 'object') {
            var data = key;
            for (key in data) {
                if (data.hasOwnProperty(key)) {
                    this.data[key] = data[key];
                }
            }
        } else
            this.data[key] = value;
        return this;
    }
    setText(text) {
        this.data.text = text;
        return this;
    }
    getText() {
        return this.data.text;
    }
    /**
     * 先序遍历当前节点树
     * @param  {Function} fn 遍历函数
     */
    preTraverse(fn, excludeThis) {
        var children = this.getChildren();
        if (!excludeThis) fn(this);
        for (var i = 0; i < children.length; i++) {
            children[i].preTraverse(fn);
        }
    }
    /**
     * 后序遍历当前节点树
     * @param  {Function} fn 遍历函数
     */
    postTraverse(fn, excludeThis) {
        var children = this.getChildren();
        for (var i = 0; i < children.length; i++) {
            children[i].postTraverse(fn);
        }
        if (!excludeThis) fn(this);
    }
    traverse(fn, excludeThis) {
        return this.postTraverse(fn, excludeThis);
    }
    getChildren() {
        return this.children;
    }
    getIndex() {
        return this.parent ? this.parent.children.indexOf(this) : -1;
    }
    insertChild(node, index) {
        if (index === undefined) {
            index = this.children.length;
        }
        if (node.parent) {
            node.parent.removeChild(node);
        }
        node.parent = this;
        node.root = this.root;

        this.children.splice(index, 0, node);
        this.container.add(node.container);
        this.fire('nodeappend', {
            node,
            parent: node.parent,
            index
        });
    }
    appendChild(node) {
        return this.insertChild(node);
    }
    prependChild(node) {
        return this.insertChild(node, 0);
    }
    removeChild(node) {
        var index = node.getIndex();
        if (index >= 0) {
            this.children.splice(index, 1);
            node.parent = null;
            node.root = node;
            node.container.remove();
        }
        this.fire('noderemove', {
            node
        });
    }
    clearChildren() {
        this.children = [];
    }
    getChild(index) {
        return this.children[index];
    }
    getRenderContainer() {
        return this.container;
    }

    getCommonAncestor(node) {
        return MindNode.getCommonAncestor(this, node);
    }

    contains(node) {
        return this == node || this.isAncestorOf(node);
    }

    clone() {
        var cloned = new MindNode();

        cloned.data = JSON.parse(JSON.stringify(this.data));

        this.children.forEach(function (child) {
            cloned.appendChild(child.clone());
        });

        return cloned;
    }
    getMinder() {
        return this.getRoot().minder;
    }
    getAbsolutePosition() {
        return this.container.absolutePosition();
    }
    setAbsolutePosition(positon) {
        return this.container.absolutePosition(positon);
    }
}

Object.assign(Minder.prototype, {
    getRoot() {
        return this.root;
    },

    setRoot(root) {
        this.root = root;
        root.minder = this;
    },

    getAllNode() {
        var nodes = [];
        this.getRoot().traverse(function (node) {
            nodes.push(node);
        });
        return nodes;
    },

    getNodeById(id) {
        return this.getNodesById([id])[0];
    },

    getNodesById(ids) {
        var nodes = this.getAllNode();
        var result = [];
        nodes.forEach(function (node) {
            if (ids.indexOf(node.getData('id')) != -1) {
                result.push(node);
            }
        });
        return result;
    },

    createNode(textOrData, parent, index) {
        let node = new MindNode(textOrData);
        node.minder = this;
        this.fire('nodecreate', {
            node: node,
            parent: parent,
            index: index
        });
        this.appendNode(node, parent, index);
        return node;
    },

    appendNode(node, parent, index) {
        if (!parent)
            this.container.add(node.container);
        else
            parent.insertChild(node, index);
        return this;
    },

    removeNode(node) {
        if (node.parent) {
            node.parent.removeChild(node);
        }
    }
});
export default MindNode;