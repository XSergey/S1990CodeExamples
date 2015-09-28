angular.module('app').config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/contacts', {
            templateUrl: 'js/templates/addressBook/tabs/addresses.htm',
            controller: 'AddressBook.Addresses'
        }).
        when('/messages', {
            templateUrl: 'js/templates/addressBook/tabs/messages.htm',
            controller: 'CompanyProfile.Messages'
        }).
        otherwise({redirectTo: '/contacts'});
}]);

angular.module('app').controller('AddressBook.Main', [
    '$scope',
    '$location',
    'uploaderService',
    'addressesFactory',
    function($scope, $location, uploaderService, addressesFactory) {
        $scope.isCurrentLocation = function(path) {
            return $location.path() === path;
        };

        $scope.importContacts = function($providerName) {

            if ($scope.csvImportFile) {
                var requestData = {
                    file: $scope.csvImportFile,
                    provider: $providerName
                };
                addressesFactory.importContacts(requestData).$promise.then(function(res) {
                    if (res.contacts) {
                        // Trigger event down
                        $scope.$broadcast('AddressBook.Main.OnImportComplete', {
                            'contacts': res.contacts
                        });
                        // Trigger event up
                        $scope.$emit('notify', {text: 'Contacts uploaded'});
                        angular.element.fancybox.close();
                    } else {
                        $scope.$emit('notify', {text: res.errorDesc, type: 'error'});
                    }
                });
            } else {
                $scope.$emit('notify', {text: 'Please select CSV file', type: 'error'});
            }
        };

        $scope.importFromFile = function(type) {
            $scope.clearImportFile();
            $scope.importType = type;
            $scope.$apply();
            return true;
        };

        $scope.clearImportFile = function() {
            $scope.csvImportFile = null;
            $scope.csvImportFileName = null;
        };

        $scope.uploadCSV = function() {
            angular.element('#uploadCSVFile').trigger('click');
        };

        $scope.templates = {
            right: {
                'import': 'js/templates/addressBook/rightSide/importContacts.htm',
                'operations': 'js/templates/addressBook/rightSide/communicateOperations.htm',
                'view': 'js/templates/addressBook/rightSide/viewContact.htm'
            }
        };

        (function() {
            var settingsForImport = {
                uploadBtn: 'uploadCSVFile',
                uploadPhotoUrl: '/address-book/uploadFile'
            };
            uploaderService.uploaderInit(function(resObj) {
                $scope.csvImportFile = resObj.filePath;
                $scope.csvImportFileName = resObj.fileName;
                $scope.$digest();
            }, settingsForImport);
        })();
    }]);

angular.module('app').controller('AddressBook.Addresses', [
    '$scope',
    '$filter',
    '$http',
    '$timeout',
    'addressesFactory',
    'uploaderService',
    function($scope, $filter, $http, $timeout, addressesFactory, uploaderService) {

        $scope.menu = {'selected': 'all'};

        $scope.allContacts = [];
        $scope.contacts = [];
        $scope.groups = [];
        $scope.alphabetContacts = [];
        $scope.communicateList = [];

        $scope.selectedAll = null;
        $scope.editContact = null;
        $scope.countSelected = 0;

        $scope.currentContact = null;
        $scope.currentGroup = null;

        $scope.searchCache = null;

        $scope.mail = {};
        $scope.invite = {};
        $scope.preview = false;
        $scope.pagination = {
            'pages': 0,
            'current': 0,
            'itemsPerPage': 20
        };

        var inviteTypes = {
            1: 'my profile', 2: 'my company\'s profile', 3: 'my posting'
        };

        // *** Init
        $scope.projectsList = window.projectsList.filter(function(item) {
            return item.title != null;
        });
        $scope.currentUserId = window.currentUserId;
        $scope.currentUserCompanyId = window.currentUserCompanyId;

        addressesFactory.getAllContacts().$promise.then(function(response) {
            $scope.allContacts = response.contacts;
            $scope.groups = response.groups;

            $scope.contacts = angular.copy($scope.allContacts);
            $scope.searchCache = angular.copy($scope.contacts);
        });

        // *** Watchers
        $scope.$watch('allContacts', function() {
            //            $scope.contacts = angular.copy($scope.allContacts);
            $scope.searchCache = angular.copy($scope.contacts);
        }, true);

        $scope.$watch('contacts', function(newVal, oldVal) {
            $scope.currentContact = null;
            $scope.selectedAll = false;
            $scope.countSelected = 0;
            //$scope.updateContactList();

            $scope.pagination.current = 0;
            $scope.updatePagination();

            $timeout(function() {
                window.contacts_scroller.update();
            });
        });

        $scope.updateContactList = function() {
            $scope.alphabetContacts = $filter('alphabetGroups')($scope.contacts, 'last_name', $scope.pagination.min - 1, $scope.pagination.max);
            $scope.importedCount = $scope.allContacts.filter(function(contact) {
                return contact.imported == true;
            }).length;
            $scope.systemCount = $scope.allContacts.length - $scope.importedCount;
        };

        $scope.selectAll = function(value) {
            $scope.currentContact = null;
            angular.forEach($scope.contacts, function(contact) {
                contact.selected = value;
            });
            $scope.countSelected = value ? $scope.contacts.length : 0;
        }

        $scope.$watch('selectedAll', $scope.selectAll);

        $scope.$watch('invite.entityId', function(newValue, oldValue) {
            var entity = inviteTypes[1];
            if (newValue == null) {
                $scope.invite.subject = '';
                $scope.invite.text = '';
            } else if (newValue !== oldValue) {
                var link = (newValue == -1) ?
                'user/id' + $scope.currentUserId :
                    (newValue == -2 ?
                    'company/id' + $scope.currentUserCompanyId :
                    'user/id' + $scope.currentUserId + '/projects/id' + newValue);

                switch (parseInt(newValue)) {
                    case -1:
                        entity = inviteTypes[1];
                        break;

                    case -2:
                        entity = inviteTypes[2];
                        break;

                    default:
                        entity = inviteTypes[3];
                        break;
                }
                $scope.invite.subject = 'Invitation to view ' + entity + ' on RealConnex';
                $scope.invite.text = 'I think you might be interested in checking out ' +
                '<a href=\'' + location.protocol + '//' + location.hostname + '/' + link + '\'>' + entity + '</a> on RealConnex';

                angular.element("div.nicEdit-main").html($scope.invite.text)
            }
        });

        $scope.$on('AddressBook.Main.OnImportComplete', function(e, data) {
            $scope.allContacts = angular.copy(data['contacts']);
            $scope.contacts = angular.copy($scope.allContacts);
            $scope.searchCache = angular.copy($scope.contacts);
            $scope.menu.selected = 'all';
        });

        var timeoutSearch = null;
        $scope.$watch('searchContact', function(newValue) {
            $timeout.cancel(timeoutSearch);
            timeoutSearch = $timeout(function() {
                var firstNameSearch = $filter('filter')($scope.searchCache, {'first_name': newValue}),
                    lastNameSearch = $filter('filter')($scope.searchCache, {'last_name': newValue});
                var result = angular.extend(firstNameSearch, lastNameSearch);
                $scope.contacts = result;
            }, 500);
        });

        $scope.selectContact = function(contact, checked) {
            if (angular.isDefined(checked)) {
                contact.selected = !contact.selected;
            }

            contact.selected ? $scope.countSelected++ : $scope.countSelected--;
            if ($scope.countSelected == 1) {
                $scope.contacts.forEach(function(contact) {
                    if (contact.selected == true)
                        return $scope.currentContact = contact;
                });
            } else
                $scope.currentContact = null;
        };

        // *** Popup edit contact ***
        $scope.edit = function(contact) {
            //        if (angular.isDefined(contact))
            $scope.isEdit = angular.isDefined(contact) ? true : false;
            $scope.editContact = angular.copy(contact);
            //            $scope.$apply();
            return true;
        };

        $scope.save = function() {
            addressesFactory.saveContact({}, {'data': {'Address': $scope.editContact}}).$promise.then(function(response) {
                var filteredContactIds = $scope.contacts.map(function(item) {
                    return item.id;
                });
                if (angular.isDefined(response.newContactId)) {
                    // Added contact
                    $scope.currentContact = null;
                    $scope.editContact.id = response.newContactId;
                    $scope.allContacts.push($scope.editContact);
                    if ($scope.menu.selected != 'group' && $scope.menu.selected != 'imported')
                        $scope.contacts.push($scope.editContact);
                    $scope.$emit('notify', {text: 'Contact successfully created'});
                } else {
                    // Saved contact
                    $scope.contacts[filteredContactIds.indexOf($scope.editContact.id)] = angular.copy($scope.editContact);
                    $scope.currentContact = angular.copy($scope.editContact);
                }

                // Update all contact according to changes
                angular.forEach($scope.allContacts, function(value, key) {
                    var filterId = filteredContactIds.indexOf(value.id);
                    if (filterId >= 0) {
                        $scope.allContacts[key] = angular.copy($scope.contacts[filterId]);
                        delete $scope.allContacts[key]['selected'];
                    }
                });

                //Update current contacts list
                $scope.updateContactList();

                if (response.error)
                    $scope.$emit('notify', {text: response.errorDesc});
            });
            angular.element.fancybox.close();
        };

        $scope.view = function(contact) {
            $scope.currentContact = contact;
        };

        $scope.back = function() {
            $scope.currentContact = null;
        };

        // *** Groups
        $scope.createGroup = function(text) {
            if (text.length > 0) {
                addressesFactory.createGroup({}, {
                    'data': {
                        'AddressGroup': {'title': text}
                    }
                }).$promise.then(function(response) {

                        $scope.groups.push({
                            'AddressGroup': response['AddressGroup'],
                            'Address': []
                        });

                        if (response.error)
                            $scope.$emit('notify', {text: response.errorDesc});
                        else
                            $scope.$emit('notify', {text: 'Group successfully created'});
                    });
                // After create new group unhidelist
                $scope.isShowGroupList = true;
            }
        };

        $scope.addToGroup = function(group, data) {
            if (angular.isDefined(data['Address']))
                return; //Trying to add group
            var contact = data;
            group['Address'] = group['Address'] || [];

            // Contacts id's for current group
            var groupContactIds = group['Address'].map(function(item) {
                    return item.id;
                }),
            // All group id's
                groupIds = $scope.groups.map(function(item) {
                    return item['AddressGroup']['id'];
                });

            if (groupContactIds.indexOf(contact.id) < 0) {
                groupContactIds.push(contact.id);
                group['Address'].push(contact);

                // Update group in group list
                var indx = groupIds.indexOf(group['AddressGroup']['id']);
                $scope.groups[indx] = group;

                addressesFactory.editGroup({
                    'data': {
                        'AddressGroup': group['AddressGroup'],
                        // For save needs only Id's
                        'Address': groupContactIds
                    }
                }).$promise.then(function(response) {
                        if (response.error)
                            $scope.$emit('notify', {text: response.errorDesc});
                        else
                            $scope.$emit('notify', {text: 'Contact "' + contact.first_name + '" added to group'});
                    });
            } else {
                $scope.$emit('notify', {text: 'Contact "' + contact.first_name + '" already in group'});
            }
        };

        $scope.removeGroup = function(group) {
            $scope.confirm('Confirmation Needed', 'Group "' + group['AddressGroup']['title'] + '" will be deleted. Continue?', function() {
                addressesFactory.deleteGroup({'data': {'id': group['AddressGroup']['id']}}).$promise.then(function(response) {
                    if (response.error)
                        $scope.$emit('notify', {text: response.errorDesc});
                    else {
                        $scope.groups = $scope.groups.filter(function(item) {
                            return item['AddressGroup']['id'] != group['AddressGroup']['id'];
                        });
                        $scope.$emit('notify', {text: 'Group has deleted!'});
                    }
                });
            });
        };

        $scope.viewGroupContacts = function(group) {
            $scope.menu.selected = 'group';
            $scope.currentGroup = group;
            var contactIds = group['Address'].map(function(item) {
                return item.id;
            });
            var contacts = $scope.allContacts.filter(function(value) {
                return contactIds.indexOf(value.id) >= 0;
            });
            //            angular.forEach($scope.allContacts, function(value) {
            //                if (contactIds.indexOf(value.id) >= 0)
            //                    contacts.push(value);
            //            });
            $scope.contacts = angular.copy(contacts);
            $scope.searchCache = angular.copy($scope.contacts);
            $scope.searchContact = '';
        };

        $scope.viewImportedContacts = function() {
            $scope.menu.selected = 'imported';
            $scope.currentGroup = null;
            $scope.contacts = angular.copy($scope.allContacts.filter(function(contact) {
                return contact.imported == true;
            }));
        };

        $scope.viewMyNetworkContacts = function() {
            $scope.menu.selected = 'myNetwork';
            $scope.currentGroup = null;
            $scope.contacts = angular.copy($scope.allContacts.filter(function(contact) {
                return contact.imported != true;
            }));
        };

        $scope.viewAllContacts = function() {
            $scope.menu.selected = 'all';
            $scope.currentGroup = null;
            $scope.contacts = angular.copy($scope.allContacts);
            $scope.searchCache = angular.copy($scope.contacts);
            $scope.searchContact = '';
        };

        // *** Batch operations
        $scope.deleteSelected = function() {
            var newContacts = [],
                checkedIds = [];
            angular.forEach($scope.contacts, function(contact) {
                if (angular.isDefined(contact.selected) && contact.selected) {
                    checkedIds.push(contact.id);
                } else {
                    newContacts.push(contact);
                }
            });
            if (checkedIds.length) {
                if ($scope.currentGroup) {
                    // All group id's
                    var groupIds = $scope.groups.map(function(item) {
                        return item['AddressGroup']['id'];
                    });
                    // Delete selected contacts from CURRENT GROUP
                    $scope.confirm('Confirmation Needed', 'Contacts will be deleted from group. Continue?', function() {
                        $scope.currentGroup['Address'] = angular.copy(newContacts);
                        // Update group in group list
                        var indx = groupIds.indexOf($scope.currentGroup['AddressGroup']['id']);
                        $scope.groups[indx] = $scope.currentGroup;
                        // Save to server
                        addressesFactory.editGroup({
                            'data': {
                                'AddressGroup': $scope.currentGroup['AddressGroup'],
                                // For save needs only Id's
                                'Address': newContacts.map(function(item) {
                                    return item.id;
                                })
                            }
                        }).$promise.then(function(response) {
                                if (response.error)
                                    $scope.$emit('notify', {text: response.errorDesc});
                                else
                                    $scope.$emit('notify', {text: 'Contacts deleted from group'});
                            });
                        // Change contacts to initiate change event
                        $scope.contacts = angular.copy(newContacts);
                        $scope.$apply();
                    });
                } else {
                    // Delete selected contacts from ADDRESS BOOK
                    $scope.deleteFromAddressBook(checkedIds);
                }
            }
        };

        $scope.deleteFromAddressBook = function(checkedIds) {
            $scope.confirm('Confirmation Needed', 'Contacts will be deleted. Continue?', function() {
                addressesFactory.deleteContacts({'contactIds': checkedIds}).$promise.then(function(response) {
                    if (!response.error) {
                        $scope.$emit('notify', {text: 'Contacts successfully deleted'});
                    }
                });
                $scope.currentContact = null;
                $scope.updateDeletedContacts(checkedIds);
            });
        };

        $scope.addSelectedToGroup = function(group) {
            // Contacts id's for current group
            var groupContactIds = group['Address'].map(function(item) {
                    return item.id;
                }),
            // All group id's
                groupIds = $scope.groups.map(function(item) {
                    return item['AddressGroup']['id'];
                }),
                isSelected = $scope.contacts.some(function(item) {
                    return item.selected;
                });

            if (isSelected) {
                // Adding contacts to list if not in list
                angular.forEach($scope.contacts, function(contact) {
                    if (angular.isDefined(contact.selected) && contact.selected) {
                        if (groupContactIds.indexOf(contact.id) < 0) {
                            groupContactIds.push(contact.id);
                            group['Address'].push(contact);
                        }
                    }
                });

                // Update group in group list
                var indx = groupIds.indexOf(group['AddressGroup']['id']);
                $scope.groups[indx] = group;

                // Save changes in server
                addressesFactory.editGroup({
                    'data': {
                        'AddressGroup': group['AddressGroup'],
                        // For save needs only Id's
                        'Address': groupContactIds
                    }
                }).$promise.then(function(response) {
                        if (response.error)
                            $scope.$emit('notify', {text: response.errorDesc});
                        else
                            $scope.$emit('notify', {text: 'Contacts added to group'});
                    });
            }
        };

        // *** Communicate list
        $scope.addToCommunicateList = function(data) {
            // Uncheck all selected
            angular.forEach($scope.contacts, function(contact) {
                contact.selected = false;
            });
            $scope.currentContact = null;
            $scope.countSelected = 0;

            var addedIds = $scope.communicateList.map(function(contact) {
                return contact.id;
            });
            if (angular.isDefined(data['Address'])) {
                // Add contacts from group
                angular.forEach(data['Address'], function(contact) {
                    if (addedIds.indexOf(contact.id) < 0)
                        $scope.communicateList.push(contact);
                });
            } else {
                // Add contact
                if (addedIds.indexOf(data.id) < 0)
                    $scope.communicateList.push(data);
                else
                    $scope.$emit('notify', {text: 'Contact \'' + data.first_name + ' ' + data.last_name + '\' already in communicate list'});
            }
        };

        $scope.removeFromCommunicateList = function(contact) {
            $scope.communicateList = $scope.communicateList.filter(function(value) {
                return value.id != contact.id;
            });
        };

        $scope.deleteCommunicateSelectedFromAddressBook = function() {

            if ($scope.countSelected > 0)
                $scope.deleteSelected();
            else
                $scope.deleteFromAddressBook($scope.communicateList.map(function(contact) {
                    return contact.id;
                }));
        };

        $scope.addCommunicateListToGroup = function(group) {
            var contacts;
            if ($scope.countSelected > 0) {
                contacts = $scope.contacts.filter(function(contact) {
                    return contact.selected;
                });
            } else {
                contacts = angular.copy($scope.communicateList);
            }

            if (contacts) {
                // Contacts id's for current group
                var groupContactIds = group['Address'].map(function(item) {
                        return item.id;
                    }),
                // All group id's
                    groupIds = $scope.groups.map(function(item) {
                        return item['AddressGroup']['id'];
                    });
                // Adding contacts to list if not in list
                angular.forEach(contacts, function(contact) {
                    if (groupContactIds.indexOf(contact.id) < 0) {
                        groupContactIds.push(contact.id);
                        group['Address'].push(contact);
                    }
                });

                // Update group in group list
                var indx = groupIds.indexOf(group['AddressGroup']['id']);
                $scope.groups[indx] = group;
                if ($scope.currentGroup)
                    $scope.viewGroupContacts(group);

                // Save changes in server
                addressesFactory.editGroup({
                    'data': {
                        'AddressGroup': group['AddressGroup'],
                        // For save needs only Id's
                        'Address': groupContactIds
                    }
                }).$promise.then(function(response) {
                        if (response.error)
                            $scope.$emit('notify', {text: response.errorDesc});
                        else
                            $scope.$emit('notify', {text: 'Contacts added to group'});
                    });
            }
        };

        $scope.updateDeletedContacts = function(ids) {
            // It's necessary if contacts was changed (ex: some items was deleted)

            // *** Update contacts in communicate section
            $scope.communicateList = $scope.communicateList.filter(function(contact) {
                return ids.indexOf(contact.id) < 0;
            });

            // *** Update contacts in group section
            angular.forEach($scope.groups, function(group, key) {
                $scope.groups[key]['Address'] = $scope.groups[key]['Address'].filter(function(contact) {
                    return ids.indexOf(contact.id) < 0;
                });
            });

            // *** Update current contacts
            $scope.contacts = $scope.contacts.filter(function(contact) {
                return ids.indexOf(contact.id) < 0;
            });

            // *** Update all contacts
            $scope.allContacts = $scope.allContacts.filter(function(contact) {
                return ids.indexOf(contact.id) < 0;
            });

            $scope.$apply();
        };
        // *** Send mail
        $scope.sendMailToCommunicate = function() {
            $scope.preview = false;
            $scope.mail = {};
            if ($scope.countSelected > 0)
                $scope.mail.contacts = $scope.contacts.filter(function(contact) {
                    return contact.selected;
                });
            else
                $scope.mail.contacts = angular.copy($scope.communicateList);

            return true;
            if ($scope.mail.contacts.length) {
                $scope.$apply();
                return true;
            }
        };

        $scope.sendMailToSelected = function() {
            $scope.preview = false;
            $scope.mail = {};
            $scope.mail.contacts = $scope.contacts.filter(function(contact) {
                return contact.selected;
            });
            if ($scope.mail.contacts.length) {
                $scope.$apply();
                return true;
            }
        };

        $scope.sendMailToContact = function(contact) {
            $scope.preview = false;
            $scope.mail = {};
            $scope.mail.contacts = [];
            $scope.mail.contacts.push(contact);
            $scope.$apply();

            return true;
        };

        $scope.sendMail = function() {
            //$scope.confirm('Confirmation needed.', 'Message will be sent to their recipients. Continue?', function() {
            $http.post('/address-book/sendGroupMessage', {data: {'MessageSystem': $scope.mail}}).success(function(response) {
                if (response.error == false) {
                    $scope.mail = {};
                    $scope.$emit('notify', {text: 'Message was sent'});
                } else {
                    $scope.$emit('notify', {text: response.errorDesc});
                }
            });
            $scope.selectAll(false);
            angular.element.fancybox.close();
            //});
        };

        $scope.inviteContacts = function() {
            if (angular.isUndefined($scope.invite.entityId) || $scope.invite.entityId == null) {
                return;
            }
            //$scope.confirm('Confirmation needed.', 'Invitation will be sent to their recipients. Continue?', function() {
            $scope.invite.text = angular.element("div.nicEdit-main").html();
            $http.post('/address-book/sendGroupMessage', {data: {'MessageSystem': $scope.invite}}).success(function(response) {
                if (response.error == false) {
                    $scope.invite = {};
                    $scope.$emit('notify', {text: 'Message was sent'});
                } else {
                    $scope.$emit('notify', {text: response.errorDesc});
                }
            });
            angular.element.fancybox.close();
            //});
        };

        $scope.inviteUploadFile = function() {
            angular.element('#addFileToInvite').trigger('click');
        };

        $scope.uploadFile = function() {
            angular.element('#addFileToMail').trigger('click');
        };

        $scope.uploadPhoto = function() {
            angular.element('#uploadContactPhoto').trigger('click');
        };

        $scope.removeFromMailList = function(contact) {
            $scope.mail.contacts = $scope.mail.contacts.filter(function(value) {
                return value.id != contact.id;
            });
        };
        // *** Invite communicate contacts
        $scope.inviteSelected = function() {
            $scope.preview = false;
            $scope.invite = {};
            $scope.invite.contacts = $scope.contacts.filter(function(contact) {
                return contact.selected;
            });
            if ($scope.invite.contacts.length) {
                $scope.$apply();
                return true;
            }
        };

        $scope.inviteCommunicate = function() {
            $scope.preview = false;
            $scope.invite = {};
            if ($scope.countSelected > 0)
                $scope.invite.contacts = $scope.contacts.filter(function(contact) {
                    return contact.selected;
                });
            else
                $scope.invite.contacts = angular.copy($scope.communicateList);

            if ($scope.invite.contacts.length) {
                $scope.$apply();
                return true;
            }
        };

        $scope.removeFromInviteList = function(contact) {
            $scope.invite.contacts = $scope.invite.contacts.filter(function(value) {
                return value.id != contact.id;
            });
        };

        $scope.switchPage = function(step) {
            if ((($scope.pagination.current + step) * $scope.pagination.itemsPerPage) >= $scope.contacts.length)
                return;
            else if ($scope.pagination.current + step < 0)
                return;
            $scope.pagination.current += step;
            $scope.updatePagination();
        };

        $scope.updatePagination = function() {
            if (angular.isDefined($scope.contacts)) {
                $scope.pagination.min = $scope.pagination.current * $scope.pagination.itemsPerPage + 1;
                $scope.pagination.max = $scope.pagination.min + $scope.pagination.itemsPerPage - 1;
                $scope.pagination.max = $scope.pagination.max > $scope.contacts.length ? $scope.contacts.length : $scope.pagination.max;
                $scope.updateContactList();
            }
        };
        // *** Preview
        $scope.previewMessage = function() {
            $scope.mail.contactNames = $scope.mail.contacts.map(function(value) {
                return {'contactName': value.first_name + ' ' + value.last_name};
            });
            $scope.mail.text = angular.element("div.nicEdit-main").html();
            $scope.previewText = $scope.mail.text;

            if (angular.isDefined($scope.mail.files) && $scope.mail.files.length > 0) {
                $scope.previewText += '<br><br>Attached files:';
                $scope.mail.files.forEach(function(file) {
                    $scope.previewText += '<br>';
                    $scope.previewText += $scope.mail.isEmbed
                        ? '<img src="' + file.fileUrl + '"/>'
                        : '<a href="' + file.fileUrl + '">' + file.fileName + '</a>';
                });
            }
            $scope.preview = true;
        };

        $scope.previewInvite = function() {
            $scope.invite.contactNames = $scope.invite.contacts.map(function(value) {
                return {'contactName': value.first_name + ' ' + value.last_name};
            });
            $scope.invite.text = angular.element("div.nicEdit-main").html();
            $scope.previewText = $scope.invite.text;

            if (angular.isDefined($scope.invite.files) && $scope.invite.files.length > 0) {
                $scope.previewText += '<br><br>Attached files:';
                $scope.invite.files.forEach(function(file) {
                    $scope.previewText += '<br>';
                    $scope.previewText += $scope.invite.isEmbed
                        ? '<img src="' + file.fileUrl + '"/>'
                        : '<a href="' + file.fileUrl + '">' + file.fileName + '</a>';
                });
            }
            $scope.preview = true;
        };

        $scope.hidePreview = function() {
            $scope.preview = false;
        };

        $scope.isPreview = function() {
            return $scope.preview;
        };

        (function() {

            var settingsForInvite = {
                uploadBtn: 'addFileToInvite',
                uploadPhotoUrl: '/address-book/uploadFile'
            };

            var settingsForMessage = {
                uploadBtn: 'addFileToMail',
                uploadPhotoUrl: '/address-book/uploadFile'
            };

            var settingsForContact = {
                uploadBtn: 'uploadContactPhoto',
                uploadPhotoUrl: '/address-book/uploadPhoto'
            };


            uploaderService.uploaderInit(function(resObj) {
                $scope.invite.files = $scope.invite.files || [];
                $scope.invite.files.push(resObj);
                $scope.$digest();
            }, settingsForInvite);

            uploaderService.uploaderInit(function(resObj) {
                $scope.mail.files = $scope.mail.files || [];
                $scope.mail.files.push(resObj);
                $scope.$digest();
            }, settingsForMessage);

            uploaderService.init(function(resObj) {
                $scope.editContact.photo = resObj;
                $scope.$digest();
            }, settingsForContact);
        })();
    }
]);


/* Address.Share */
angular.module('app').controller('AddressBook.Profile', [
    '$scope',
    '$http',
    '$timeout',
    'addressesFactory',
    'uploaderService',
    function($scope, $http, $timeout, addressesFactory, uploaderService) {

        $scope.mail = {};

        $scope.currentUserId = window.currentUserId;
        $scope.contacts = [];
        $scope.mail = {
            contacts: [],
            files: [],
            text: '',
            subject: ''
        };

        $scope.$watch('mail.selectedContact', function(newVal) {
            var addedIds = $scope.mail.contacts.map(function(contact) {
                return contact.id;
            });
            if (newVal) {
                var contact = newVal.originalObject;
                if (addedIds.indexOf(contact.id) < 0)
                    $scope.mail.contacts.push(contact);
                else
                    $scope.$emit('notify', {text: 'Contact \'' + contact.first_name + ' ' + contact.last_name + '\' already in mail list'});
            }
        });

        $scope.uploadFile = function() {
            angular.element('#addFileToMail').trigger('click');
        };

        $scope.removeFromMailList = function(contact) {
            $scope.mail.contacts = $scope.mail.contacts.filter(function(value) {
                return value.id != contact.id;
            });
        };

        $scope.sendMail = function() {
            $scope.mail.text = angular.element("div.nicEdit-main").html();
            $http.post('/address-book/sendGroupMessage', {data: {'MessageSystem': $scope.mail}}).success(function(response) {
                if (response.error == false) {
                    $scope.mail.contacts = [];
                    $scope.mail.text = null;
                    $scope.mail.selectedContact = null;
                    $scope.mail.subject = null;
                    $scope.mail.files = null;
                    $scope.$emit('notify', {text: 'Message was sent'});
                } else {
                    $scope.$emit('notify', {text: response.errorDesc});
                }
            });
            angular.element.fancybox.close();
        };

        $scope.mail.subject = 'I think you might be interested in this profile on RealConnex';

        $scope.initNicEdit=function(){
            var link ='user/id' + $scope.currentUserId;

            $scope.mail.text = 'I think you might be interested in this profile on RealConnex: ' +
            '<a href=\'' + location.protocol + '//' + location.hostname + '/' + link + '\'' + '>link to profile</a><br>' +
            'RealConnex is the online marketplace for real estate professional where you can find all' +
            ' the people necessary to close your deal.';
            angular.element('div.nicEdit-main').html($scope.mail.text);
            return true;
        };

        (function() {
            var settingsForMessage = {
                uploadBtn: 'addFileToMail',
                uploadPhotoUrl: '/address-book/uploadFile'
            };
            uploaderService.uploaderInit(function(resObj) {
                $scope.mail.files = $scope.mail.files || [];
                $scope.mail.files.push(resObj);
                $scope.$digest();
            }, settingsForMessage);
        })();
    }
]);

/* Company.Share */
angular.module('app').controller('AddressBook.Company', [
    '$scope',
    '$http',
    'addressesFactory',
    'uploaderService',
    function($scope, $http, addressesFactory, uploaderService) {

        $scope.mail = {};

        $scope.currentUserId = window.companyId;
        $scope.contacts = [];
        $scope.mail = {
            contacts: [],
            files: [],
            text: '',
            subject: ''
        };

        $scope.$watch('mail.selectedContact', function(newVal) {
            var addedIds = $scope.mail.contacts.map(function(contact) {
                return contact.id;
            });
            if (newVal) {
                var contact = newVal.originalObject;
                if (addedIds.indexOf(contact.id) < 0)
                    $scope.mail.contacts.push(contact);
                else
                    $scope.$emit('notify', {text: 'Contact \'' + contact.first_name + ' ' + contact.last_name + '\' already in mail list'});
            }
        });

        $scope.uploadFile = function() {
            angular.element('#addFileToMail').trigger('click');
        };

        $scope.removeFromMailList = function(contact) {
            $scope.mail.contacts = $scope.mail.contacts.filter(function(value) {
                return value.id != contact.id;
            });
        };

        $scope.sendMail = function() {
            $scope.mail.text = angular.element("div.nicEdit-main").html();
            $http.post('/address-book/sendGroupMessage', {data: {'MessageSystem': $scope.mail}}).success(function(response) {
                if (response.error == false) {
                    $scope.mail.contacts = [];
                    $scope.mail.text = null;
                    $scope.mail.selectedContact = null;
                    $scope.mail.subject = null;
                    $scope.mail.files = null;
                    $scope.$emit('notify', {text: 'Message was sent'});
                } else {
                    $scope.$emit('notify', {text: response.errorDesc});
                }
            });
            angular.element.fancybox.close();
        };


        $scope.mail.subject = 'I think you might be interested in this company on RealConnex';

        $scope.initNicEdit=function(){
            var link ='user/id' + $scope.currentUserId;

            $scope.mail.text = 'I think you might be interested in this company on RealConnex: ' +
            '<a href=\'' + location.protocol + '//' + location.hostname + '/' + link + '\'' + '>link to company</a><br>' +
            'RealConnex is the online marketplace for real estate professional where you can find all' +
            ' the people necessary to close your deal.';
            angular.element('div.nicEdit-main').html($scope.mail.text);
            return true;
        };


        (function() {
            var settingsForMessage = {
                uploadBtn: 'addFileToMail',
                uploadPhotoUrl: '/address-book/uploadFile'
            };
            uploaderService.uploaderInit(function(resObj) {
                $scope.mail.files = $scope.mail.files || [];
                $scope.mail.files.push(resObj);
                $scope.$digest();
            }, settingsForMessage);
        })();
    }
]);

/* Project.Share */
angular.module('app').controller('AddressBook.Project', [
    '$scope',
    '$http',
    'addressesFactory',
    'uploaderService',
    function($scope, $http, addressesFactory, uploaderService) {

        $scope.mail = {};

        $scope.currentUserId = window.currentUserId;
        $scope.currentProjectId = window.currentProjectId;
        $scope.contacts = [];
        $scope.mail = {
            contacts: [],
            files: [],
            text: '',
            subject: ''
        };

        $scope.$watch('mail.selectedContact', function(newVal) {
            var addedIds = $scope.mail.contacts.map(function(contact) {
                return contact.id;
            });
            if (newVal) {
                var contact = newVal.originalObject;
                if (addedIds.indexOf(contact.id) < 0)
                    $scope.mail.contacts.push(contact);
                else
                    $scope.$emit('notify', {text: 'Contact \'' + contact.first_name + ' ' + contact.last_name + '\' already in mail list'});
            }
        });

        $scope.uploadFile = function() {
            angular.element('#addFileToMail').trigger('click');
        };

        $scope.removeFromMailList = function(contact) {
            $scope.mail.contacts = $scope.mail.contacts.filter(function(value) {
                return value.id != contact.id;
            });
        };

        $scope.sendMail = function() {
            $scope.mail.text = angular.element("div.nicEdit-main").html();
            $http.post('/address-book/sendGroupMessage', {data: {'MessageSystem': $scope.mail}}).success(function(response) {
                if (response.error == false) {
                    $scope.mail.contacts = [];
                    $scope.mail.text = null;
                    $scope.mail.selectedContact = null;
                    $scope.mail.subject = null;
                    $scope.mail.files = null;
                    $scope.$emit('notify', {text: 'Message was sent'});
                } else {
                    $scope.$emit('notify', {text: response.errorDesc});
                }
            });
            angular.element.fancybox.close();
        };

        $scope.mail.subject = 'I think you might be interested in this post on RealConnex';

        $scope.initNicEdit=function(){
            var link ='user/id' + $scope.currentUserId +'/projects/id' + $scope.currentProjectId;
            $scope.mail.text = 'I think you might be interested in this post on RealConnex: ' +
            '<a href=\'' + location.protocol + '//' + location.hostname + '/' + link + '\'' + '>link to post</a><br>' +
            'RealConnex is the online marketplace for real estate professional where you can find all' +
            ' the people necessary to close your deal.';
            angular.element('div.nicEdit-main').html($scope.mail.text);
            return true;
        };
        (function() {
            var settingsForMessage = {
                uploadBtn: 'addFileToMail',
                uploadPhotoUrl: '/address-book/uploadFile'
            };
            uploaderService.uploaderInit(function(resObj) {
                $scope.mail.files = $scope.mail.files || [];
                $scope.mail.files.push(resObj);
                $scope.$digest();
            }, settingsForMessage);
        })();
    }
]);
