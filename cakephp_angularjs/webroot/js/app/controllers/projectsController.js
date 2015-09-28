angular.module('app').controller('Project.MarketPlace', [
    '$scope',
    '$filter',
    'projectsFactory',
    '$timeout',
    '$http',
    function($scope, $filter, projectsFactory, $timeout, $http) {
        var itemsPerPage = 12;

        $scope.userId = null;
        $scope.projects = [];
        $scope.selected = {
            projectTypes: []
        };
        $scope.hash1 = null;

        // *** BEGIN ***
        $scope.$watch('userId', function(userID) {
            projectsFactory.getProjects({url: 'projects', action: 'GetProjects', 'userId': userID, 'limit': 100}).$promise.then(function(response) {
                $scope.projects = response;
                $scope.projectsLoaded = true;
            });
        });

        $scope.$watch('projectTypes', function(value) {
            $scope.selected.projectTypes = [];
            angular.forEach(value, function(val, key) {
                $scope.selected.projectTypes.push({
                    'id': key,
                    'name': val.title,
                    'selected': true
                });
            });
        });

        $scope.showRequirements = function(project) {
            if (angular.isDefined(project.isShowRequirements))
                delete project.isShowRequirements;
            else if (project.requirement_count > 0) {
                window.requirementProviderOptions = {'id': project.id };
                project.isShowRequirements = true;
            }
        };

        $scope.sortProjects = function() {
            $scope.sortAsc = !$scope.sortAsc;
            $scope.projectsSorted = $filter('orderBy')($scope.projects, 'id', $scope.sortAsc);
        };

        $scope.projectTypeFilter = function(val, indx) {
            return ($filter('filter')($scope.selected.projectTypes, {'id': val.project_type_id, 'selected': true}).length > 0);
        };

        $scope.deleteProject = function(project) {
            window.location.href = '/projects/deleteProject/' + project.id;
        };

        $scope.resizeFancybox = function() {
            $timeout(function() {
                $.fancybox.update();
            });
        };

        $scope.initGridView = function() {
            $scope.sortProjects();
            $scope.pages = $filter('slide')([], itemsPerPage, $scope.projectsSorted.length);
            $timeout(function() {
                $('.posts-slide').cycle({
                    timeout: 6000
                });
            }, 600);
        };

        $scope.switchVisibilityProject = function() {
            $scope.actionStatus = this.project.active ? 0 : 1;
            $scope.that = this;
            $http.post('/projects/switchVisibility/' + this.project.id + '/' + $scope.actionStatus + '/1', {}).success(function(response) {
                if (response.error === false) {
                    $scope.that.project.active = $scope.actionStatus;
                    $scope.$emit('notify', {text: $scope.actionStatus == 1 ? 'Posting activated' : 'Posting deactivated'});
                } else {
                    $scope.$emit('notify', {text: 'Error occurred... please try again'});
                }
            });
        };
    }
]);

