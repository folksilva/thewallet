"use strict";

var app = angular.module('theWallet', ['ionic', 'ngLocale', 'theWallet.services', 'theWallet.controllers']);

app.run(function(DB) {
    DB.init();
});

app.config(function($stateProvider, $urlRouterProvider) {
    var st = $stateProvider.state;

    st('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/base.html',
        controller: 'BaseCtrl'
    });

    st('app.movements', {
        url: '/movements',
        views: {
            'content': {
                templateUrl: 'templates/movements.html',
                controller: 'MovementsCtrl'
            }
        }
    });

    $urlRouterProvider.otherwise('/app/movements');

});