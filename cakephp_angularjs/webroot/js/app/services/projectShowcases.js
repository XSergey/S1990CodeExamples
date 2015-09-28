angular.module('app').factory('projectShowcases', ['$resource', function($resource) {
    return $resource('/company/:action/:id', {id: '@id'}, {
        get: {
            cache: false,
            method: 'GET',
            isArray: true,
            params: {action: 'getProjectShowcases'},
            transformResponse: function(data) {
                return angular.fromJson(data).projects;
            }
        },
        save: {
            method: 'POST',
            params: {action: 'saveProjectShowcases'},
            transformResponse: function(data) {
                return angular.fromJson(data).data;
            }
        },
        update: {
            method: 'POST',
            params: {action: 'saveProjectShowcases'},
            transformResponse: function(data) {
                return angular.fromJson(data).data;
            }
        },
        delete: {
            method: 'get',
            params: {action: 'deleteProjectShowcases'}
        }
    });
}]);
