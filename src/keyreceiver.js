import Minder from './minder';

Minder.registerInitHook(function initKeyReceiver(option) {
    this._initKeyReceiver();
});

Object.assign(Minder.prototype, {
    _initKeyReceiver() {
        var mind = this;
        var container = this.stage.container();
        container.tabIndex = 1;
        container.focus();
        container.addEventListener('keydown', e => {
            mind.fire(e.type, e);
        })
    }
});