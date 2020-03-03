import Minder from './minder';
import MinderNode from './node';
Minder.registerInitHook(function initSelection() {
    this._initSelection();
});
Object.assign(Minder.prototype, {
    _initSelection() {
        this._selectedNodes = [];
        this.on('node-click', e => {
            this.select(e.mindNode, true);
        })
    },
    selectionChanged(last) {
        var current = this.getSelectedNodes();
        var changed = [];
        current.forEach(function (node) {
            if (last.indexOf(node) == -1) {
                changed.push(node);
            }
        });
        last.forEach(function (node) {
            if (current.indexOf(node) == -1) {
                changed.push(node);
            }
        });
        if (changed.length) {
            this.toggleSelect(changed);
            this.fire('selectionchange');
            this.stage.batchDraw();
        }
    },
    getSelectedNodes() {
        return this._selectedNodes;
    },
    getSelectedNode() {
        return this.getSelectedNodes()[0] || null;
    },
    removeAllSelectedNodes() {
        var last = this._selectedNodes.splice(0);
        this.selectionChanged(last);
        this.fire('selectionclear');
        return this;
    },
    removeSelectedNodes(nodes) {
        if (!nodes) return this;
        var me = this;
        var last = this._selectedNodes.slice(0);
        nodes = (nodes instanceof Array) ? nodes : [nodes];
        nodes.forEach(function (node) {
            var index = me._selectedNodes.indexOf(node);
            if (index === -1) return;
            me._selectedNodes.splice(index, 1);
        });
        this.selectionChanged(last);
        return this;
    },
    select(nodes, isSingleSelect) {
        isSingleSelect = true;
        if (!nodes) {
            this.removeAllSelectedNodes();
            return this;
        }
        var last = this._selectedNodes.slice(0);
        if (isSingleSelect) {
            this._selectedNodes = [];
        }
        var me = this;
        nodes = (nodes instanceof Array) ? nodes : [nodes];
        nodes.forEach(function (node) {
            if (me._selectedNodes.indexOf(node) !== -1) return;
            me._selectedNodes.unshift(node);
        });
        this.selectionChanged(last);
        return this;
    },
    //当前选区中的节点在给定的节点范围内的保留选中状态，
    //没在给定范围的取消选中，给定范围中的但没在当前选中范围的也做选中效果
    toggleSelect(nodes) {
        if (!nodes) return this;
        nodes = (nodes instanceof Array) ? nodes : [nodes];
        nodes.forEach((node) => {
            node.toggleSelect();
        });
        return this;
    },
    isSingleSelect() {
        return this._selectedNodes.length == 1;
    },

    getSelectedAncestors(includeRoot) {
        var nodes = this.getSelectedNodes().slice(0),
            ancestors = [],
            judge;

        // 根节点不参与计算
        var rootIndex = nodes.indexOf(this.getRoot());
        if (~rootIndex && !includeRoot) {
            nodes.splice(rootIndex, 1);
        }

        // 判断 nodes 列表中是否存在 judge 的祖先
        function hasAncestor(nodes, judge) {
            for (var i = nodes.length - 1; i >= 0; --i) {
                if (nodes[i].isAncestorOf(judge)) return true;
            }
            return false;
        }
        nodes.sort(function (node1, node2) {
            return node1.getLevel() - node2.getLevel();
        });

        while ((judge = nodes.pop())) {
            if (!hasAncestor(nodes, judge)) {
                ancestors.push(judge);
            }
        }

        return ancestors;
    }
});

Object.assign(MinderNode.prototype, {
    select() {
        this.selected = true;
        this.node.background.stroke('yellow');
    },
    unselect() {
        this.selected = false;
        this.node.background.stroke('');
    },
    toggleSelect() {
        if (!this.selected)
            this.select();
        else this.unselect();
    },
    isSelected() {
        var minder = this.getMinder();
        return minder && minder.getSelectedNodes().indexOf(this) != -1;
    }
});
