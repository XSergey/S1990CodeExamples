angular.module('app').controller('Companies', ['$scope', '$http', 'companiesFactory', 'L10NFactory', function($scope, $http, companiesFactory, L10NFactory) {

    $scope.params = {
        companyRoles: companyRoles,
        companiesLoaded: false,
        isOwner: isOwner,
        userID: userId
    };

    $scope.localMessagesList = ['companies_limit_message', 'email_not_verified_message'];

    L10NFactory.preload($scope.localMessagesList);

    $scope.templates = {
        public: '/js/templates/companies/publicView.htm',
        owner: '/js/templates/companies/ownerView.htm',
        current: '/js/templates/companies/publicView.htm'
    };

    if ($scope.params.isOwner == true) {
        $scope.templates.current = $scope.templates.owner;
    }

    $scope.getCompanies = function() {
        companiesFactory.getCompanies({ id: $scope.params.userID }).$promise.then(function(response) {
            $scope.params.companiesLoaded = true;
            $scope.companies = response;
        });
    };

    $scope.getCompanies();

    $scope.deleteCompany = function(company) {
        companiesFactory.deleteCompany({ id: company.id}).$promise.then(function(response) {
            $scope.companies.splice($scope.companies.indexOf(company), 1);
        });
    };

    $scope.openCreateCompanyPopup = function() {
        if ($scope.companies.length < 5) {
            $.fancybox({
                'padding'			: 0,
                'autoScale'			: true,
                'autoDimensions'    : true,
                'transitionIn'		: 'none',
                'transitionOut'		: 'none',
                'scrolling'   		: 'auto',
                'href' : '#post'
            });
        } else {
            $scope.$emit('notify', { text: L10NFactory.get('companies_limit_message') });
        }
    };

    $scope.closePopup = function() {
        angular.element('.fancybox-close').click();
    };

}]);

