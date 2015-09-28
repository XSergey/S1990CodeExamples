angular.module('app').factory('projectsFactory', ['$resource', function($resource) {
    return $resource('/:url/:action/:limit/:offset/:type/:userId/', {url: 'innerApi', limit: 10, offset: 0, type: 0, userId: 0}, {
        get: {
            cache: true,
            method: 'GET',
            isArray: true,
            params: {action: 'getMyProjects'},
            transformResponse: function(data) {
                return angular.fromJson(data).data;
            }
        },
        getProjects: {
            cache: true,
            method: 'GET',
            isArray: true,
            params: {'r': Math.floor(Math.random() * 1000)}, //Fixed bug #11975, #11976
            transformResponse: function(data) {
                return angular.fromJson(data).data;
            }
        },

        getList: {
            cache: true,
            method: 'GET',
            isArray: false,
            params: {action: 'getProjectsList', limit: null},
            transformResponse: function(data) {
                return angular.fromJson(data).data;
            }
        }

    });
}]);
