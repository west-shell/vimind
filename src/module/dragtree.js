import Module from '../module';
Module.register('DragTreeModule', {
    init() {
        var mind = this;
        var layer = this.container;
        var stage = this.stage;
        stage.on('dragend', e => {
            var node;
            if (!e.target || !e.target.mindNode)
                return;
            node = e.target.mindNode;
            node.node.visible(false);
            layer.draw();
            var pos = stage.getPointerPosition();
            var shape = layer.getIntersection(pos);
            if (shape && shape.mindNode) {
                var downNode = shape.mindNode;
                node.parent.removeChild(node);
                downNode.appendChild(node);
            }
            node.node.visible(true);
            mind.layout();
        });
    }
})