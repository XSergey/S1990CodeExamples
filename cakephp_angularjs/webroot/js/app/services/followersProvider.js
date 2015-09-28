angular.module('app').factory('followersProvider', ['$resource', function($resource) {
    return $resource('/followers/:action/:id', {action: '@action', id: '@id'}, {
        get: {
            cache: true,
            method: 'GET',
            isArray: true,
            params: {action: 'getFollowers'},
            transformResponse: function(data) {
                return JSON.parse(data).followers;
            }
        },

        getFollowings: {
            cache: true,
            method: 'GET',
            isArray: true,
            params: {action: 'getFollowings'},
            transformResponse: function(data) {
                return JSON.parse(data).followers;
            }
        },

        delete: {
            isArray: false,
            method: 'GET',
            params: {action: 'deleteFollower'}
        },

        block: {
            isArray: false,
            method: 'POST',
            params: {action: 'blockFollowers'}
        },

        unBlock: {
            isArray: false,
            method: 'POST',
            params: {action: 'unBlockFollowers'}
        },

        activate: {
            isArray: false,
            method: 'POST',
            params: {action: 'activateFollowing'}
        },

        unActivate: {
            isArray: false,
            method: 'POST',
            params: {action: 'unActivateFollowing'}
        },

        setPermissions: {
            isArray: false,
            method: 'POST',
            params: {action: 'setFollowingPermissions'}
        },

        getPermissions: {
            cache: true,
            isArray: false,
            method: 'GET',
            params: {action: 'getFollowingPermissions'},
            transformResponse: function(data) {
                return JSON.parse(data).permissions;
            }
        }
    });
}]);
