var minestrone = (function () {
    'use strict';

    function defer() {
        var resolve, reject;
        return {
            promise: new Promise(function (resolve_, reject_) {
                resolve = resolve_;
                reject = reject_;
            }),
            resolve: resolve,
            reject: reject
        };
    }

    function Remote(uri, options) {

        var queue = [];
        var deferreds = {};
        var ws = null;
        var is_open = false;
        var last_id = 1;
        var tx_callbacks = {};

        var message_handlers = {
            'response': onResponse,
            'transaction': onTransaction
        };

        (function () {
            ws = new WebSocket(uri);
            ws.onopen = function (res) {
                is_open = true;
                for (var i = 0; i < queue.length; i++) {
                    ws.send(queue[i]);
                }
            };

            ws.onclose = function (res) {
                is_open = false;
            };

            ws.onmessage = function (res) {
                onMessage(res);
            };

            ws.onerror = function (res) {
                console.log(res.data);
            };
        })();

        function onMessage(res) {
            var data = JSON.parse(res.data);
            if (data.status === 'error') {
                console.log("Error: " + data.error);
                return;
            }

            if (data.type in message_handlers) {
                message_handlers[data.type](data);
            }
        }

        function onResponse(data) {
            deferreds[data.id].resolve(data.result);
            delete deferreds[data.id];
        }

        function onTransaction(data) {
            var tx_type = data.transaction.TransactionType;
            if (tx_type in tx_callbacks) {
                var callbacks = tx_callbacks[tx_type];
                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i](data);
                }
            }
        }

        this.add_callback = function (tx_type, callback) {

            if (!(tx_type in tx_callbacks)) {
                tx_callbacks[tx_type] = [];
            }
            tx_callbacks[tx_type].push(callback);
        };

        this.send = function (msg, opts) {

            msg.id = last_id;
            for (var property in opts) {
                msg[property] = opts[property];
            }

            msg = JSON.stringify(msg);
            if (is_open) {
                ws.send(msg);
            } else {
                queue.push(msg);
            }

            var deferred = defer();
            deferreds[last_id++] = deferred;
            return deferred.promise;
        };

        return this;
    }

    Remote.prototype.command = function (command, params, opts) {
        params.command = command;
        return this.send(params, opts);
    };

    Remote.prototype.get_account_currencies = function (account, opts) {
        var params = {
            account: account
        };
        return this.command('account_currencies', params, opts);
    };

    Remote.prototype.get_account_info = function (account, opts) {
        var params = {
            account: account
        };
        return this.command('account_info', params, opts);
    };

    Remote.prototype.get_account_lines = function (account, opts) {
        var params = {
            account: account
        };
        return this.command('account_lines', params, opts);
    };

    Remote.prototype.get_account_offers = function (account, opts) {
        var params = {
            account: account
        };
        return this.command('account_offers', params, opts);
    };

    Remote.prototype.get_account_tx = function (account, opts) {
        var params = {
            account: account
        };
        return this.command('account_tx', params, opts);
    };

    Remote.prototype.get_book_offers = function (taker_gets, taker_pays, opts) {
        var params = {
            taker_gets: taker_gets,
            taker_pays: taker_pays
        };
        return this.command('book_offers', params, opts);
    };

    Remote.prototype.get_ledger = function (opts) {
        return this.command('ledger', {}, opts);
    };

    Remote.prototype.get_transaction_entry = function (tx_hash, ledger_index, opts) {
        var params = {
            tx_hash: tx_hash,
            ledger_index: ledger_index
        };
        return this.command('transaction_entry', params, opts);
    };

    Remote.prototype.get_tx = function (transaction, opts) {
        var params = {
            transaction: transaction
        };
        return this.command('tx', params, opts);
    };

    Remote.prototype.get_tx_history = function (start, opts) {
        var params = {
            start: start
        };
        return this.command('tx_history', params, opts);
    };

    Remote.prototype.submit_transaction = function (opts) {
        return this.command('submit', {}, opts);
    };

    Remote.prototype.subscribe = function (opts) {
        return this.command('subscribe', {}, opts);
    };

    return {
        Remote: Remote
    };
})();
