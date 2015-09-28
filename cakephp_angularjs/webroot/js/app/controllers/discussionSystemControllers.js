angular.module('app').controller('discussionSystem', ['$scope', '$http', '$filter', function($scope, $http, $filter) {
    $scope.isAjaxSend = true;
    $scope.avatar = avatar;
    $scope.replies = [];
    $scope.discussion = [];
    $scope.templates = {
        posts: {
            basic: '/js/templates/discussionSystem/index.htm'
        }, add: {
            basic: '/js/templates/discussionSystem/add.htm'
        }
    };

    $scope.addDiscussion = function() {
        if ($scope.isAjaxSend && angular.isString($scope.discussion['join'])) {
            $scope.isAjaxSend = false;
            $http.post('/DiscussionSystem/addDiscussion', {
                'id': $scope.folder_id,
                'text': $scope.discussion['join'],
                path: $scope.currentPath}
            ).success(function(responce) {
                $scope.isAjaxSend = true;
                if (responce.error == false) {
                    $scope.discussion['join'] = null;
                    $scope.$broadcast('openRoom', {id: $scope.folder_id, path: $scope.currentPath });
                }
            });
        }
        return false;
    };

    $scope.addReply = function(args) {
        if ($scope.isAjaxSend && angular.isString($scope.discussion['reply'])) {
            $scope.isAjaxSend = false;
            $http.post('/DiscussionSystem/addDiscussion', {
                'id': $scope.folder_id,
                'text': $scope.discussion['reply'],
                'parent_id': args,
                'path': $scope.currentPath
            }).success(function(responce) {
                $scope.isAjaxSend = true;
                if (responce.error == false) {
                    $scope.discussion['reply'] = null;
                    $scope.$emit('openRoom', {id: $scope.folder_id, path: $scope.currentPath });
                }
            });
        }
        return false;
    };

    $scope.replyDiscussion = function(args) {
        $scope.replies = [];
        $scope.replies[args] = true;
        return false;
    };

    $scope.$on('openRoom', function(event, args) {
        $scope.currentPath = args.path;
        $scope.replies = [];
        $http.post('/DiscussionSystem/getDiscussion', {
            'id': args.id
        }).success(function(response) {
            $scope.comments = response.comments;
            $scope.folder_id = args.id;
        });
    });
}]);
