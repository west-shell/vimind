import Module from '../module';
Module.register('view', {
    init() {
        var mind = this;
        var stage = this.stage;
        mind.on('selectedchange', e => {
            var width = stage.width();
            var height = stage.height();
            var offset = 100;
            var dx = 0, dy = 0;
            var node = mind.getSelectedNode();
            var { x, y } = node.container.absolutePosition();
            if (x < offset) dx = offset - x;
            else if (x > width - offset) dx = width - offset - x;
            if (y < offset) dy = offset - y;
            else if (y > height - offset) dy = height - offset - y;
            stage.move({
                x: dx,
                y: dy
            })
        })
    }
})