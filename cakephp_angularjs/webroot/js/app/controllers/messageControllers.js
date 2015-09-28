angular.module('app').controller('CompanyProfile.Messages', [
    '$scope',
    '$filter',
    '$sce',
    '$http',
    '$q',
    '$timeout',
    'messagesFactory',
    'addressesFactory',
    'uploaderService',
    function($scope, $filter, $sce, $http, $q, $timeout, messagesFactory, addressesFactory, uploaderService) {

        $scope.contacts = {
            'list': []
        };
        $scope.pagination = {
            'pages': 0,
            'current': 0,
            'itemsPerPage': 10
        };
        $scope.mail = {
            contacts: [],
            files: [],
            text: '',
            subject: ''
        };
        $scope.myID = currentUserId;
        $scope.inboxMessages = [];
        $scope.outboxMessages = [];
        $scope.tabs = {inBox: 1, outBox: 0};
        $scope.showReply = 0;
        $scope.currentMessage = null;
        $scope.isCheckedAll = false;
        $scope.countChecked = 0;
        $scope.searchMessage = '';

        messagesFactory.inbox().$promise.then(function(response) {
            $scope.inboxMessages = response;
            $scope.getInBox();
        });

        messagesFactory.outbox().$promise.then(function(response) {
            $scope.outboxMessages = response;
        });

        addressesFactory.getAllContacts().$promise.then(function(response) {
            $scope.contacts.list = response.contacts;
        });

        $scope.messageChecked = function(message) {
            $scope.countChecked += message.checked ? 1 : -1;
            $scope.isCheckedAll = false;
        };

        $scope.toggleAll = function(checked) {
            $scope.messages.forEach(function(message) {
                message.checked = checked;
            });
            $scope.countChecked = checked ? $scope.messages.length : 0;
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

        var timeoutSearch = null;
        $scope.$watch('searchMessage', function(newValue) {
            $timeout.cancel(timeoutSearch);
            if (angular.isDefined(newValue))
                timeoutSearch = $timeout(function() {
                    var search = newValue.toLocaleLowerCase();

                    if (search.length > 0) {
                        $scope.messages = $filter('filter')($scope.searchCache, function(val) {
                            var needles = search.split(' ');
                            var matchCount = 0;
                            needles.forEach(function(needle) {
                                    // Search message if only needle is not empty
                                    if (needle.length > 0) {
                                        if ((val['Receiver']['first_name'].toLowerCase().indexOf(needle) >= 0 ||
                                            val['Receiver']['last_name'].toLowerCase().indexOf(needle) >= 0 ||
                                            val['Sender']['first_name'].toLowerCase().indexOf(needle) >= 0 ||
                                            val['Sender']['last_name'].toLowerCase().indexOf(needle) >= 0 ||
                                            val['Message']['text'].toLowerCase().indexOf(needle) >= 0 ||
                                            val['Message']['subject'].toLowerCase().indexOf(needle) >= 0)) {
                                            matchCount++;
                                        }
                                    } else {
                                        matchCount++;
                                    }
                                }
                            );
                            if (matchCount == needles.length)
                                return true;
                        });
                    }
                    else {
                        $scope.messages = $scope.searchCache;
                    }

                    $scope.updatePagination();
                    $scope.$apply();
                }, 500);
        });

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

        $scope.uploadFile = function() {
            angular.element('#messages_addFileToMail').trigger('click');
        };

        $scope.initCheckbox = function() {
            $('.check').Custom({
                customStyleClass: 'checkbox',
                customHeight: '17',
                enableHover: false
            });
        };

        $scope.getInBox = function() {
            $scope.currentMessage = null;
            $scope.tabs = {inBox: 1, outBox: 0};
            $scope.messages = $scope.inboxMessages;
            $scope.searchCache = angular.copy($scope.messages);
            $scope.pagination.current = 0;
            $scope.updatePagination();
            $scope.countChecked = 0;
            $scope.isCheckedAll = false;
            $scope.toggleAll(false);
        };

        $scope.getOutBox = function() {
            $scope.messages = $scope.outboxMessages;
            $scope.searchCache = angular.copy($scope.messages);
            $scope.tabs = {inBox: 0, outBox: 1};
            $scope.currentMessage = null;
            $scope.pagination.current = 0;
            $scope.updatePagination();

            $scope.countChecked = 0;
            $scope.isCheckedAll = false;

            $scope.toggleAll(false);
        };

        $scope.switchPage = function(step) {
            if ((($scope.pagination.current + step) * $scope.pagination.itemsPerPage) >= $scope.messages.length)
                return;
            else if ($scope.pagination.current + step < 0)
                return;
            $scope.pagination.current += step;
            $scope.updatePagination();
        };

        $scope.updatePagination = function() {
            if (angular.isDefined($scope.messages)) {
                $scope.pagination.min = $scope.pagination.current * $scope.pagination.itemsPerPage + 1;
                $scope.pagination.max = $scope.pagination.min + $scope.pagination.itemsPerPage - 1;
                $scope.pagination.max = $scope.pagination.max > $scope.messages.length ? $scope.messages.length : $scope.pagination.max;
            }
        };

        $scope.refresh = function() {
            $scope.messages = $scope.tabs.inBox ?
                messagesFactory.inbox() : messagesFactory.outbox();
        };

        $scope.openMessage = function(messageId, message) {
            $scope.currentMessage = messagesFactory.open({id: messageId});
            $scope.currentMessage.$promise.then(function() {
                message.Message.viewed = true;
                $scope.replyForm.subject = 'Re: ' + $scope.currentMessage.Message.subject;
                if ($scope.currentMessage.Sender.id != $scope.myID) {
                    $scope.showReply = 1;
                } else {
                    $scope.showReply = 0;
                }
            });

            message.Message.viewed = true;
        };

        $scope.delete = function(message) {
            if (message) {
                messagesFactory.delete({id: message.Message.id, action: 'deleteItemsMsg'});
                $scope.messages.splice($scope.messages.indexOf(message), 1);
                $scope.currentMessage = null;
            } else {
                var messageIds = [],
                    filteredMessages = [];
                $scope.messages.forEach(function(message) {
                    if (message.checked) {
                        messageIds.push(message['Message']['id']);
                    } else {
                        filteredMessages.push(message);
                    }
                });
                if (messageIds.length > 0) {
                    $scope.confirm('Confirmation Needed', 'Are you sure you want to delete these messages?', function() {
                        $scope.$apply(function() {
                            $scope.messages = angular.copy(filteredMessages);

                            if ($scope.tabs.inBox) {
                                $scope.inboxMessages = $scope.inboxMessages.filter(function(item) {
                                    return messageIds.indexOf(item['Message']['id']) < 0;
                                });
                                $scope.searchCache = angular.copy($scope.inboxMessages);
                            }
                            else if ($scope.tabs.outBox) {
                                $scope.outboxMessages = $scope.outboxMessages.filter(function(item) {
                                    return messageIds.indexOf(item['Message']['id']) < 0;
                                });
                                $scope.searchCache = angular.copy($scope.outboxMessages);
                            }
                            $scope.isCheckedAll = false;
                            $scope.countChecked = 0;
                            $scope.updatePagination();
                        });

                        angular.forEach(messageIds, function(e) {
                            messagesFactory.delete({id: e, action: 'deleteItemsMsg'});
                        });
                    });
                }
            }
        };

        $scope.reply = function(messageId) {
            var data = $('#MessageSystemForm').serialize();
            if (!$scope.replyForm.$invalid) {
                $.post('/messages/sendMessage', data, function(res) {
                    $('#MessageSystemForm')[0].reset();
                    $('.fancybox-close').click();
                }, 'json');
            }
        };

        $scope.select = function(type) {
            switch (type) {
                case 'all':
                    angular.forEach($scope.messages, function(e) {
                        e.checked = true
                    });
                    break;

                case 'none':
                    angular.forEach($scope.messages, function(e) {
                        e.checked = false
                    });
                    break;

                case 'read':
                    angular.forEach($scope.messages, function(e) {
                        e.checked = e.Message.viewed === true;
                    });
                    break;

                case 'unread':
                    angular.forEach($scope.messages, function(e) {
                        e.checked = e.Message.viewed === false;
                    });
                    break;
            }

            setTimeout(function() {
                $('#triggerCheck').trigger('change');
            }, 100);

        };

        $scope.toHtml = function(html_code) {
            html_code = html_code.replace(/\n/g, '<br/>');
            return $sce.trustAsHtml(html_code);
        };

        $scope.back = function() {
            $scope.currentMessage = null;
        };

        (function() {
            var settingsForMessage = {
                uploadBtn: 'messages_addFileToMail',
                uploadPhotoUrl: '/address-book/uploadFile'
            };
            uploaderService.uploaderInit(function(resObj) {
                $scope.mail.files = $scope.mail.files || [];
                $scope.mail.files.push(resObj);
                $scope.$digest();
            }, settingsForMessage);
        })();
    }]);
