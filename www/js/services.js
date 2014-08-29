'use strict';

var srv = angular.module('theWallet.services', ['theWallet.config']);

srv.factory('DB', function ($q, DB_CONFIG) {
    var self = this;
    self.db = null;

    self.init = function () {
        // Use self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name}); in production
        self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);

        angular.forEach(DB_CONFIG.tables, function (table) {
            var columns = [];

            angular.forEach(table.columns, function (column) {
                columns.push(column.name + ' ' + column.type);
            });

            var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
            self.query(query);
            console.log('Table ' + table.name + ' initialized');
        });
    };

    self.query = function (query, bindings) {
        bindings = typeof bindings !== 'undefined' ? bindings : [];
        var deferred = $q.defer();

        self.db.transaction(function (transaction) {
            transaction.executeSql(query, bindings, function (transaction, result) {
                deferred.resolve(result);
            }, function (transaction, error) {
                deferred.reject(error);
            });
        });

        return deferred.promise;
    };

    self.fetchAll = function (result) {
        var output = [];

        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }
        return output;
    };

    self.fetch = function (result) {
        return result.rows.item(0);
    };

    return self;
});
// Resource service example
srv.factory('Movement', ['DB', '$locale', function (DB, $locale) {
    var self = this;

    self.new = function (srcText) {
        var i, value = 0, tags = [], accounts = [], text = srcText.replace($locale.NUMBER_FORMATS.DECIMAL_SEP, '.');
        var words = text.split(' ');
        for (i = 0; i < words.length; i += 1) {
            if(!isNaN(Number(words[i])) && !value) {
                if (words[i].charAt(0) === '+') {
                    value = Number(words[i]);
                } else {
                    value = Number(words[i]) * -1;
                }
            } else if (words[i].charAt(0) === '#') {
                tags.push(words[i]);
            } else if (words[i].charAt(0) === '@') {
                accounts.push(words[i]);
            }
        }
        if (value) {
            return {
                date: new Date(),
                text: srcText,
                value: value,
                tags: tags.length > 0 ? tags.join(',') : '',
                accounts: accounts.length > 0 ? accounts.join(',') : ''
            };
        }
    };

    self.load = function (raw) {
        var tags = [], accounts = [];
        if (raw.tags.length > 0) {
            tags = raw.tags.split(',');
        }
        if (raw.accounts.length > 0) {
            accounts = raw.accounts.split(',');
        }
        return {
            id: raw.id,
            date: new Date(raw.date),
            text: raw.text,
            value: raw.value,
            tags: tags,
            accounts: accounts
        };
    };

    self.all = function () {
        return DB.query('SELECT * FROM movements')
            .then(function (result) {
                return DB.fetchAll(result);
            });
    };
    self.getById = function (id) {
        return DB.query('SELECT * FROM movements WHERE id = ?', [id])
            .then(function (result) {
                return DB.fetch(result);
            });
    };

    self.create = function (data) {
       return DB.query(
           'INSERT INTO movements (date, text, value, tags, accounts) VALUES (?, ?, ?, ?, ?)',
           [data.date.toISOString(), data.text, data.value, data.tags, data.accounts]
       ).then(function (result) {
               return result;
           });
    };

    return self;
}]);
