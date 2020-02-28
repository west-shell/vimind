import Konva from 'konva';
import Minder from './minder';
Minder.registerInitHook(function () {
    this._initlayer();
});
Object.assign(Minder.prototype, {
    _initlayer() {
        var stage = this.stage;
        var container= this.container= new Konva.Layer();
        var minder = this.container.minder = this;
        this.setRoot(this.createNode({ draggable: false }));
        stage.add(container);
        let scaleBy = 1.02;
        var x = window.innerWidth / 2;
        var y = window.innerHeight / 2;
        stage.position({ x, y });
        stage.on('wheel', e => {
            e.evt.preventDefault();
            var oldScale = stage.scaleX();
            var mousePointTo = minder.getMousePointTo();
            var newScale =
                e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
            stage.scale({ x: newScale, y: newScale });
            var newPos = {
                x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
                y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
            };
            stage.position(newPos);
            stage.batchDraw();
            return stage;
        });
        stage.draw();
    },
    renderTo(target) {
        if (target instanceof String) {
            target = document.querySelector(target);
        }
        if (target && target.tagName.toLowerCase() == 'script') {
            var newTarget = document.createElement('div');
            newTarget.id = target.id;
            newTarget.class = target.class;
            target.parentNode.insertBefore(newTarget, target);
            target.parentNode.removeChild(target);
            target = newTarget;
        }
        target.classList.add('vm-view');
        this.stage.container(target);
        target.tabIndex = 1;
        target.focus();
        this.fire('paperrender')

    },
    getMousePointTo() {
        var stage = this.stage;
        return {
            x: stage.getPointerPosition().x / stage.scaleX() - stage.x() / stage.scaleX(),
            y: stage.getPointerPosition().y / stage.scaleX() - stage.y() / stage.scaleX()
        };
    },
    getRenderContainer() {
        return this.container;
    },
    getRenderTarget() {
        return this.stage.container();
    }
})