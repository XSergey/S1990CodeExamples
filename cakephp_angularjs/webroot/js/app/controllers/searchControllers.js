angular.module('app').controller('search.Templates', ['$scope', 'searchTemplatesProvider', function($scope, searchTemplatesProvider) {
    $scope.projectsList = projectsList;
    $scope.companiesList = companiesList;
    $scope.global = {
        companyExist: companyExist
    };
    $scope.entetyPrefixs = {
      'm' : 1,
      'c' : 2,
      'p' : 3
    };

    if (typeof editTemplate != 'undefined') {
        $scope.editTemplate =  editTemplate;
    }

    if (typeof forProject == 'undefined') {
        $scope.forProject =  '';
    }

    if (typeof forCompany == 'undefined') {
        $scope.forCompany =  '';
    }

    var emptyTemplateItem = {
        entity_id: 1,
        title: '',
        type: window._searchFor,
        schedule: 'daily',
        is_edit: true
    };

    $scope.fullManagementPage = false;

    $scope.entities = { 'm_-1': 'Me' };

    for (var attrname in projectsList) {
        $scope.entities[attrname] = projectsList[attrname];
    }

    for (var attrname in companiesList) {
        $scope.entities[attrname] = companiesList[attrname];
    }

    $scope.sheduleList = {1: 'daily', 2: 'weekly', 3: 'never'};

    $scope.templates = {
        list: [],
        maxItems: 10,
        is_loaded: false,
        filter_by_entity: false
    };

    if ( angular.isDefined($scope.forProject) &&  $scope.forProject != '') {
        $scope.templates.filter_by_entity  = 3;
        $scope.templates.filter_by_entity_id = $scope.forProject;
    }

    if ( angular.isDefined($scope.forCompany) &&  $scope.forCompany != '') {
        $scope.templates.filter_by_entity  = 2;
        $scope.templates.filter_by_entity_id =  $scope.forCompany;
    }


    $scope.viewTemplates = {
        view: 'viewTemplate.html',
        edit: 'editTemplate.html'
    };

    $scope.loadTemplates = function(count) {
        if (!$scope.templates.is_loaded) {
            if (count) {
                $scope.templates.list = searchTemplatesProvider.getWithCount(true);
            } else {
                $scope.templates.list = searchTemplatesProvider.get();
            }
            $scope.templates.list.$promise.then(function() {
                $scope.templates.is_loaded = true;
                if (!$scope.fullManagementPage) {
                    $scope.addNewTemplate();
                }
            });
        }
    };

    $scope.addNewTemplate = function() {
        if ($scope.templates.list.length < $scope.templates.maxItems) {
            if (typeof $scope.templates.list[0] === 'undefined' || typeof $scope.templates.list[0].id !== 'undefined') {
                $scope.templates.list.unshift(angular.copy(emptyTemplateItem));
            }
        } else {
            $scope.$emit('notify', {text: "You can only save 10 searches at a time during Beta. If you want to save another search please delete a previous search first."});
        }
    };

    $scope.saveTemplate = function(template, edit_filter) {
        template.assoc_entity = $scope.entetyPrefixs[template.assoc_entity_id[0]];
        template.assoc_entity_id = template.assoc_entity_id.substring(2);
        template.edit_filter = (edit_filter) ? edit_filter : false;
        searchTemplatesProvider.save(template).$promise.then(function(res) {
            if (typeof template.id === 'undefined') {
                template.id = res.itemId;
                var currentDate = new Date();
                currentDate = [currentDate.getFullYear(), (currentDate.getMonth().length == 2) ? (currentDate.getMonth() + 1) : ('0' + (currentDate.getMonth() + 1)), currentDate.getDate()];
                template.created = currentDate.join('-');
                $scope.templates.list.push($scope.templates.list.shift());
            }
            if (template.edit_filter) {
                angular.element('#editTemplate').hide();
            }
            $scope.$emit('notify', {text: res.message });
        });
    };

    $scope.deleteTemplate = function(template) {
        if (typeof template.id !== 'undefined') {
            searchTemplatesProvider.delete({id: template.id});
        }
        $scope.templates.list.splice($scope.templates.list.indexOf(template), 1);
    };
}]);
