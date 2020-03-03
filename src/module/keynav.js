import Module from '../module';
import Command from '../command';
class navigateUp extends Command {
    execute(mind) {
        console.log(mind);
        var node = mind.getSelectedNode();
        if (!node) {
            mind.select(mind.root, true);
            return;
        }
        if (node.parent)
            mind.select(node.parent);
    }
}
class navigateLeft extends Command {
    execute(mind) {
        var node = mind.getSelectedNode();
        if (!node) {
            mind.select(mind.root, true);
            return;
        }
        var index = node.getIndex();
        if (index > 0)
            mind.select(node.parent.children[index - 1]);
    }
}
class navigateRight extends Command {
    execute(mind) {
        var node = mind.getSelectedNode();
        if (!node) {
            mind.select(mind.root, true);
            return;
        }
        var index = node.getIndex();
        if (index >= 0 && node.parent.children[index + 1])
            mind.select(node.parent.children[index + 1]);
    }
}
class navigateDown extends Command {
    execute(mind) {
        var node = mind.getSelectedNode();
        if (!node) {
            mind.select(mind.root, true);
            return;
        }
        if (node.children && node.children[0]) {
            mind.select(node.children[0]);
        }
    }
}

Module.register('KeynavModule', {
    commands: {
        navigateUp,
        navigateLeft,
        navigateRight,
        navigateDown
    },
    commandShortcutKeys: {
        navigateUp:'normal::up',
        navigateLeft:'normal::left',
        navigateRight:'normal::right',
        navigateDown:'normal::down'
    }
})