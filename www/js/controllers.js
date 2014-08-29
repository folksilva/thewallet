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
    };

    /**
     * Adiciona uma tag ou atualiza seu balanço
     * @param tag
     * @param value
     */
    $rootScope.calcTag = function (tag, value) {
        var i, found = false;
        if ($rootScope.tags.length > 0) {
            for (i = 0; i < $rootScope.tags.length; i += 1) {
                if ($.trim($rootScope.tags[i].name).toLowerCase() === $.trim(tag).toLowerCase()) {
                    $rootScope.tags[i].balance += value;
                    found = true;
                    break;
                }
            }
            if (!found) {
                $rootScope.tags.push({name: tag, balance: value});
            }
        } else {
            $rootScope.tags.push({name: tag, balance: value});
        }
    };

    /**
     * Adiciona uma conta ou atualiza seu balanço
     * @param account
     * @param value
     */
    $rootScope.calcAccount = function (account, value) {
        var i, found = false;
        if ($rootScope.accounts.length > 0) {
            for (i = 0; i < $rootScope.accounts.length; i += 1) {
                if ($.trim($rootScope.accounts[i].name).toLowerCase() === $.trim(account).toLowerCase()) {
                    $rootScope.accounts[i].balance += value;
                    found = true;
                    break;
                }
            }
            if (!found) {
                $rootScope.accounts.push({name: account, balance: value});
            }
        } else {
            $rootScope.accounts.push({name: account, balance: value});
        }
    };
}]);

ctrl('MovementsCtrl', ['$scope', '$rootScope', '$locale', 'Movement',
    function($scope, $rootScope, $locale, Movement) {
        $scope.addText = '';

        $scope.load = function() {
            $scope.movements = [];
            $rootScope.balance = 0;
            $rootScope.accounts = [];
            $rootScope.tags = [];
            Movement.all().then(function (movements) {
                var i, j, mov;
                for (i = 0; i < movements.length; i += 1) {
                    mov = Movement.load(movements[i]);
                    $rootScope.balance += mov.value;
                    for (j = 0; j < mov.tags.length; j += 1) {
                        $rootScope.calcTag(mov.tags[j], mov.value);
                    }

                    for (j = 0; j < mov.accounts.length; j += 1) {
                        $rootScope.calcAccount(mov.accounts[j], mov.value);
                    }
                    $scope.movements.push(mov);
                }
            });
        };

        $scope.add = function (){
            var i, value = 0, tags = [], accounts = [], text = angular.copy($scope.addText);
            var mov = Movement.new($scope.addText);
            if (mov) {
                Movement.create(mov).then(function (data) {
                    $scope.addText = '';
                    $scope.load();
                });
            }
        };

        $scope.load();
    }
]);