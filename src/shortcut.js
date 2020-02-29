import Minder from './minder';
import keymap from './keymap';

Minder.registerInitHook(function initShortcutKey() {
    this._initShortcutKey();
});

function getMetaKeyCode(unknown) {
    var CTRL_MASK = 0x1000;
    var ALT_MASK = 0x2000;
    var SHIFT_MASK = 0x4000;
    var metaKeyCode = 0;

    if (typeof (unknown) == 'string') {
        // unknown as string
        unknown.toLowerCase().split(/\+\s*/).forEach(function (name) {
            switch (name) {
                case 'ctrl':
                case 'cmd':
                    metaKeyCode |= CTRL_MASK;
                    break;
                case 'alt':
                    metaKeyCode |= ALT_MASK;
                    break;
                case 'shift':
                    metaKeyCode |= SHIFT_MASK;
                    break;
                default:
                    metaKeyCode |= keymap[name];
            }
        });
    } else {
        if (unknown.ctrlKey || unknown.metaKey) {
            metaKeyCode |= CTRL_MASK;
        }
        if (unknown.altKey) {
            metaKeyCode |= ALT_MASK;
        }
        if (unknown.shiftKey) {
            metaKeyCode |= SHIFT_MASK;
        }
        metaKeyCode |= unknown.keyCode;
    }

    return metaKeyCode;
}

Object.assign(Minder.prototype, {
    _initShortcutKey() {
        var mind = this;
        var container = this.stage.container();
        container.tabIndex = 1;
        container.focus();
        var map = this.shortcutKeys = {};
        container.addEventListener('keydown', e => {
            for (var keys in map) {
                if (getMetaKeyCode(e) == getMetaKeyCode(keys)) {
                    var fn = map[keys];
                    if (fn.statusCondition && fn.statusCondition != this.getStatus()) return;
                    fn();
                    mind.layout();
                    e.preventDefault();
                }
            }
        })
    },
    addShortcut(keys, fn) {
        var binds = this.shortcutKeys;
        keys.split(/\|\s*/).forEach(function (combine) {
            var parts = combine.split('::');
            var status;
            if (parts.length > 1) {
                combine = parts[1];
                status = parts[0];
                fn.statusCondition = status;
            }
            binds[combine] = fn;
        });
    },
    addCommandShortcutKeys(command, shortcutKeys) {
        var binds = this.commandShortcutKeys || (this._commandShortcutKeys = {});
        var obj = {};
        if (shortcutKeys) {
            obj[command] = shortcutKeys;
        } else {
            obj = command;
        }
        var minder = this;
        var commands = Object.keys(obj);
        commands.forEach((command) => {
            var shortcutKeys = binds[command] = obj[command];
            minder.addShortcut(shortcutKeys, function execCommandByShortcut() {
                if (minder.queryCommandState(command) !== -1) {
                    minder.execCommand(command);
                }
            });
        })
    },
    getCommandShortcutKey(cmd) {
        var binds = this.commandShortcutKeys;
        return binds && binds[cmd] || null;
    },
});