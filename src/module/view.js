import Module from '../module';
Module.register('view', {
    init() {
        var mind = this;
        var stage = this.stage;
        mind.on('selectedchange', e => {
            var width = stage.width();
            var height = stage.height();
            var node = mind.getSelectedNode();
            var { x, y } = node.container.absolutePosition();
            stage.move({
                x: width / 2 - x,
                y: height / 2 - y
            })
            // stage.position(pos);
        })
    }
})