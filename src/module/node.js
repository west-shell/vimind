import Command from '../command';
import Module from '../module';

/**
 * @command AppendChildNode
 * @description 添加子节点到选中的节点中
 * @param {string|object} textOrData 要插入的节点的文本或数据
 * @state
 *    0: 当前有选中的节点
 *   -1: 当前没有选中的节点
 */
class AppendChildCommand extends Command {
    execute(vm, text) {
        var parent = vm.getSelectedNode();
        if (!parent) {
            return null;
        }
        var node = vm.createNode(text, parent);
        vm.select(node, true);
        if (!parent.isExpanded()) {
            parent.expand();
        }
        vm.layout();
    }
    queryState(vm) {
        var selectedNode = vm.getSelectedNode();
        return selectedNode ? 0 : -1;
    }
}

/**
 * @command AppendSiblingNode
 * @description 添加选中的节点的兄弟节点
 * @param {string|object} textOrData 要添加的节点的文本或数据
 * @state
 *    0: 当前有选中的节点
 *   -1: 当前没有选中的节点
 */
class AppendSiblingCommand extends Command {
    execute(vm, text) {
        var sibling = vm.getSelectedNode();
        var parent = sibling.parent;
        if (!parent) return;
        var node = vm.createNode(text, parent, sibling.getIndex() + 1);
        vm.select(node, true);
        vm.layout();
    }
    queryState(vm) {
        var selectedNode = vm.getSelectedNode();
        return selectedNode ? 0 : -1;
    }
}
/**
 * @command RemoveNode
 * @description 移除选中的节点
 * @state
 *    0: 当前有选中的节点
 *   -1: 当前没有选中的节点
 */
class RemoveNodeCommand extends Command {
    execute(vm) {
        var node = vm.getSelectedNode();
        var parent = node.parent;
        var index = node.getIndex();
        vm.removeNode(node);
        var selectBack = parent.children[index - 1] || parent.children[index];
        vm.select(selectBack || parent || vm.getRoot(), true);
        vm.layout();
    }
    queryState(vm) {
        var selectedNode = vm.getSelectedNode();
        return selectedNode && !selectedNode.isRoot() ? 0 : -1;
    }
}

Module.register('NodeModule', {
    commands: {
        'AppendChildNode': AppendChildCommand,
        'AppendSiblingNode': AppendSiblingCommand,
        'RemoveNode': RemoveNodeCommand
    },
    commandShortcutKeys: {
        'appendsiblingnode': 'normal::Enter',
        'appendchildnode': 'normal::Insert|Tab',
        'removenode': 'normal::Del|Backspace'
    }
});