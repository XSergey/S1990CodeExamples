angular.module('app').factory('dataRoomsFactory', ['$resource', function($resource){
    return $resource('/getRooms/:path', {path : '@path'}, {
        getRooms: {
            cache: true,
            method: 'GET',
            transformResponse: function(data){
                return JSON.parse(data);
            }
        }
    });
}]);