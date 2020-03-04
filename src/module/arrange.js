import MindNode from '../node';
import Command from '../command';
import Module from '../module';
Object.assign(MindNode.prototype, {
    arrange(index) {
        var parent = this.parent;
        if (!parent) return;
        var sibling = parent.children;

        if (index < 0 || index >= sibling.length) return;
        sibling.splice(this.getIndex(), 1);
        sibling.splice(index, 0, this);
        return this;
    }
});

function asc(nodeA, nodeB) {
    return nodeA.getIndex() - nodeB.getIndex();
}
function desc(nodeA, nodeB) {
    return -asc(nodeA, nodeB);
}

function canArrange(mind) {
    var selected = mind.getSelectedNode();
    return selected && selected.parent && selected.parent.children.length > 1;
}


/**
 * @command ArrangeUp
 * @description 向上调整选中节点的位置
 * @shortcut Alt + Up
 * @state
 *    0: 当前选中了具有相同父亲的节点
 *   -1: 其它情况
 */
class ArrangeUpCommand extends Command {
    execute(mind) {
        var nodes = mind.getSelectedNodes();
        nodes.sort(asc);
        var lastIndexes = nodes.map(function (node) {
            return node.getIndex();
        });
        nodes.forEach(function (node, index) {
            node.arrange(lastIndexes[index] - 1);
        });
        mind.layout();
    }

    queryState(mind) {
        var selected = mind.getSelectedNode();
        return selected ? 0 : -1;
    }
};

/**
 * @command ArrangeDown
 * @description 向下调整选中节点的位置
 * @shortcut Alt + Down
 * @state
 *    0: 当前选中了具有相同父亲的节点
 *   -1: 其它情况
 */
class ArrangeDownCommand extends Command {
    execute(mind) {
        var nodes = mind.getSelectedNodes();
        nodes.sort(desc);
        var lastIndexes = nodes.map(function (node) {
            return node.getIndex();
        });
        nodes.forEach(function (node, index) {
            node.arrange(lastIndexes[index] + 1);
        });
        mind.layout();
    }

    queryState(mind) {
        var selected = mind.getSelectedNode();
        return selected ? 0 : -1;
    }
};

/**
 * @command Arrange
 * @description 调整选中节点的位置
 * @param {number} index 调整后节点的新位置
 * @state
 *    0: 当前选中了具有相同父亲的节点
 *   -1: 其它情况
 */
class ArrangeCommand extends Command {
    execute(mind, index) {
        var nodes = mind.getSelectedNodes().slice();
        if (!nodes.length) return;
        var ancestor = MindNode.getCommonAncestor(nodes);
        if (ancestor != nodes[0].parent) return;
        var indexed = nodes.map(function (node) {
            return {
                index: node.getIndex(),
                node: node
            };
        });
        var asc = Math.min.apply(Math, indexed.map(function (one) { return one.index; })) >= index;
        indexed.sort(function (a, b) {
            return asc ? (b.index - a.index) : (a.index - b.index);
        });
        indexed.forEach(function (one) {
            one.node.arrange(index);
        });
        mind.layout();
    }

    queryState(mind) {
        var selected = mind.getSelectedNode();
        return selected ? 0 : -1;
    }
};

Module.register('ArrangeModule', {
    commands: {
        arrangeup: ArrangeUpCommand,
        arrangedown: ArrangeDownCommand,
        arrange: ArrangeCommand
    },
    contextmenu: [
        { command: 'arrangeup' },
        { command: 'arrangedown' },
        { divider: true }
    ],
    commandShortcutKeys: {
        arrangeup: 'normal::alt+up',
        arrangedown: 'normal::alt+Down'
    }
});