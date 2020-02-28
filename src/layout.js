import Minder from './minder';
import MindNode from './node';
import Box from './box';

Minder.registerInitHook(function initLayout(options) {
    this.layout();
});

var _layouts = {};
var _defaultLayout;

/**
 * @class Layout 布局基类，具体布局需要从该类派生
 */
class Layout {
    static register(name, layout) {
        _layouts[name] = layout;
        _defaultLayout = _defaultLayout || name;
    }
    /**
     * @abstract
     *
     * 子类需要实现的布局算法，该算法输入一个节点，排布该节点的子节点（相对父节点的变换）
     *
     * @param  {MindNode} node 需要布局的节点
     *
     * @example
     *
     * doLayout(node) {
     *     var children = node.getChildren();
     *     // layout calculation
     *     children[i].setLayoutTransform(new kity.Matrix().translate(x, y));
     * }
     */
    doLayout(parent, children) {
        throw new Error('Not Implement: Layout.doLayout()');
    }

    /**
     * 对齐指定的节点
     *
     * @param {Array<MindNode>} nodes 要对齐的节点
     * @param {string} border 对齐边界，允许取值 left, right, top, bottom
     *
     */
    align(nodes, border, offset) {
        offset = offset || 0;
        nodes.forEach(function (node) {
            var tbox = node.getTreeBox();
            var size = node.parent.node.size();
            switch (border) {
                case 'left':
                    return node.container.x(offset + size.width);
                case 'right':
                    return node.container.x(-offset - tbox.width);
                case 'top':
                    return node.container.y(offset + size.height);
                case 'bottom':
                    return node.container.y(-offset - tbox.height);
            }
        });
    }

    stack(nodes, axis, distance, anchor) {
        var position = 0;
        distance = distance || 0;
        nodes.forEach(function (node, index) {
            var tbox = node.getTreeBox();
            var size = {
                x: tbox.width,
                y: tbox.height
            }[axis];
            if (axis == 'x') {
                node.container.x(position);
            } else if (axis == "y") {
                node.container.y(-position);
            }
            if (nodes[index + 1])
                position += (size + distance);
        });
        if (anchor == "middle") {
            nodes.forEach(function (node) {
                if (axis == 'x') node.container.move({ x: -position / 2 });
                else if (axis == 'y') node.container.move({ y: position / 2 });
            });
        }

    }

    move(nodes, dx, dy) {
        nodes.forEach(function (node) {
            node.container.move({ x: dx, y: dy });
        });
    }

    /**
     * 工具方法：获取给点的节点所占的布局区域
     * @param  {MindNode[]} nodes 需要计算的节点
     * @return {Box} 计算结果
     * 已修改
     */
    getBranchBox(nodes) {
        var i, node, contentBox;
        var box = new Box();
        for (i = 0; i < nodes.length; i++) {
            node = nodes[i];
            contentBox = node.getContentBox();
            box = box.merge(contentBox);
        }
        return box;
    }

    /**
     * 工具方法：计算给定的节点的子树所占的布局区域
     * @param  {MindNode} nodes 需要计算的节点
     * @return {Box} 计算的结果
     * 已修改
     */
    getTreeBox(nodes) {
        var i, node, treeBox;
        var box = new Box();
        if (!(nodes instanceof Array)) nodes = [nodes];
        for (i = 0; i < nodes.length; i++) {
            node = nodes[i];
            treeBox = node.getTreeBox();
            box = box.merge(treeBox);
        }
        return box;
    }
}

/**
 * 布局支持池子管理
 */
Object.assign(Minder, {

    getLayoutList() {
        return _layouts;
    },

    getLayoutInstance(name) {
        var LayoutClass = _layouts[name];
        if (!LayoutClass) throw new Error('Missing Layout: ' + name);
        var layout = new LayoutClass();
        return layout;
    }
});

/**
 * MindNode 上的布局支持
 */
Object.assign(MindNode.prototype, {
    getPosition() {
        return this.container.position();
    },

    getTreeBox() {
        return new Box(this.container.getClientRect({
            relativeTo: this.container.parent
        }));
    },
    getContentBox() {
        return new Box(this.node.getClientRect({
            relativeTo: this.container
        }));
    },

    /**
     * 获得当前节点的布局名称
     *
     * @return {String}
     */
    getLayout() {
        var layout = this.getData('layout');

        layout = layout || (this.isRoot() ? _defaultLayout : this.parent.getLayout());

        return layout;
    },

    setLayout(name) {
        if (name) {
            if (name == 'inherit') {
                this.setData('layout');
            } else {
                this.setData('layout', name);
            }
        }
        return this;
    },

    layout(name) {

        this.setLayout(name).getMinder().layout();
        return this;
    },

    getLayoutInstance() {
        return Minder.getLayoutInstance(this.getLayout());
    },

    /**
     * 获取当前节点相对于父节点的布局变换
     * 已修改
     */
    getLayoutTransform() {
        return this.container.getTransform();
    },

    /**
     * 第一轮布局计算后，获得的全局布局位置
     * 已修改
     */
    getGlobalLayoutTransform() {
        return this.container.getAbsoluteTransform();
    },

    /**
     * 设置当前节点相对于父节点的布局变换
     * 已修改
     */
    setLayoutTransform(transform) {
        //transform:Konva.Transform
        var position = transform.getTranslation();
        this.container.position(position);
        return this;
    },

    /**
     * 设置当前节点相对于全局的布局变换（冗余优化）
     * 已修改
     */
    setGlobalLayoutTransform(transform) {
        var position = transform.getTransform();
        this.container.absolutePosition(position);
        return this;
    },

    setVertexIn(p) {
        this._vertexIn = p;
    },

    setVertexOut(p) {
        this._vertexOut = p;
    },

    getVertexIn() {
        return this._vertexIn || { x: 0, y: 0 };
    },

    getVertexOut() {
        return this._vertexOut || { x: 0, y: 0 };
    },

    getLayoutVertexIn() {
        return this.getGlobalLayoutTransform().transformPoint(this.getVertexIn());
    },

    getLayoutVertexOut() {
        return this.getGlobalLayoutTransform().transformPoint(this.getVertexOut());
    },

    setLayoutVectorIn(v) {
        this._layoutVectorIn = v;
        return this;
    },

    setLayoutVectorOut(v) {
        this._layoutVectorOut = v;
        return this;
    },

    getLayoutVectorIn() {
        return this._layoutVectorIn;
    },

    getLayoutVectorOut() {
        return this._layoutVectorOut;
    },

    getLayoutBox() {
        var matrix = this.getGlobalLayoutTransform();
        return matrix.transformBox(this.getContentBox());
    },

    getLayoutPoint() {
        var matrix = this.getGlobalLayoutTransform();
        return matrix.transformPoint(new kity.Point());
    },

    getLayoutOffset() {
        if (!this.parent) return new kity.Point();

        // 影响当前节点位置的是父节点的布局
        var data = this.getData('layout_' + this.parent.getLayout() + '_offset');

        if (data) return new kity.Point(data.x, data.y);

        return new kity.Point();
    },

    setLayoutOffset(p) {
        if (!this.parent) return this;

        this.setData('layout_' + this.parent.getLayout() + '_offset', p ? {
            x: p.x,
            y: p.y
        } : undefined);

        return this;
    },

    hasLayoutOffset() {
        return !!this.getData('layout_' + this.parent.getLayout() + '_offset');
    },

    resetLayoutOffset() {
        return this.setLayoutOffset(null);
    },

    getLayoutRoot() {
        if (this.isLayoutRoot()) {
            return this;
        }
        return this.parent.getLayoutRoot();
    },

    isLayoutRoot() {
        return this.getData('layout') || this.isRoot();
    }
});

/**
 * Minder 上的布局支持
 */
Object.assign(Minder.prototype, {

    layout() {
        var root = this.getRoot();
        var layout = root.getLayoutInstance();
        this.getRoot().traverse(function (node) {
            node.container.position(0, 0);
            layout.doLayout(node);
        });
        this.stage.draw();
        this.fire('layout');
    },
    getRelativePointerPosition(node) {
        node = node.container;
        // the function will return pointer position relative to the passed node
        var transform = node.getAbsoluteTransform().copy();
        // to detect relative position we need to invert transform
        transform.invert();
        // get pointer (say mouse or touch) position
        var pos = this.stage.getPointerPosition();
        // now we find relative point
        return transform.point(pos);
    }
});
export { Layout };
