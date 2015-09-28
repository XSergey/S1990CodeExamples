angular.module('app').controller('ProjectProfile.Images', ['$scope', 'editableSections', function($scope, editableSections){
    $scope.images = [];
    $scope.editImages = '';

    $scope.addPhoto = function(up, file, info){
        var result = $.parseJSON(info.response);
        if (!result.error) {
            $scope.images.push({img_link: result.photo});
            $scope.$apply();
        }
    };

    $scope.editPhotos = function(hash, id){
        var data = {id: id};
        editableSections.post(hash, data, function(res){
            $scope.editImages = res;
            $scope.$apply();
        });
    };

    $scope.saveImages = function(hash){
        var elem = $('#ProjectAddImages');
        editableSections.post(elem.attr('data-section-hash'), elem.serialize(), function(res){
            if (!res.error) {
                $scope.images = [];
                $scope.editImages = '';
                $scope.viewImages = res.result.content;
                $scope.$apply();
            }
        }, true);
    };

    $scope.initUploader = function(){
        $scope.uploader = new plupload.Uploader({
            runtimes : 'gears,html5,flash,silverlight,browserplus',
            browse_button : 'addProjectPhoto',
            chunk_size: '1mb',
            max_file_size : '2mb',
            url : '/projects/uploadPhoto',
            flash_swf_url : '/js/plu_uploader/plupload.flash.swf',
            filters : [
                {title : "Image files", extensions : "jpg,png,jpeg"}
            ],
            multi_selection: false
        });

        $scope.uploader.init();

        $scope.uploader.bind('FilesAdded', function(upload){
            upload.start();
        });

        $scope.uploader.bind('FileUploaded', $scope.addPhoto);
    };

    $scope.removeImage = function(elem){
        $scope.images.splice($scope.images.indexOf(elem), 1);
    };
}]);