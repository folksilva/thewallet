"use strict";

var ctrl = angular.module('theWallet.controllers', ['theWallet.services']).controller;

ctrl('BaseCtrl', ['$http', '$rootScope', function($http, $rootScope) {

    // Valores globais
    $rootScope.language = (window.navigator.userLanguage || window.navigator.language).toLowerCase();
    $rootScope.balance = 0;
    $rootScope.accounts = [];
    $rootScope.tags = [];


    /**
     * Carrega o dicionário do idioma
     */
    function loadDictionary(){
        $http({method: 'GET', url: 'i18n/' + $rootScope.language + ".json"})
            .success(function(strings){
                var s;
                for (s in strings) {
                    $rootScope[s] = strings[s];
                }
            }).error(function(){
                $rootScope.language = 'en-us';
                loadDictionary();
            });
    }

    /**
     * Cria a url para a ajuda
     * @returns {string}
     */
    $rootScope.helpPage = function() {
        return 'i18n/help.' + $rootScope.language + '.html';
    };

    /**
     * Abre um link externamente
     * @param url
     */
    $rootScope.open = function(url) {
        intel.xdk.device.launchExternal(url);
    }
}]);

ctrl('MovementsCtrl', ['$scope', 'Movement',
    function($scope, Movement) {
        $scope.movements = [];
        $scope.addText = '';
        Movement.all().then(function (movements) {
            $scope.movements = movements;
        });

        $scope.add = function (){
            console.log($scope.addText);
        }
    }
]);