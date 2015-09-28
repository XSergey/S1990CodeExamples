angular.module('app').factory('editableSections', function() {
    return {
        get: function(hash, callback) {
            $.get('/edit/section/' + hash + '/1', callback);
        },
        post: function(hash, data, callback, json) {
            $.post('/edit/section/' + hash + (json === true ? '' : '/1'), data, callback);
        }
    };
});
