angular.module('app').controller('Requirements.SearchTemplates', ['$scope', '$filter', 'requirementsProvider', 'projectsFactory', 'editableSections', function($scope, $filter, requirementsProvider, projectsFactory, editableSections) {
    $scope.settings = {};

    $scope.fieldsTitles = {
        me_land: 'Land',
        me_other: 'Other',
        me_equity: 'Equity',
        me_project: 'Project',
        me_services: 'Services',

        partner_land: 'Land',
        partner_other: 'Other',
        partner_equity: 'Equity',
        partner_project: 'Project',
        partner_services: 'Services'
    };

    $scope.moneyTypes = ['Equity', 'Debt'];

    $scope.projectsList = projectsFactory.getList();

    requirementsProvider.get(window.requirementProviderOptions || {}).$promise.then(function(response) {
        $scope.requirements = {
            list: response.list,
            types: response.allowedRequirementTypes,
            filters: {type: '', project: ''}
        };
    });

    $scope.concatModelTitles = function(arr, field) {
        if (typeof arr !== 'undefined') {
            return arr.map(function(item) {
                return item[field];
            }).join(', ');
        }
    };

    $scope.switchLighthouseSearch = function(requirement) {
        requirement.lighthouse_enabled = !requirement.lighthouse_enabled;
        requirementsProvider.switchSearch({
            id: requirement.id,
            type: requirement.type
        }).$promise.then(function(response) {
                requirement['matches'] = (typeof response['matches'] !== 'undefined') ? response['matches'] : 0;
                requirement['UserSearchTemplate']['id'] = (typeof response['searchTemplateId'] !== 'undefined') ? response['searchTemplateId'] : null;
            });
    };

    $scope.openCheckedItems = function() {
        var projects = [];
        $scope.requirements.list.forEach(function(requirement) {
            if (requirement.selected && projects.indexOf(requirement.project_id) === -1) {
                window.open('/user/id' + requirement.user_id + '/projects/id' + requirement.project_id, '_blank');
                projects.push(requirement.project_id);
            }
        });
    };

    $scope.removeRequirements = function(requirement) {
        var isGroupDelete = (typeof requirement === 'undefined'),
            requirements = [];

        if (isGroupDelete) {
            $scope.requirements.list.forEach(function(elem) {
                if (elem.selected) {
                    requirements.push({id: elem.id, type: elem.type});
                }
            });
        } else {
            requirements.push({id: requirement.id, type: requirement.type});
        }

        requirementsProvider.delete({requirements: requirements}).$promise.then(function() {
            requirements.forEach(function(_requirement) {
                $scope.requirements.list.forEach(function(requirement) {
                    if (requirement.id === _requirement.id && requirement.type === _requirement.type) {
                        $scope.requirements.list.splice($scope.requirements.list.indexOf(requirement), 1);
                    }
                });
            });
        });
    };

    $scope.saveRequirement = function(hash) {
        var form = angular.element('#_fancybox-content form');
        var data = form.serialize();
        editableSections.post(hash, data, function(data) {
            data = $.parseJSON(data);

            if (angular.isDefined(data.validationErrors)) {
                $scope.$emit('validation', {'form': form, 'errors': data.validationErrors});
            } else {
                var newRequirement = true;

                $scope.requirements.list.forEach(function(requirement, key) {
                    if (requirement.id == data[0].id && requirement.type == data[0].type) {
                        $scope.requirements.list[key] = data[0];
                        newRequirement = false;
                    }
                });

                if (newRequirement) {
                    $scope.requirements.list.push(data[0]);
                }

                $scope.$apply();
                angular.element.fancybox.close();
            }
        });
    };

    $scope.selectAllSwitcher = function() {
        $scope.requirements.list.forEach(function(elem) {
            elem.selected = !$scope.isSelectAll;
        });
    };

    $scope.resizeBox = function() {
        $scope.settings.isShowSection = true;
        angular.element('#_fancybox-content').resize();
    };

    $scope.toggleMenu = function() {
        angular.element('.more-add > ul').animate({
            'opacity': 'toggle'
        }, 200);
    };

    $scope.getEditHash = function(requirementTypeId) {
        return $filter('filter')($scope.requirements.types, {id: requirementTypeId})[0].editHash;
    };

    $scope.getViewHash = function(requirementTypeId) {
        return $filter('filter')($scope.requirements.types, {id: requirementTypeId})[0].viewHash;
    };

    $scope.filterRequirementsByGroup = function(requirementTypeId) {
        return function(requirement) {
            if (['7', '8', '12'].indexOf(requirementTypeId) !== -1) {
                return false;
            }

            if (requirementTypeId == 2) {
                if (['2', '7', '8'].indexOf(requirement.type) !== -1) {
                    return true;
                }
            }

            if (requirementTypeId == 11) {
                if (['11', '12'].indexOf(requirement.type) !== -1) {
                    return true;
                }
            }

            return requirement.type == requirementTypeId;
        };
    };
}]);
