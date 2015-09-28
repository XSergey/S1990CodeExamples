angular.module('app').controller('CompanyProfile.Projects', ['$scope', '$http', 'editableSections', function($scope, $http, editableSections) {
    $scope.photos = [];
    $scope.projects = listCompanyProjects;
    $scope.addEditProject = '';

    $scope.addProject = function(hash) {
        editableSections.get(hash, function(res) {
            $scope.addEditProject = res;
            $scope.$apply();
        });
    };

    $scope.editProject = function(hash, id) {
        var data = {CompanyProject: {id: id}};
        editableSections.post(hash, data, function(res) {
            $scope.addEditProject = res;
            $scope.$apply();
        });
    };

    $scope.deleteProject = function(projectId, elem) {
        if (confirm('Are you sure you want to delete this Project?')) {
            $http.get('/companies/deleteProject/' + projectId).success(function(resp) {
                if (!resp.error) $scope.projects.splice($scope.projects.indexOf(elem), 1);
            });
        }
    };

    $scope.saveProject = function() {
        var elem = $('#CompanyProjectEditSectionForm');
        editableSections.post(elem.attr('data-section-hash'), elem.serialize(), function(res) {
            var isEdit = false;

            angular.forEach($scope.projects, function(val, key) {
                if (val.id === res.result.item[0].id) {
                    isEdit = true;
                    $scope.projects[key] = res.result.item[0];
                }
            });

            if (!isEdit) $scope.projects.push(res.result.item[0]);

            $scope.addEditProject = '';
            $scope.$apply();
            jQuery('.carousel').jcarousel({scroll: 1});
        }, true);
    };

    $scope.addPhoto = function(up, file, info) {
        var result = $.parseJSON(info.response);
        if (!result.error) {
            $scope.photos.push({photo: result.photo});
            $scope.$apply();
        }
    };

    $scope.initUploader = function() {
        $scope.uploader = new plupload.Uploader({
            runtimes: 'gears,html5,flash,silverlight,browserplus',
            browse_button: 'addProjectPhoto',
            chunk_size: '1mb',
            max_file_size: '2mb',
            url: '/company/uploadPhoto',
            flash_swf_url: '/js/plu_uploader/plupload.flash.swf',
            filters: [
                {title: 'Image files', extensions: 'jpg,png,jpeg'}
            ],
            multi_selection: false
        });

        $scope.uploader.init();

        $scope.uploader.bind('FilesAdded', function(upload) {
            upload.start();
        });

        $scope.uploader.bind('FileUploaded', $scope.addPhoto);
    };

    $scope.removeImage = function(elem) {
        $scope.photos.splice($scope.photos.indexOf(elem), 1);
    };
}]);

angular.module('app').controller('CompanyProfile.Funds', ['$scope', '$http', 'editableSections', function($scope, $http, editableSections) {
    $scope.funds = listCompanyFunds;
    $scope.addEditFund = '';

    $scope.addFund = function(hash) {
        editableSections.post(hash, {fund: true}, function(res) {
            $scope.addEditFund = res;
            $scope.$apply();
        });
    };

    $scope.editFund = function(hash, id) {
        var data = {CompanyFund: {id: id}, fund: true};
        editableSections.post(hash, data, function(res) {
            $scope.addEditFund = res;
            $scope.$apply();
        });
    };

    $scope.saveFund = function() {
        var elem = $('#CompanyFundEditSectionForm');
        editableSections.post(elem.attr('data-section-hash'), elem.serialize(), function(res) {
            var isEdit = false;

            angular.forEach($scope.funds, function(val, key) {
                if (val.id === res.result.item[0].id) {
                    isEdit = true;
                    $scope.funds[key] = res.result.item[0];
                }
            });

            if (!isEdit) $scope.funds.push(res.result.item[0]);

            $scope.addEditFund = '';
            $scope.$apply();
        }, true);

    };

    $scope.deleteFund = function(fundId, elem) {
        if (confirm('Are you sure you want to delete this Fund?')) {
            $http.get('/companies/deleteFund/' + fundId).success(function(resp) {
                if (!resp.error) $scope.funds.splice($scope.funds.indexOf(elem), 1);
            });
        }
    };
}]);

angular.module('app').controller('CompanyProfile.Showcases', ['$scope', '$timeout', 'projectShowcases', function($scope, $timeout, projectShowcases) {
    $scope.showcase = {};
    $scope.companyId = window.companyId;
    $scope.showcases = projectShowcases.get({id: $scope.companyId});
    $scope.showImages = true;
    $scope.isMyCompany = window.isMyCompany;

    $scope.init = function() {
        $timeout(function() {
            $scope.initUploader();
            jQuery('.carousel').jcarousel({scroll: 1});
        });
    };

    $scope.template = ($scope.isMyCompany) ?
        '/js/templates/companyProfile/projectShowcase.htm' :
        '/js/templates/companyProfile/projectShowcaseView.htm';

    $scope.edit = function(elem) {
        $scope.showcase = {};
        $scope.showcase.data = angular.copy(elem);
        $scope.showcase.id = $scope.showcases.indexOf(elem);

        return true;
    };

    $scope.create = function() {
        $scope.showcase.data = new projectShowcases({
            CompanyProjectShowcasePhoto: []
        });
    };

    $scope.save = function() {
        var isCreated = $scope.showcase.data.id ? false : true;

        $scope.showcase.data.$save(function(res) {
            isCreated ?
                $scope.showcases.push(res) :
                $scope.showcases[$scope.showcase.id] = res;

            $scope.showcase.data = {};
            angular.element.fancybox.close();
        });
    };

    $scope.delete = function(elem) {
        if (confirm('Are you sure you want to delete this Showcase?')) {
            elem.$delete({id: elem.id}, function(res) {
                $scope.showcases.splice($scope.showcases.indexOf(elem), 1);
            });
        }
    };

    $scope.addPhoto = function(up, file, info) {
        var result = $.parseJSON(info.response);
        if (!result.error) {
            $scope.showImages = false;
            $scope.$apply();
            $scope.showcase.data.CompanyProjectShowcasePhoto.push({photo: result.photo});
            $scope.showImages = true;
            $scope.$digest();
            jQuery('.carousel').jcarousel({scroll: 1});
        }
    };

    $scope.initUploader = function() {
        $scope.uploader = new plupload.Uploader({
            runtimes: 'gears,html5,flash,silverlight,browserplus',
            browse_button: 'addShowcasePhoto',
            chunk_size: '1mb',
            max_file_size: '5mb',
            url: '/company/uploadPhoto',
            flash_swf_url: '/js/plu_uploader/plupload.flash.swf',
            filters: [
                {title: 'Image files', extensions: 'jpg,png,jpeg'}
            ],
            multi_selection: false
        });

        $scope.uploader.init();

        $scope.uploader.bind('FilesAdded', function(upload) {
            upload.start();
        });

        $scope.uploader.bind('FileUploaded', $scope.addPhoto);
    };

    $scope.removeImage = function(elem) {
        $scope.showcase.data.CompanyProjectShowcasePhoto.splice($scope.showcase.data.CompanyProjectShowcasePhoto.indexOf(elem), 1);
    };
}]);
