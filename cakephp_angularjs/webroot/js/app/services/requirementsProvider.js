angular.module('app').factory('requirementsProvider', ['$resource', function($resource) {
    return $resource('/requirements/:action/:id/:type', {action: '@action', id: '@id', type: '@type'}, {
        get: {
            cache: true,
            method: 'GET',
            isArray: false,
            params: {action: 'getRequirements', 'r': Math.floor(Math.random() * 1000)},
            transformResponse: function(data) {
                return angular.fromJson(data).requirements;
            }
        },

        delete: {
            cache: false,
            method: 'POST',
            isArray: true,
            params: {action: 'deleteRequirements'},
            transformResponse: function(data) {
                return JSON.parse(data).requirements;
            }
        },

        switchSearch: {
            cache: false,
            method: 'POST',
            isArray: false,
            params: {action: 'switchLighthouseSearch'},
            transformResponse: function(data) {
                return JSON.parse(data);
            }
        }
    });
}]);
