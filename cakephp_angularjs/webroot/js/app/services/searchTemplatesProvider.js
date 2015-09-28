angular.module('app').factory('searchTemplatesProvider', ['$resource', function($resource) {
    return $resource('/searchTemplates/:action/:id/:count', {action: '@action', id: '@id', count: '@count'}, {
        get: {
            cache: true,
            method: 'GET',
            isArray: true,
            params: {action: 'getTemplates'},
            transformResponse: function(data) {
                return JSON.parse(data).searchTemplates;
            }
        },
        getWithCount: {
            cache: true,
            method: 'GET',
            isArray: true,
            params: {action: 'getTemplates', id: true},
            transformResponse: function(data) {
                return JSON.parse(data).searchTemplates;
            }
        },

        save: {
            isArray: false,
            method: 'POST',
            params: {action: 'saveTemplate'}
        },

        delete: {
            isArray: false,
            method: 'GET',
            params: {action: 'deleteTemplate'}
        }
    });
}]);
