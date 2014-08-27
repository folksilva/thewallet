'use strict';

angular.module('theWallet.config', []).constant('DB_CONFIG', {
    name: 'DB',
    tables: [{
        name: 'movements',
        columns: [
            {name: 'id', type: 'integer primary key'},
            {name: 'date', type: 'text'},
            {name: 'text', type: 'text'},
            {name: 'value', type: 'double'},
            {name: 'accounts', type: 'text'},
            {name: 'tags', type: 'text'}
        ]
    }]
});