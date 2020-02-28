import Module from '../module';
function navigateTo(mind, key) {
    var node = mind.getSelectedNode();
    if (!node) {
        mind.select(mind.root, true);
        return;
    }
    var index = node.getIndex();
    switch (key) {
        case 'up':
            if (node.parent)
                mind.select(node.parent);
            break;
        case 'left':
            if (index > 0)
                mind.select(node.parent.children[index - 1]);
            break;
        case 'right':
            if (index >= 0 && node.parent.children[index + 1])
                mind.select(node.parent.children[index + 1]);
            break;
        case 'down':
            console.log("down");
            if (node.children[0]) {
                mind.select(node.children[0]);
            }
            break;
    }
}
Module.register('KeynavModule', {
    'events': {
        'normal.keydown readonly.keydown': function (e) {
            var minder = this;
            ['left', 'right', 'up', 'down'].forEach(function (key) {
                if (e.isShortcutKey(key)) {
                    navigateTo(minder, key);
                }
            });
        }
    }
})