class Box {
    constructor(x, y, width, height) {
        var box = arguments[0];
        if (box && typeof (box) === 'object') {
            x = box.x;
            y = box.y;
            width = box.width;
            height = box.height;
        }
        if (width < 0) {
            x -= (width = -width);
        }
        if (height < 0) {
            y -= (height = -height);
        }
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;
        this.left = this.x;
        this.right = this.x + this.width;
        this.top = this.y;
        this.bottom = this.y + this.height;
        this.cx = this.x + this.width / 2;
        this.cy = this.y + this.height / 2;
    }
    getRangeX() {
        return [this.left, this.right];
    }
    getRangeY() {
        return [this.top, this.bottom];
    }
    merge(another) {
        if (this.isEmpty()) {
            return new Box(another.x, another.y, another.width, another.height);
        }
        var left = Math.min(this.left, another.left),
            right = Math.max(this.right, another.right),
            top = Math.min(this.top, another.top),
            bottom = Math.max(this.bottom, another.bottom);
        return new Box(left, top, right - left, bottom - top);
    }
    intersect(another) {
        if (!another instanceof Box) {
            another = new Box(another);
        }

        var left = Math.max(this.left, another.left),
            right = Math.min(this.right, another.right),
            top = Math.max(this.top, another.top),
            bottom = Math.min(this.bottom, another.bottom);

        if (left > right || top > bottom) return new Box();

        return new Box(left, top, right - left, bottom - top);
    }
    expand(top, right, bottom, left) {
        if (arguments.length < 1) {
            return new Box(this);
        }
        if (arguments.length < 2) {
            right = top;
        }
        if (arguments.length < 3) {
            bottom = top;
        }
        if (arguments.length < 4) {
            left = right;
        }
        var x = this.left - left,
            y = this.top - top,
            width = this.width + right + left,
            height = this.height + top + bottom;
        return new Box(x, y, width, height);
    }
    valueOf() {
        return [this.x, this.y, this.width, this.height];
    }
    toString() {
        return this.valueOf().join(' ');
    }
    isEmpty() {
        return !this.width || !this.height;
    }
}
export default Box;