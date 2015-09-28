angular.module('app').config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/me', {
            templateUrl: '/privacy/mePrivacy',
            controller: 'privacy.usersController'
        }).
        when('/companies', {
            templateUrl: '/privacy/companiesPrivacy',
            controller: 'privacy.companiesController'
        }).
        when('/companies/:id', {
            templateUrl: function(params) {
                return '/privacy/companyPrivacy/' + params.id;
            },
            controller: 'privacy.companiesController'
        }).
        when('/projects', {
            templateUrl: '/privacy/projectsPrivacy',
            controller: 'privacy.projectsController'
        }).
        when('/projects/:id', {
            templateUrl: function(params) {
                return '/privacy/projectsPrivacy/' + params.id;
            },
            controller: 'privacy.projectsController'
        }).
        otherwise({redirectTo: '/me'});
}]);

angular.module('app').controller('privacy.usersController', function($scope) {
    $scope.$watch('privacyType', function(newVal) {
        if (newVal == 3 && $scope.universeType != 3 && $scope.universeType != 4) {
            $scope.universeType = 3;
        }
    });
});

angular.module('app').controller('privacy.companiesController', function($scope, companiesFactory) {

    if (typeof companiesRoles != 'undefined') {
        $scope.companiesRoles = companiesRoles;
    }
    companiesFactory.getForPrivacy({ }).$promise.then(function(response) {
        $scope.companies = response;
    });

    $scope.$watch('privacyType', function(newVal) {
        if (newVal == 3 && $scope.universeType != 3 && $scope.universeType != 4) {
            $scope.universeType = 3;
        }
    });
});

angular.module('app').controller('privacy.projectsController', function($scope, projectsFactory) {
    $scope.projects = projectsFactory.get({limit: 999});
    $scope.$watch('privacyType', function(newVal) {
        if (newVal == 3 && $scope.universeType != 3 && $scope.universeType != 4) {
            $scope.universeType = 3;
        }
    });
});
