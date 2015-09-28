angular.module('app').config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/followers', {
            templateUrl: 'mainTemplate.htm',
            controller: 'followers',
            resolve: {
                currentSection: function() {return 'followers'},
                followersList: function(followersProvider) {return followersProvider.get()}
            }
        }).
        when('/followings', {
            templateUrl: 'mainTemplate.htm',
            controller: 'followers',
            resolve: {
                currentSection: function() {return 'followings'},
                followersList: function(followersProvider) {return followersProvider.getFollowings()}
            }
        }).
        otherwise({redirectTo: '/followers'});
}]);

angular.module('app').controller('followers', ['$scope', '$http', 'followersProvider', 'followersList', 'currentSection', '$cacheFactory', function($scope, $http, followersProvider, followersList, currentSection, $cacheFactory) {
    $scope.currentSection = currentSection;

    $scope.followers = {
        list: followersList,
        orderBy: 'FollowerData.full_name',
        searchFor: null,
        reverseOrder: false,
        filter_by_entity: false
    };

    $scope.getPermissions = function() {
        if ($scope.permissionsLoaded !== true) {
            $scope.followingPermissions = followersProvider.getPermissions();
            $scope.permissionsLoaded = true;
        }
    };

    $scope.setPermissions = function() {
        var followingPermissions = {};
        angular.forEach($scope.followingPermissions, function(elem, key) {
            if (key == 'auto_following') {
                followingPermissions[key] = elem;
            } else {
                followingPermissions[key] = (elem === true) ? 1 : 0;
            }
        });
        followersProvider.setPermissions({data: {permissions: followingPermissions}});
        $cacheFactory.get('$http').remove('/followers/getFollowingPermissions');
    };

    $scope.blockFollowers = function(follower) {
        if (typeof follower === 'undefined') {
            var checkedFollowers = [];
            angular.forEach($scope.followers.list, function(follower) {
                if (follower.checked) {
                    checkedFollowers.push(follower.Follower.id);
                    follower.Follower.blocked = true;
                }
            });
            followersProvider.block({data: {followers: checkedFollowers}});
        } else {
            followersProvider.block({data: {followers: [follower.Follower.id]}});
            follower.Follower.blocked = true;
        }

        currentSection == 'followers' ?
            $cacheFactory.get('$http').remove('/followers/getFollowers') :
            $cacheFactory.get('$http').remove('/followers/getFollowings');
    };

    $scope.unBlockFollowers = function(follower) {
        if (typeof follower === 'undefined') {
            var checkedFollowers = [];
            angular.forEach($scope.followers.list, function(follower) {
                if (follower.checked) {
                    checkedFollowers.push(follower.Follower.id);
                    follower.Follower.blocked = false;
                }
            });
            followersProvider.unBlock({data: {followers: checkedFollowers}});
        } else {
            followersProvider.unBlock({data: {followers: [follower.Follower.id]}});
            follower.Follower.blocked = false;
        }

        currentSection == 'followers' ?
            $cacheFactory.get('$http').remove('/followers/getFollowers') :
            $cacheFactory.get('$http').remove('/followers/getFollowings');
    };

    $scope.activateFollowers = function(follower) {
        if (typeof follower === 'undefined') {
            var checkedFollowers = [];
            angular.forEach($scope.followers.list, function(follower) {
                if (follower.checked) {
                    checkedFollowers.push(follower.Follower.id);
                    follower.Follower.active = true;
                }
            });
            followersProvider.activate({data: {followers: checkedFollowers}});
        } else {
            followersProvider.activate({data: {followers: [follower.Follower.id]}});
            follower.Follower.active = true;
        }

        currentSection == 'followers' ?
            $cacheFactory.get('$http').remove('/followers/getFollowers') :
            $cacheFactory.get('$http').remove('/followers/getFollowings');
    };

    $scope.unActivateFollowers = function(follower) {
        if (typeof follower === 'undefined') {
            var checkedFollowers = [];
            angular.forEach($scope.followers.list, function(follower) {
                if (follower.checked) {
                    checkedFollowers.push(follower.Follower.id);
                    follower.Follower.active = false;
                }
            });
            followersProvider.unActivate({data: {followers: checkedFollowers}});
        } else {
            followersProvider.unActivate({data: {followers: [follower.Follower.id]}});
            follower.Follower.active = false;
        }

        currentSection == 'followers' ?
            $cacheFactory.get('$http').remove('/followers/getFollowers') :
            $cacheFactory.get('$http').remove('/followers/getFollowings');
    };

    $scope.switchSelection = function($event) {
        angular.forEach($scope.followers.list, function(follower) {
            follower.checked = $event.target.checked;
        });
    };

    $scope.filterByEntity = function(elem) {
        switch ($scope.followers.filter_by_entity) {
            case 1: return $scope.isMember(elem); break;
            case 2: return $scope.isCompany(elem); break;
            case 3: return $scope.isProject(elem); break;
            case 4: return $scope.isBlocked(elem); break;

            default: return true;
        }
    };

    $scope.followersOrder = function(item) {
        var attributes = $scope.followers.orderBy.split('.');
        var value = item;

        angular.forEach(attributes, function(attribute) {
            value = value[attribute];
        });

        return value;
    };

    $scope.setOrderBy = function(orderBy) {
        if ($scope.followers.orderBy == orderBy) {
            $scope.followers.reverseOrder = !$scope.followers.reverseOrder;
        } else {
            $scope.followers.orderBy = orderBy;
            $scope.followers.reverseOrder = false;
        }
    };

    $scope.isMember = function(elem) {
        return elem.Follower.following_entity == 1;
    };

    $scope.isCompany = function(elem) {
        return elem.Follower.following_entity == 2;
    };

    $scope.isProject = function(elem) {
        return elem.Follower.following_entity == 3;
    };

    $scope.isBlocked = function(elem) {
        return elem.Follower.blocked == true;
    };
}]);
