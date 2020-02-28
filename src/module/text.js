import Minder from '../minder';
Minder.registerInitHook(function () {
    this._initTextEdit();
});
Object.assign(Minder.prototype, {
    _initTextEdit() {
        var minder = this;
        var textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.hidden = true;
        textarea.draggable = true;
        textarea.style.border = "3px solid green";
        textarea.style.fontSize = "40px";
        textarea.style.position = 'absolute';
        textarea.addEventListener('blur', e => {
            if (!minder.textNode) return;
            minder.textNode.text(textarea.value);
            minder.stage.draw();
            textarea.hidden = true;
            minder.textNode = null;
        });
        textarea.addEventListener('keydown', e => {
            if (!this.hidden && e.keyCode === 27) {
                minder.textNode.text(textarea.value);
                minder.stage.draw();
                textarea.hidden = true;
                minder.textNode = null;
            }
        });
        this.on("dblclick", e => {
            if (e.getTargetNode() == null)
                return;
            var textNode = e.getTargetNode().text;
            minder.textNode = textNode;
            var textPosition = textNode.getAbsolutePosition();
            var stageBox = this.stage.container().getBoundingClientRect();
            var areaPosition = {
                x: stageBox.left + textPosition.x,
                y: stageBox.top + textPosition.y
            };
            textarea.value = textNode.text();
            textarea.style.top = areaPosition.y + 'px';
            textarea.style.left = areaPosition.x + 'px';
            textarea.hidden = false;
            textarea.focus();

        })
    }
});