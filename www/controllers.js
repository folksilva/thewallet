"use strict";

var ctrl = angular.module('theWallet.controllers', []).controller;

ctrl('BaseCtrl', ['$http', '$rootScope', function($http, $rootScope) {

    // Valores globais
    $rootScope.language = 'pt-BR';
    $rootScope.balance = 172.66;
    $rootScope.accounts = [
        {name: '@sodexo', balance: -12.34},
        {name: '@visa', balance: -15}
    ];
    $rootScope.tags = [
        {name: '#aposta', balance: 200},
        {name: '#almoço', balance: -12.34},
        {name: '#diversão', balance: -15},
        {name: '#cinema', balance: -15}
    ];
    $rootScope.helpPage = 'templates/help.' + $rootScope.language + '.html';

    // Carregar o idioma
    $http({method: 'GET', url: $rootScope.language + ".json"})
        .success(function(strings){
            var s;
            for (s in strings) {
                $rootScope[s] = strings[s];
            }
        });

    $rootScope.open = function(url) {
        intel.xdk.device.launchExternal(url);
    }
}]);

ctrl('MovementsCtrl', ['$scope',
    function($scope) {
        $scope.movements = [{
            date: new Date(),
            value: 200.00,
            text: '+200,00 #aposta brasileirão',
            accounts: [],
            tags: ['#aposta']
        },{
            date: new Date(),
            value: -12.34,
            text: '12,34 lanche no #almoço @sodexo',
            accounts: ['@sodexo'],
            tags: ['#almoço']
        },{
            date: new Date(),
            value: -15.00,
            text: '15,00 #diversão #cinema Os mercenários 3 @visa',
            accounts: ['@visa'],
            tags: ['#diversão', '#cinema']
        }];
    }
]);