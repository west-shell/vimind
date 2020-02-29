import Minder from './minder';
Minder.registerInitHook(function (options) {
    this.defaultOptions = {};
});
Object.assign(Minder.prototype, {
    setDefaultOptions(options) {
        Object.assign(this.defaultOptions, options);
        return this;
    },
    getOption(key) {
        if (key) {
            return key in this.options ? this.options[key] : this.defaultOptions[key];
        } else {
            return Object.assign({}, this.defaultOptions, this.options);
        }
    },
    setOption(key, value) {
        this.options[key] = value;
    }
});