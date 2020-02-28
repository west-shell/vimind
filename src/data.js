import Minder from './minder';
import datatemp from './datatemp.json';
Minder.registerInitHook(function importData() {
    setTimeout(() => {
        this.importJson(datatemp);
        this.layout();
    }, 0);
})
Object.assign(Minder.prototype, {
    setup(target) {
        if (typeof target == 'string') {
            target = document.getElementById(target);
        }
        var data = datatemp;
        this.renderTo(target);
        this.importJson(data);
        this.fire("import");
        this.refresh();
        return this;
    },
    importNode(node, json) {
        var data = json.data;

        for (var field in data) {
            node.setData(field, data[field]);
        }
        var childrenTreeData = json.children || [];
        for (var i = 0; i < childrenTreeData.length; i++) {
            var childNode = this.createNode(null, node);
            this.importNode(childNode, childrenTreeData[i]);
        }
    },
    importData(protocolName, data, option) {
        this.importJson(json);
    },
    importJson(json) {
        this.importNode(this.root, json.root);
    }
});