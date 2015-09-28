/**
 * Created by kostya on 19.08.14.
 */
angular.module('app').controller('GeoCoverageController', ['$scope', '$http', '$timeout', '$filter', function($scope, $http, $timeout, $filter) {

    var regions = {
        west: ['WA', 'ID', 'MT', 'OR', 'CA', 'NV', 'AK', 'HI'],
        midwest: ['OH', 'MI', 'IN', 'IL', 'WI', 'MO', 'IA', 'MN', 'ND', 'SD', 'NE', 'KS'],
        southwest: ['WY', 'UT', 'AZ', 'NM', 'CO', 'TX', 'OK', 'AR'],
        southeast: ['KY', 'NC', 'TN', 'LA', 'MS', 'AL', 'GA', 'SC', 'FL'],
        northeast: ['ME', 'NH', 'VT', 'NY', 'MA', 'RI', 'CT', 'NJ', 'PA', 'DE', 'MD', 'VA', 'DC', 'MV']
    };

    var backupSelected = {};
    $scope.id = null; // Project_id | Company_id
    $scope.isEdit = false;
    $scope.isUS = false;
    $scope.selected = {
        'countries': [],
        'regions': [],
        'states': [],
        'cities': []
    };
    $scope.list = {
        'countries': [],
        'regions': [],
        'states': [],
        'cities': []
    };

    $scope.getCountries = function() {
        $http.get('http://api.geonames.org/countryInfo', { params: { type: 'json', country: [], userName: 'VTDeveloper' }}).then(function(response) {
            var sortedItems = $filter('orderBy')(response.data.geonames, '+countryName', false),
                usId = null;
            sortedItems.forEach(function(item, key) {
                if (item.countryCode == 'US') {
                    usId = key;
                }
            });
            var us = sortedItems.splice(usId, 1)[0];
            sortedItems.unshift(us);
            $scope.list.countries = angular.copy(sortedItems);
        });
    };

    $scope.getStates = function(startWith, callback) {
        if ($scope.selected.countries.length > 0) {
            //Get region(states) for country.
            $http.get('http://api.geonames.org/search', {params: {
                type: 'json',
                maxRows: 1000,
                userName: 'VTDeveloper',
                lang: 'en',
                country: $scope.selected.countries.map(function(item) {
                    return item.countryCode;
                }),
                style: 'medium',
                featureClass: 'A',
                featureCode: 'ADM1',
                name_startsWith: startWith

            }}).then(function(response) {
                $scope.list.states = $filter('orderBy')(response.data.geonames, '+toponymName', false);
                if (angular.isFunction(callback))
                    callback($scope.list.states);
            });
        } else {
            $scope.list.states = [];
            if (angular.isFunction(callback))
                callback($scope.list.states);
        }
    };

    $scope.getCities = function(startWith, callback) {
        if ($scope.selected.countries.length > 0) {
            //Get region(states) for country.
            $http.get('http://api.geonames.org/search', {params: {
                type: 'json',
                maxRows: 50,
                userName: 'VTDeveloper',
                lang: 'en',
                country: $scope.selected.countries.map(function(item) {
                    return item.countryCode;
                }),
                style: 'medium',
                featureClass: 'P',
                name_startsWith: startWith
            }}).then(function(response) {
                $scope.list.cities = $filter('orderBy')(response.data.geonames, '+toponymName', false);
                if (angular.isFunction(callback))
                    callback($scope.list.cities);
            });
        } else {
            $scope.list.cities = [];
            if (angular.isFunction(callback))
                callback($scope.list.cities);
        }
    };

    $scope.init = function(hash, id, search, selectedItems) {
        $scope.id = id;
        //Before execute cross domain query, just delete this property
        delete $http.defaults.headers.common['X-Requested-With'];
        $scope.getCountries();

        if (typeof selectedItems !== 'undefined') {
            $scope.selected['countries'] = selectedItems['countries'] || [];
            $scope.selected['regions'] = selectedItems['regions'] || [];
            $scope.selected['states'] = selectedItems['states'] || [];
            $scope.selected['cities'] = selectedItems['cities'] || [];

            $scope.initSearchLogic();
        } else {
            if (typeof search === 'undefined') {
                $http.post('/edit/section/' + hash, {'id': $scope.id}
                ).then(function(response) {
                        $scope.selected['countries'] = response.data['countries'] || [];
                        $scope.selected['regions'] = response.data['regions'] || [];
                        $scope.selected['states'] = response.data['states'] || [];
                        $scope.selected['cities'] = response.data['cities'] || [];
                    });
            } else {
                $http.get('/search/getLocations').then(function(res) {
                    if (res.data.locations !== null) {
                        $scope.selected = res.data.locations;
                        ['countries', 'regions', 'states', 'cities'].forEach(function(elem) {
                            if (typeof $scope.selected[elem] === 'undefined') {
                                $scope.selected[elem] = [];
                            }
                        });
                    }
                    $scope.initSearchLogic();
                });
            }
        }
    };

    $scope.$watch('selected.countries', function() {
        if (angular.isDefined($scope.selected.countries)) {
            $scope.isUS = $filter('filter')($scope.selected.countries, {'countryCode': 'US'}).length > 0;
            $scope.getStates();
            $scope.list.regions = [
                {'toponymName': 'West', 'geonameId': 'west'},
                {'toponymName': 'Midwest', 'geonameId': 'midwest'},
                {'toponymName': 'Southwest', 'geonameId': 'southwest'},
                {'toponymName': 'Southeast', 'geonameId': 'southeast'},
                {'toponymName': 'Northeast', 'geonameId': 'northeast'}
            ];
        } else {
            $scope.isUS = false;
            $scope.list.regions = [];
        }
    });

    $scope.save = function(hash) {
        $http.post('/edit/section/' + hash, {
            'id': $scope.id,
            'geo_data': $scope.selected
        }).then(function(response) {
            if (response.data.result !== null && response.data.result !== undefined) {
                if (typeof response.data.result.matches !== undefined) {
                    angular.element('#templateMatches').html(response.data.result.matches);
                }
            }
            $scope.isEdit = false;
        });
    };

    $scope.edit = function() {
        backupSelected = angular.copy($scope.selected);
        $scope.isEdit = true;
    };

    $scope.cancel = function() {
        $scope.selected = angular.copy(backupSelected);
        $scope.isEdit = false;
    };

    $scope.onUSMapChange = function(stateCode, status) {
        var deleteIndx = null;
        if ($scope.selected.states == null)
            $scope.selected.states = [];

        $scope.selected.states.forEach(function(value, key) {
            if (value.adminCode1 === stateCode) {
                deleteIndx = key;
            }
        });
        if (deleteIndx != null) {
            $scope.selected.states.splice(deleteIndx, 1);
            $scope.$apply();
        } else {
            if ($scope.list.states.length > 0) {
                var item = $filter('filter')($scope.list.states, {'adminCode1': stateCode})[0];
                if (typeof item !== 'undefined') {
                    $scope.selected.states.push(item);
                    $scope.$apply();
                }
            }
        }
    };

    $scope.onUSRegionChange = function(region) {
        var isNew = true;

        $scope.selected.regions.forEach(function(elem, index) {
            if (elem.geonameId === region) {
                $scope.selected.regions.splice(index, 1);
                isNew = false;
            }
        });

        if (isNew) {
            $scope.list.regions.forEach(function(elem) {
                if (elem.geonameId === region) {
                    $scope.selected.regions.push(elem);
                }
            });

            if ($scope.list.states.length > 0) {
                regions[region].forEach(function(state) {
                    var item = $filter('filter')($scope.list.states, {'adminCode1': state})[0];
                    if (typeof item !== 'undefined') {
                        if ($scope.selected.states.indexOf(item) < 0) {
                            $scope.selected.states.push(item);
                        }
                    }
                });
            }
        }
    };

    $scope.stringify = function(str) {
        return JSON.stringify(str);
    };

    $scope.initSearchLogic = function() {
        var timer;
        $scope.$watch('selected', function(newValue, oldValue) {
            if (newValue !== oldValue) {
                if (newValue.countries.length == 0) {
                    newValue = 0;
                }
                clearTimeout(timer);
                timer = setTimeout(function() {
                    $('.table-holder').addClass('loading');
                    $http.post('/search/updateFilter', {Locations: newValue}).then(function(res) {
                        $(document).trigger('updateFilter', [res]);
                        $('.table-holder').removeClass('loading');
                    });
                }, 1000);
            }
        }, true);
    };
}
]);

