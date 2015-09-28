angular.module('app').factory('companiesFactory', ['$resource', function($resource) {
    return $resource('/companies/:action/:id', {action: '@action', id: '@id'}, {
        getCompanies: {
            cache: true,
            method: 'GET',
            params: {action: 'getUserCompanies'},
            isArray: true,
            transformResponse: function(data) {
                return angular.fromJson(data).companies;
            }
        },
        getForPrivacy: {
            cache: true,
            method: 'GET',
            params: {action: 'getCompaniesForPrivacy'},
            isArray: true,
            transformResponse: function(data) {
                return angular.fromJson(data).companies;
            }
        },
        getForDashboard: {
            cache: true,
            method: 'GET',
            params: {action: 'getForDashboard'},
            isArray: true,
            transformResponse: function(data) {
                return angular.fromJson(data).companies;
            }
        },
        deleteCompany: {
            cache: true,
            method: 'GET',
            isArray: true,
            params: {action: 'deleteCompany'},
            transformResponse: function(data) {
               return angular.fromJson(data).error;
            }
        }
    });
}]);
