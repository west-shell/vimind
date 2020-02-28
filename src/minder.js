import Konva from 'konva';
Konva.hitOnDragEnabled = true;
let initHooks = [];
class Minder {
    constructor(options) {
        var container;
        options = options || {};
        if (options.container)
            container = options.container;
        else container = document.createElement('div');
        if (window) {
            var width = window.innerWidth;
            var height = window.innerHeight;
        }
        var stage = this.stage= new Konva.Stage({
            container: container,
            width: width || 1000,
            height: height || 700,
            draggable: true
        })
        windowResize(stage);
        this.stage.minder = this;
        this.options = options;
        let initHook;
        while (initHooks.length) {
            initHook = initHooks.shift();
            if (initHook instanceof Function) {
                initHook.call(this, this.options);
            }
        }
    }
    static registerInitHook(hook) {
        initHooks.push(hook);
    }
}
function windowResize(stage) {
    var lastDist = 0;
    stage.on('touchmove', e => pinchSclale(e, lastDist));
    stage.on('touchend', function () {
        lastDist = 0;
    });
    window.addEventListener('resize', e => fitContainer(e, stage));

}
function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}
function pinchSclale(e, lastDist) {
    e.evt.preventDefault();
    var touch1 = e.evt.touches[0];
    var touch2 = e.evt.touches[1];
    if (touch1 && touch2) {
        var dist = getDistance({
            x: touch1.clientX,
            y: touch1.clientY
        }, {
            x: touch2.clientX,
            y: touch2.clientY
        });
        if (!lastDist) {
            lastDist = dist;
        }
        var scale = (stage.scaleX() * dist) / lastDist;
        stage.scaleX(scale);
        stage.scaleY(scale);
        stage.batchDraw();
        lastDist = dist;
    }
}
function fitContainer(e, stage) {
    stage.width(window.innerWidth);
    stage.height(window.innerHeight);
    stage.draw();
}
export default Minder;
