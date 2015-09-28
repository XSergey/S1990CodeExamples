function RequirementsController(name, $scope, $compile, editableSections, requirementCommon) {
    this.requirements = [];
    this.requirementName = name;

    this.settings = {
        indx:              null,
        isEdit:            false,
        saveHash:          null,
        editHash:          null,
        deleteHash:        null,
        isShowSection:     true,
        fancyBoxScrolling: 'false'
    };

    this.cancel = function () {
        angular.element.fancybox.close();
    };

    this.addItem = function (projectId, hash) {
        $scope.moneyType = null;
        $scope.settings.isShowSection = false;
        $scope.settings.isEdit = false;
        editableSections.post($scope.settings.editHash, {'projectId': projectId}, function (response) {
            $scope._showBox(response);
        });
    };

    this.editItem = function (item) {
        $scope.settings.isShowSection = true;
        $scope.settings.isEdit = true;
        $scope.settings.indx = $scope.requirements.indexOf(item);
        editableSections.post($scope.settings.editHash, {'itemId': item.id}, function (response) {
            $scope._showBox(response);
        });
    };

    this.deleteItem = function (item) {
        if (confirm('The requirement "' + item.title + '" will be deleted. Continue?')) {
            editableSections.post($scope.settings.deleteHash, {'itemId': item.id}, function (response) {
                requirementCommon.removeRequirement($scope.requirementName, item);
                $scope.$apply();
            });
        }
    };

    this.submit = function () {
        var data = angular.element('#_fancybox-content form').serialize();
        editableSections.post($scope.settings.saveHash, data, function (response) {
            response = $.parseJSON(response);

            $scope.settings.isEdit ?
                requirementCommon.saveRequirement($scope.requirementName, response, $scope.settings.indx) :
                requirementCommon.addRequirement($scope.requirementName, response);

            $scope.$apply();
            angular.element.fancybox.close();
        });
    };


    this._showBox = function (html) {
        var content = angular.element('<div />').attr('id', '_fancybox-content').append(html);
        $compile(content)($scope);
        $scope.$apply();
        angular.element.fancybox({
            'content':        content,
            'padding':        0,
            'autoScale':      true,
            'autoDimensions': true,
            'transitionIn':   'none',
            'transitionOut':  'none',
            'scrolling':      $scope.settings.fancyBoxScrolling,
            'centerOnScroll': true,
            'helpers':        {
                overlay: {
                    locked: false
                }
            }
        });
    };

    this.cancel = function () {
        angular.element.fancybox.close();
    }

    this.toString = function (arr, field) {
        return arr.map(function (item) {
            return item[field];
        }).join(', ');
    };
}

angular.module('app').controller('Requirements.Financial', [
    '$scope', '$http', '$compile', 'editableSections', 'requirementCommon',
    function ($scope, $http, $compile, editableSections, requirementCommon) {

        angular.extend($scope, new RequirementsController('FinancialRequirement', $scope, $compile, editableSections, requirementCommon));

        $scope.moneyTypes = [];

        $scope.sheduleList = {1: 'daily', 2: 'weekly', 3: 'never'};

        $scope.LoansArr = {2: 'Loan', 3: 'Mezz', 1: 'Hard Money'};


        $scope.switchLighthouseSearchTemplate = function (requirement) {
            requirement.lighthouse_enabled = !requirement.lighthouse_enabled;
            $http.get('/requirements/switchLighthouseSearch/' + requirement.id + '/' + requirement.type);
        };

        $scope.switchPrivacy = function (requirement) {
            requirement.private = !requirement.private;
            $http.get('/privacy/switchFinancialRequirementPrivacy/' + requirement.id);
        };

        $scope.$watch('settings.isShowSection', function (value) {
            // Centering fancybox after shown section, because fancybox don't want to do it itself.
            if (value)
                angular.element('#_fancybox-content').resize();
        });

        $scope.init = function (data, moneyTypes, editHash, saveHash, deleteHash) {
            $scope.moneyTypes = moneyTypes;
            $scope.requirements = data;
            requirementCommon.setRequirements($scope.requirementName, data);
            $scope.settings.editHash = editHash;
            $scope.settings.saveHash = saveHash;
            $scope.settings.deleteHash = deleteHash;
        };
    }
]);

angular.module('app').controller('Requirements.Service', [
    '$scope', '$http', '$compile', 'editableSections', 'requirementCommon',
    function ($scope, $http, $compile, editableSections, requirementCommon) {

        angular.extend($scope, new RequirementsController('ServiceRequirement', $scope, $compile, editableSections, requirementCommon));

        $scope.switchLighthouseSearchTemplate = function(requirement) {
            requirement.lighthouse_enabled = !requirement.lighthouse_enabled;
            $http.get('/requirements/switchLighthouseSearch/' + requirement.id + '/' + requirement.type);
        };

        $scope.switchPrivacy = function (requirement) {
            requirement.private = !requirement.private;
            $http.get('/privacy/switchServiceRequirementPrivacy/' + requirement.id);
        };

        $scope.init = function (data, editHash, saveHash, deleteHash) {
            $scope.requirements = data;
            requirementCommon.setRequirements($scope.requirementName, data);
            $scope.settings.editHash = editHash;
            $scope.settings.saveHash = saveHash;
            $scope.settings.deleteHash = deleteHash;
        };
    }
]);

angular.module('app').controller('Requirements.Partner', [

    '$scope', '$http', '$compile', 'editableSections', 'requirementCommon',
    function ($scope, $http, $compile, editableSections, requirementCommon) {

        angular.extend($scope, new RequirementsController('PartnerRequirement', $scope, $compile, editableSections, requirementCommon));

        $scope.settings.fancyBoxScrolling = 'auto';

        $scope.switchPrivacy = function (requirement) {
            requirement.private = !requirement.private;
            $http.get('/privacy/switchPartnerRequirementPrivacy/' + requirement.id);
        };

        $scope.contributionMeToString = function (requirement) {
            var fields = {
                'me_land':     'Land',
                'me_project':  'Project',
                'me_equity':   'Equity',
                'me_services': 'Services',
                'me_other':    'Other'
            };
            return $scope.getContribution(requirement, fields);
        };

        $scope.contributionPartnerToString = function (requirement) {
            var fields = {
                'partner_land':     'Land',
                'partner_project':  'Project',
                'partner_equity':   'Equity',
                'partner_services': 'Services',
                'partner_other':    'Other'
            };
            return $scope.getContribution(requirement, fields);
        };

        $scope.getContribution = function (requirement, fields) {
            var arr = [];
            angular.forEach(fields, function (value, key) {
                if (requirement[key] == 1) {
                    arr.push(value);
                }
            });
            return arr.join(', ');
        };

        $scope.init = function (data, editHash, saveHash, deleteHash) {
            $scope.requirements = data;
            requirementCommon.setRequirements($scope.requirementName, data);
            $scope.settings.editHash = editHash;
            $scope.settings.saveHash = saveHash;
            $scope.settings.deleteHash = deleteHash;
        };
    }
]);

angular.module('app').controller('Requirements.Common', [
    '$scope', '$http', '$compile', 'editableSections', 'requirementCommon',
    function ($scope, $http, $compile, editableSections, requirementCommon) {
        $scope.requirementName = '';

        $scope.settings = {
            isEdit:            false,
            isShowSection:     true,
            fancyboxScrolling: {
                'FinancialRequirement': 'false',
                'ServiceRequirement':   'false',
                'PartnerRequirement':   'auto'
            }
        };

        $scope.getRequirementsCount = function () {
            return requirementCommon.getCount();
        };

        $scope.getLighthouseCount = function () {
            return requirementCommon.getLighthouseCount();
        };

        $scope.addItem = function (requirementName, projectId, hash) {
            $scope.requirementName = requirementName;
            $scope.moneyType = null;
            $scope.settings.isShowSection = false;
            $scope.settings.isEdit = false;
            editableSections.post(hash, {'projectId': projectId}, function (response) {
                $scope._showBox(response);
            });
        };

        $scope.cancel = function () {
            angular.element.fancybox.close();
        }

        $scope.submit = function (hash) {
            var data = angular.element('#_fancybox-content form').serialize();
            editableSections.post(hash, data, function (response) {
                response = $.parseJSON(response);

                $scope.settings.isEdit ?
                    requirementCommon.saveRequirement($scope.requirementName, response, $scope.settings.indx) :
                    requirementCommon.addRequirement($scope.requirementName, response);

                $scope.$apply();
                angular.element.fancybox.close();
            });
        };

        $scope.$watch('settings.isShowSection', function (value) {
            // Centering fancybox after shown section, because fancybox don't want to do it itself.
            if (value)
                angular.element('#_fancybox-content').resize();
        });

        $scope._showBox = function (html) {
            var content = angular.element('<div />').attr('id', '_fancybox-content').append(html);
            $compile(content)($scope);
            $scope.$apply();
            angular.element.fancybox({
                'content':        content,
                'padding':        0,
                'autoScale':      true,
                'autoDimensions': true,
                'transitionIn':   'none',
                'transitionOut':  'none',
                'scrolling':      $scope.settings.fancyboxScrolling[$scope.requirementName],
                'centerOnScroll': true,
                'helpers':        {
                    overlay: {
                        locked: false
                    }
                }
            });
        };
    }
]);

