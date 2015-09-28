angular.module('app').factory('L10NFactory', ['$http', function($http) {
    var currentMessage;

    function supportStorage() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }

    return {
        get: function(message) {
            if (supportStorage() && localStorage.getItem('local_' + message)) {
                return localStorage.getItem('local_' + message);
            } else {
                $http.post('/innerApi/getLocalMessages/', {'messages' : [message]}).success(function(response) {
                    if (!response.error) {
                        for (key in response.messages) {
                            localStorage.setItem('local_' + key, response.messages[key]);
                            currentMessage = response.messages[key];
                        }
                        return currentMessage;
                    }
                });
                return currentMessage;
            }
        },

        preload: function(messages) {
            var key, message, notStoredMsgs = [];
            for (key in messages) {
                message = messages[key];
                if (supportStorage() && localStorage.getItem('local_' + message)) {
                } else {
                    notStoredMsgs.push(message);
                }
            }

            if (notStoredMsgs.length > 0) {
                $http.post('/innerApi/getLocalMessages/', {'messages' : notStoredMsgs}).success(function(response) {
                    if (!response.error) {
                        for (key in response.messages) {
                            localStorage.setItem('local_' + key, response.messages[key]);
                        }
                    }
                });
            }
        }
    };
}]);
