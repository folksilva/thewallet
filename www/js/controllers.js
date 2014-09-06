"use strict";

var ctrl = angular.module('theWallet.controllers', ['theWallet.services']).controller;

ctrl('BaseCtrl', ['$http', '$rootScope', function($http, $rootScope) {

    // Valores globais
    $rootScope.language = (window.navigator.userLanguage || window.navigator.language).toLowerCase();
    $rootScope.balance = 0;
    $rootScope.accounts = [];
    $rootScope.tags = [];
    $rootScope.filterType = null;
    $rootScope.filterTerm = null;


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

    /**
     * Filtra por uma conta ou tag
     * @param type
     * @param term
     */
    $rootScope.setFilter = function (type, term) {
        $rootScope.filterType = type;
        $rootScope.filterTerm = term;
    };

    /**
     * Limpa o filtro
     */
    $rootScope.clearFilter = function () {
        $rootScope.filterType = null;
        $rootScope.filterTerm = null;
    };

    loadDictionary();
}]);

ctrl('MovementsCtrl', ['$scope', '$rootScope', '$locale', '$filter', 'Movement',
    function($scope, $rootScope, $locale, $filter, Movement) {
        $scope.addText = '';
        $scope.movements = [];
        $scope.days = [];

        /**
         * Cria uma lista de dias das movimentações
         * @param d
         * @param value
         */
        $scope.calcDay = function (d, value) {
            var i, found = false;
            var day = angular.copy(d);
            day.setHours(0, 0, 0, 0);
            if ($scope.days.length > 0) {
                for (i = 0; i < $scope.days.length; i += 1) {
                    if (+$scope.days[i].day === +day) {
                        $scope.days[i].balance += value;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    $scope.days.push({day: day, balance: value});
                }
            } else {
                $scope.days.push({day: day, balance: value});
            }
        };

        /**
         * Carrega as movimentações e inicializa os precessamentos necessários
         */
        $scope.load = function() {
            $scope.movements = [];
            $scope.days = [];
            $rootScope.balance = 0;
            $rootScope.accounts = [];
            $rootScope.tags = [];
            Movement.all().then(function (movements) {
                var i, j, mov;
                for (i = 0; i < movements.length; i += 1) {
                    mov = Movement.load(movements[i]);
                    mov.date = new Date(mov.date);
                    $rootScope.balance += mov.value;
                    $scope.calcDay(mov.date, mov.value);
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

        /**
         * Adiciona uma movimentação
         */
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

        /**
         * Remove uma movimentação
         * @param movement
         */
        $scope.remove = function (movement) {

            Movement.remove(movement.id).then(function (r) {
                $scope.load();
            });
        };

        /**
         * Filtra os dias que tem movimentos
         * @param d
         * @returns {boolean}
         */
        $scope.filterDays = function (d) {
            var movs = $filter('filter')($scope.movements, $scope.filterMovs(d.day));
            return movs.length > 0;
        };

        /**
         * Filtra os movimentos pelo dia e tag/conta
         * @param day
         * @returns {Function}
         */
        $scope.filterMovs = function (day) {
            return function (item) {
                var i, matchDay, matchFilter = true;
                var itemDay = angular.copy(item.date);
                itemDay.setHours(0, 0, 0, 0);
                matchDay = +itemDay === +day;
                if ($rootScope.filterTerm) {
                    console.log($rootScope.filterType, $rootScope.filterTerm);
                    matchFilter = false;
                    if ($rootScope.filterType === 'account') {
                        for (i = 0; i < item.accounts.length; i += 1) {
                            if ($.trim(item.accounts[i]).toLowerCase() === $.trim($rootScope.filterTerm).toLowerCase()) {
                                matchFilter = true;
                                break;
                            }
                        }
                    } else if ($rootScope.filterType === 'tag') {
                        for (i = 0; i < item.tags.length; i += 1) {
                            if ($.trim(item.tags[i]).toLowerCase() === $.trim($rootScope.filterTerm).toLowerCase()) {
                                matchFilter = true;
                                break;
                            }
                        }
                    }
                }
                return matchDay && matchFilter;
            }
        };

        $scope.getTitle = function () {
            if ($rootScope.filterTerm) {
                return $rootScope.filterTerm;
            }
            return $rootScope.movementsTitle;
        };

        $scope.load();
    }
]);