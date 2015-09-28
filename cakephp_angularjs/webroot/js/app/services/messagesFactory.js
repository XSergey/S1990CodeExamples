angular.module('app').factory('messagesFactory', ['$resource', function($resource) {
    return $resource('/messages/:action/:id', {action: 'loadInbox', id: ''}, {
        inbox: {
            cache: false,
            method: 'GET',
            isArray: true,
            params: {action: 'loadInbox'},
            transformResponse: function(data) {
                return JSON.parse(data).messages;
            }
        },
        outbox: {
            cache: false,
            method: 'GET',
            isArray: true,
            params: {action: 'loadSent'},
            transformResponse: function(data) {
                return JSON.parse(data).messages;
            }
        },
        open: {
            cache: true,
            method: 'GET',
            isArray: false,
            params: {action: 'readMsg'},
            transformResponse: function(data) {
                return JSON.parse(data).message;
            }
        }
    });
}]);
