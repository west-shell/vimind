import Minder from './minder';
var COMMAND_STATE_NORMAL = 0;
var COMMAND_STATE_DISABLED = -1;
var COMMAND_STATE_ACTIVED = 1;

class Command {
    constructor() {
        this._isContentChange = true;
        this._isSelectionChange = false;
    }

    execute(minder, args) {
        throw new Error('Not Implement: Command.execute()');
    }

    setContentChanged(val) {
        this._isContentChange = !!val;
    }

    isContentChanged() {
        return this._isContentChange;
    }

    setSelectionChanged(val) {
        this._isSelectionChange = !!val;
    }

    isSelectionChanged() {
        return this._isContentChange;
    }

    queryState(km) {
        return COMMAND_STATE_NORMAL;
    }

    queryValue(km) {
        return 0;
    }

    isNeedUndo() {
        return true;
    }
}
Command.STATE_NORMAL = COMMAND_STATE_NORMAL;
Command.STATE_ACTIVE = COMMAND_STATE_ACTIVED;
Command.STATE_DISABLED = COMMAND_STATE_DISABLED;

Object.assign(Minder.prototype, {

    _getCommand(name) {
        return this.commands[name.toLowerCase()];
    },

    _queryCommand(name, type, args) {
        var cmd = this._getCommand(name);
        if (cmd) {
            var queryCmd = cmd['query' + type];
            if (queryCmd)
                return queryCmd.apply(cmd, [this].concat(args));
        }
        return 0;
    },

    /**
     * @method queryCommandState()
     * @for Minder
     * @description 查询指定命令的状态
     *
     * @grammar queryCommandName(name) => {number}
     *
     * @param {string} name 要查询的命令名称
     *
     * @return {number}
     *   -1: 命令不存在或命令当前不可用
     *    0: 命令可用
     *    1: 命令当前可用并且已经执行过
     */
    queryCommandState(name) {
        return this._queryCommand(name, 'State', [].slice.call(arguments, 1));
    },

    /**
     * @method queryCommandValue()
     * @for Minder
     * @description 查询指定命令当前的执行值
     *
     * @grammar queryCommandValue(name) => {any}
     *
     * @param {string} name 要查询的命令名称
     *
     * @return {any}
     *    如果命令不存在，返回 undefined
     *    不同命令具有不同返回值，具体请查看 [Command](command) 章节
     */
    queryCommandValue(name) {
        return this._queryCommand(name, 'Value', [].slice.call(arguments, 1));
    },

    /**
     * @method execCommand()
     * @for Minder
     * @description 执行指定的命令。
     *
     * @grammar execCommand(name, args...)
     *
     * @param {string} name 要执行的命令名称
     * @param {argument} args 要传递给命令的其它参数
     */
    execCommand(name) {
        if (!name) return null;

        name = name.toLowerCase();

        var cmdArgs = [].slice.call(arguments, 1),
            cmd, stoped, result, eventParams;
        var me = this;
        cmd = this._getCommand(name);

        eventParams = {
            command: cmd,
            commandName: name.toLowerCase(),
            commandArgs: cmdArgs
        };
        if (!cmd || !~this.queryCommandState(name)) {
            return false;
        }

        result = cmd.execute.apply(cmd, [me].concat(cmdArgs));

        return result === undefined ? null : result;
    }
})
export default Command;