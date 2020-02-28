import Minder from './minder';
/*normal
 *vim
 *edit
 *readonly
 *visual
 *drag
 */
Minder.registerInitHook(function initStatus() {
    this._initStatus();
});
Object.assign(Minder.prototype, {
    _initStatus() {
        this.status = 'normal';
        this.rollbackStatus = 'normal';
    },

    setStatus(status, force) {
        // 在 readonly 模式下，只有 force 为 true 才能切换回来
        if (this.status == 'readonly' && !force) return this;
        if (status != this.status) {
            this._rollbackStatus = this.status;
            this.status = status;
            this.fire('statuschange', {
                lastStatus: this._rollbackStatus,
                currentStatus: this.status
            });
        }
        return this;
    },

    rollbackStatus() {
        this.setStatus(this._rollbackStatus);
    },
    getRollbackStatus: function () {
        return this._rollbackStatus;
    },
    getStatus() {
        return this.status;
    }
});