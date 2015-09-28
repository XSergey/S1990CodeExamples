angular.module('app').factory('addressesFactory', ['$resource', function($resource) {
    return $resource('/address-book/:action/:id', {action: '@action', id: '@id'}, {
        getAllContacts: {
            cache: false,
            method: 'GET',
            params: {action: 'getAllContacts', 'r': Math.floor(Math.random() * 1000)},
            isArray: false,
            transformResponse: function(data) {
                return JSON.parse(data);
            }
        },

        getContactsDetails: {
            cache: true,
            method: 'GET',
            params: {action: 'getContactDetails'},
            transformResponse: function(data) {
                return JSON.parse(data).data;
            }
        },

        createGroup: {
            isArray: false,
            method: 'POST',
            params: {action: 'addGroup'}
        },

        editGroup: {
            isArray: false,
            method: 'POST',
            params: {action: 'editGroup'}
        },

        deleteGroup: {
            isArray: false,
            method: 'POST',
            params: {action: 'deleteGroup'}
        },

        getContactsFromGroup: {
            cache: false,
            isArray: true,
            method: 'GET',
            params: {action: 'getGroupContacts'},
            transformResponse: function(data) {
                return JSON.parse(data).contacts;
            }
        },

        deleteContacts: {
            isArray: false,
            method: 'POST',
            params: {action: 'deleteContacts'}
        },

        saveContact: {
            isArray: false,
            method: 'POST',
            params: {action: 'editContact'}
        },

        approveImportContacts: {
            isArray: false,
            method: 'POST',
            params: {action: 'saveImport'}
        },

        inviteContacts: {
            isArray: false,
            method: 'POST',
            params: {action: 'inviteContacts'}
        },

        importContacts: {
            isArray: false,
            method: 'POST',
            params: {action: 'importContacts'}
        }
    });
}]);
