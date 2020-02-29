import Minder from './minder';
import Command from './command';
let modules = {};
let Module = {};
Module.register = function (name, module) {
    modules[name] = module;
};
class testCommand extends Command {
    execute() {
        alert("textCommand");
    }
}
Module.register("test", {
    // defaultOptions:{},
    // init:{},
    commands: {
        test: testCommand
    },
    // events:{},
    commandShortcutKeys: {
        test: "normal::a"
    }
})


Minder.registerInitHook(function initModules() {
    this._initModules();
});
Object.assign(Minder.prototype, {

    _initModules() {
        var modulesPool = modules;
        var modulesToLoad = this.options.modules
            || Object.keys(modulesPool);
        this.commands = {};
        this.query = {};
        this.modules = {};
        this.rendererClasses = {};
        var i, name, type, moduleDeals,
            dealCommands, dealEvents, dealRenderers;

        var me = this;
        for (i = 0; i < modulesToLoad.length; i++) {
            name = modulesToLoad[i];
            if (!modulesPool[name]) continue;
            // 执行模块初始化，抛出后续处理对象
            if (modulesPool[name] instanceof Function) {
                moduleDeals = modulesPool[name].call(me);
            } else {
                moduleDeals = modulesPool[name];
            }
            this.modules[name] = moduleDeals;

            if (!moduleDeals) continue;

            if (moduleDeals.defaultOptions) {
                me.setDefaultOptions(moduleDeals.defaultOptions);
            }

            if (moduleDeals.init) {
                moduleDeals.init.call(me, this.options);
            }

            // command加入命令池子
            dealCommands = moduleDeals.commands;
            for (name in dealCommands) {
                this.commands[name.toLowerCase()] = new dealCommands[name]();
            }

            // 绑定事件
            dealEvents = moduleDeals.events;
            if (dealEvents) {
                for (type in dealEvents) {
                    me.on(type, dealEvents[type]);
                }
            }

            // 渲染器
            dealRenderers = moduleDeals.renderers;

            if (dealRenderers) {

                for (type in dealRenderers) {
                    this.rendererClasses[type] = this._rendererClasses[type] || [];

                    if (typeof (dealRenderers[type]) == 'array') {
                        this.rendererClasses[type] = this.rendererClasses[type].concat(dealRenderers[type]);
                    } else {
                        this.rendererClasses[type].push(dealRenderers[type]);
                    }
                }
            }

            //添加模块的快捷键
            if (moduleDeals.commandShortcutKeys) {
                this.addCommandShortcutKeys(moduleDeals.commandShortcutKeys);
            }
        }
    },

    _garbage() {
        this.clearSelect();

        while (this.root.getChildren().length) {
            this.root.removeChild(0);
        }
    },

    destroy() {
        var modules = this.modules;

        this._resetEvents();
        this._garbage();

        for (var key in modules) {
            if (!modules[key].destroy) continue;
            modules[key].destroy.call(this);
        }
    },

    reset() {
        var modules = this.modules;

        this._garbage();

        for (var key in modules) {
            if (!modules[key].reset) continue;
            modules[key].reset.call(this);
        }
    }
});
export default Module;