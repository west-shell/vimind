import Konva from 'konva';
import MindNode from '../node';
import Command from '../command';
import Module from '../module';
Module.register('Expand', function () {
    var minder = this;
    var EXPAND_STATE_DATA = 'expandState',
        STATE_EXPAND = 'expand',
        STATE_COLLAPSE = 'collapse';

    // 将展开的操作和状态读取接口拓展到 MindNode 上
    Object.assign(MindNode.prototype, {
        /**
         * 展开节点
         * @param  {Policy} policy 展开的策略，默认为 KEEP_STATE
         */
        expand() {
            this.setData(EXPAND_STATE_DATA, STATE_EXPAND);
            this.children.forEach(element => {
                element.container.visible(true);
                element.connection.visible(true)
            });
            return this;
        },

        /**
         * 收起节点
         */
        collapse() {
            this.setData(EXPAND_STATE_DATA, STATE_COLLAPSE);
            this.children.forEach(element => {
                element.container.visible(false);
                element.connection.visible(false);
            });
            return this;
        },

        /**
         * 判断节点当前的状态是否为展开
         */
        isExpanded() {
            var expanded = this.getData(EXPAND_STATE_DATA) !== STATE_COLLAPSE;
            return expanded && (this.isRoot() || this.parent.isExpanded());
        },

        /**
         * 判断节点当前的状态是否为收起
         */
        isCollapsed() {
            return !this.isExpanded();
        }
    });

    /**
     * @command Expand
     * @description 展开当前选中的节点，保证其可见
     * @param {bool} justParents 是否只展开到父亲
     *     * `false` - （默认）保证选中的节点以及其子树可见
     *     * `true` - 只保证选中的节点可见，不展开其子树
     * @state
     *   0: 当前有选中的节点
     *  -1: 当前没有选中的节点
     */
    class ExpandCommand extends Command {
        execute(km, justParents) {
            var node = km.getSelectedNode();
            if (!node) return;
            if (justParents) {
                node = node.parent;
            }
            while (node.parent) {
                node.expand();
                node = node.parent;
            }
            km.layout();
        }
        queryState(km) {
            var node = km.getSelectedNode();
            return node && !node.isRoot() && !node.isExpanded() ? 0 : -1;
        }
    };

    /**
     * @command ExpandToLevel
     * @description 展开脑图到指定的层级
     * @param {number} level 指定展开到的层级，最少值为 1。
     * @state
     *   0: 一直可用
     */
    class ExpandToLevelCommand extends Command {
        execute(km, level) {
            km.getRoot().traverse(function (node) {
                if (node.getLevel() < level) node.expand();
                if (node.getLevel() == level && !node.isLeaf()) node.collapse();
            });
            km.layout();
        }
    };

    /**
     * @command Collapse
     * @description 收起当前节点的子树
     * @state
     *   0: 当前有选中的节点
     *  -1: 当前没有选中的节点
     */
    class CollapseCommand extends Command {
        execute(km) {
            var node = km.getSelectedNode();
            if (!node) return;
            node.collapse();
            km.layout();
        }
        queryState(km) {
            var node = km.getSelectedNode();
            return node && !node.isRoot() && node.isExpanded() ? 0 : -1;
        }
    };

    class Expander {
        constructor(node) {
            if (!node) return;
            var expander = this.container = new Konva.Group();
            this.node = node;
            this.outline = new Konva.Circle({
                radius: 16,
                fill: 'red',
                stroke: 'red'
            });
            // this.sign = new Konva.Path({
            // data:'M413.04,235.229l0.357-1.426l-1.783-3.453l6.902-12.5c0,0,8.725-7.9,6.313-5.718c-2.411,2.185,4.523-1.188,4.523-1.188l4.268-5.423l-1.647-1.125l-1.56-3.907l-3.319,1.286l-5.479-1.428l-0.237-1.428l-0.238-9.17l3.69-1.667l-0.419-1.563l-0.177-0.104l0.81-3.557l-5.094,2.128l0.832,1.905l0.178,1.424l0.18,1.433l-2.857,1.19l-1.785,1.667l-3.692-1.071l-4.881,0.834l-0.832-2.264l0.594-4.287l3.693-4.286l0.831-4.88l3.691-3.691l6.666,3.454h1.668l1.189,4.762l1.905,0.95l0.953,3.1l-0.356,2.024l4.047,2.854l0.594,2.264l3.338,1.428l8.332-4.523v-2.621l4.883-7.143l-3.45-4.881l-2.621-0.238l-4.763-3.218l1.668-5.118l-7.387-0.595l-3.213-4.765l0.357-2.619l-6.31-6.906l-4.051,2.026l-3.451,3.452l1.191,2.62l-0.834,1.667l-4.882,0.237l-2.264,2.022l-2.022-0.835l-2.021,2.026l-4.527,3.453l-2.024-1.43v-4.644l-1.666-0.832l-2.619,1.189l-3.096,6.547l-1.189,6.311l3.689,6.19l3.215,2.858v5.24l1.904,4.286l-0.834,4.764l-4.884,3.213l-2.26,7.382l4.049,4.645l2.857,5.717l-1.785,2.857l-0.477,3.928l-1.787,2.619l-0.834,2.859l2.621,3.446l11.43,1.431l4.524-1.787L413.04,235.229z',
            // stroke: 'gray',
            // });
            expander.add(this.outline);
            // expander.add(this.sign);
            node.container.add(expander);
            this.initEvent(node);
        }

        initEvent(node) {
            var expander = this.container;
            expander.on('mousedown', function (e) {
                if (node.isExpanded()) {
                    node.collapse();
                } else {
                    node.expand();
                }
                minder.layout();
            });
        }

    }
    return {
        commands: {
            expand: ExpandCommand,
            expandtolevel: ExpandToLevelCommand,
            collapse: CollapseCommand
        },
        events: {
            nodecreate: e => {
                e.node.expander = new Expander(e.node);
            }
        },
        commandShortcutKeys: {
            expand: 'normal::alt+/',
            collapse: 'normal::alt+.'
        }
    }
})