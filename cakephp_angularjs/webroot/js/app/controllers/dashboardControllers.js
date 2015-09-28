var App = angular.module('app');

App.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: '/js/templates/dashboard/allDashboard.htm',
            controller: 'DashboardController'
        }).
        when('/projects', {
            templateUrl: '/js/templates/dashboard/projectsDash.htm',
            controller: 'ProjectsController'
        }).
        when('/companies', {
            templateUrl: '/js/templates/dashboard/companiesDash.htm',
            controller: 'CompaniesController'
        }).
        when('/tabs/:id', {
            templateUrl: '/js/templates/dashboard/profileDashboard.htm',
            controller: 'TabsInnerController',
            resolve: {
                delay: function($q, $timeout) {
                    var delay = $q.defer();
                    $timeout(delay.resolve, 300);
                    return delay.promise;
                }
            }
        }).
        when('/tabs/:id/:tab', {
            templateUrl: '/js/templates/dashboard/profileDashboard.htm',
            controller: 'TabsInnerController',
            resolve: {
                delay: function($q, $timeout) {
                    var delay = $q.defer();
                    $timeout(delay.resolve, 100);
                    return delay.promise;
                }
            }
        }).
        when('/myCompany/:id', {
            templateUrl: '/js/templates/dashboard/companyInner.htm',
            controller: 'CompanyInnerController',
            resolve: {
                delay: function($q, $timeout) {
                    var delay = $q.defer();
                    $timeout(delay.resolve, 300);
                    return delay.promise;
                }
            }
        }).
        when('/myCompany/:id/:tab', {
            templateUrl: '/js/templates/dashboard/companyInner.htm',
            controller: 'CompanyInnerController',
            resolve: {
                delay: function($q, $timeout) {
                    var delay = $q.defer();
                    $timeout(delay.resolve, 300);
                    return delay.promise;
                }
            }
        }).
        when('/myProject/:id', {
            templateUrl: '/js/templates/dashboard/projectInner.htm',
            controller: 'ProjectInnerController',
            resolve: {
                delay: function($q, $timeout) {
                    var delay = $q.defer();
                    $timeout(delay.resolve, 300);
                    return delay.promise;
                }
            }
        }).
        when('/myProject/:id/:tab', {
            templateUrl: '/js/templates/dashboard/projectInner.htm',
            controller: 'ProjectInnerController',
            resolve: {
                delay: function($q, $timeout) {
                    var delay = $q.defer();
                    $timeout(delay.resolve, 300);
                    return delay.promise;
                }
            }
        }).
        otherwise({
            redirectTo: '/'
        });
}]);

App.controller('DashboardController', ['$scope', '$http', function($scope, $http) {
    $scope.global = {
        companyExist: companyExist
    };
    $scope.currentTab = '/js/templates/dashboard/tabs/mainDashboard.htm';
    $http.post('/dashboard/allDashboard').success(function(response) {
        if (response.error === false) {

            $scope.data = response.data;

            $scope.dataRoomsActivitiesCount = 0;
            $scope.lighthouseActivitiesCount = 0;
            $scope.savedSearchActivitiesCount = 0;

            angular.forEach($scope.data, function(elem) {
                if (typeof elem.features.dataRooms !== 'undefined') {
                    $scope.dataRoomsActivitiesCount += elem.features.dataRooms;
                }

                if (typeof elem.features.lighthouse !== 'undefined') {
                    $scope.lighthouseActivitiesCount += elem.features.lighthouse;
                }

                if (typeof elem.features.savedSearch !== 'undefined') {
                    $scope.savedSearchActivitiesCount += elem.features.savedSearch;
                }
            });

            //$('#companyProgress').progressbar({value: $scope.data.Company.profile_completeness});
            $('#userProgress').progressbar({value: $scope.data.Me.profile_completeness});

        }
    });

    $scope.go = function(path) {
        window.location.replace(path);
    };
}]);

App.controller('TabsController', ['$scope', function($scope) {

    if ($scope.roomsActivity) {
        $scope.dataRoomsTab = '/js/templates/dashboard/tabs/dataRoomsActivity.htm';
    } else {
        $scope.dataRoomsTab = '/js/templates/dashboard/tabs/noDataRoomActivity.htm';
    }

    if ($scope.activityFeed) {
        $scope.activityFeedTab = '/js/templates/dashboard/tabs/activityFeed.htm';
    } else {
        $scope.activityFeedTab = '/js/templates/dashboard/tabs/noFeed.htm';
    }

    $scope.currentTab = $scope.activityFeedTab;

    $scope.onClickTab = function(tab) {
        $scope.currentTab = tab;
    };

    $scope.isActiveTab = function(tabUrl) {
        return tabUrl == $scope.currentTab;
    };

}]);

App.controller('ProjectsController', ['$scope', '$http', 'projectsFactory', 'searchTemplatesProvider', function($scope, $http, projectsFactory, searchTemplatesProvider) {
    $scope.loop = 0;
    $scope.isNext = true;
    $scope.isPrev = false;

    $scope.dataRoomNotificationsCount = 0;
    $scope.lighthouseNotificationsCount = 0;
    $scope.savedSearchNotificationsCount = 0;

    $scope.projects = projectsFactory.get({limit: 4, offset: 0});

    $scope.projects.$promise.then(function() {
        angular.forEach($scope.projects, function(project) {
            $scope.dataRoomNotificationsCount += project.dataRoomNotifications;
        });
    });

    $http.get('/searchTemplates/getNotifications/' + 3).success(function(res) {
        $scope.savedSearchNotifications = res.notifications;
        $scope.savedSearchNotificationsCount = res.notificationCount;
        var newArray = [];

        angular.forEach($scope.savedSearchNotifications, function(template) {
            angular.forEach(template, function(notification) {
                newArray.push(notification);
            });
        });

        $scope.savedSearchNotifications = newArray;
    });

    $http.get('/searchTemplates/getNotifications/' + 3 + '/0/2').success(function(res) {
        $scope.lighthouseNotifications = res.notifications;
        $scope.lighthouseNotificationsCount = res.notificationCount;
        var newArray = [];

        angular.forEach($scope.lighthouseNotifications, function(template) {
            angular.forEach(template, function(notification) {
                newArray.push(notification);
            });
        });

        $scope.lighthouseNotifications = newArray;
    });

    $scope.nextProjects = function(loop) {
        $scope.isPrev = true;
        $scope.loop = loop + 4;

        var old = angular.copy($scope.projects);

        projectsFactory.get({
            limit: 4,
            offset: $scope.loop
        }).$promise.then(function(response) {
                $scope.projects = response;
                if (response.length < 4) $scope.isNext = false;
                if (response.length == 0) {
                    $scope.projects = angular.copy(old);
                    $scope.isNext = false;
                }
            });
    };

    $scope.prevProjects = function(loop) {
        $scope.isNext = true;
        $scope.loop = loop - 4;
        $scope.projects = projectsFactory.get({
            limit: 4,
            offset: $scope.loop
        });
        if ($scope.loop == 0) {
            $scope.isPrev = false;
        }
    };

    $scope.animate = function(id) {
        $('#projectBox' + id).css({position: 'relative'}).
            animate({right: '151%', width: '248px'}, {duration: 200});
    };

    $scope.go = function(path) {
        window.location.replace(path);
    };
}]);

App.controller('CompaniesController', ['$scope', '$http', 'companiesFactory', 'searchTemplatesProvider', function($scope, $http, companiesFactory, searchTemplatesProvider) {
    $scope.loop = 0;
    $scope.isNext = true;
    $scope.isPrev = false;

    $scope.dataRoomNotificationsCount = 0;
    $scope.lighthouseNotificationsCount = 0;
    $scope.savedSearchNotificationsCount = 0;

    $scope.companies = companiesFactory.getForDashboard();

    $scope.companies.$promise.then(function() {
        angular.forEach($scope.companies, function(company) {
            $scope.dataRoomNotificationsCount += company.dataRoomNotifications;
        });
    });

    $http.get('/searchTemplates/getNotifications/' + 2).success(function(res) {
        $scope.savedSearchNotifications = res.notifications;
        $scope.savedSearchNotificationsCount = res.notificationCount;
        var newArray = [];

        angular.forEach($scope.savedSearchNotifications, function(template) {
            angular.forEach(template, function(notification) {
                newArray.push(notification);
            });
        });

        $scope.savedSearchNotifications = newArray;
    });

    $http.get('/searchTemplates/getNotifications/' + 2 + '/0/2').success(function(res) {
        $scope.lighthouseNotifications = res.notifications;
        $scope.lighthouseNotificationsCount = res.notificationCount;
        var newArray = [];

        angular.forEach($scope.lighthouseNotifications, function(template) {
            angular.forEach(template, function(notification) {
                newArray.push(notification);
            });
        });

        $scope.lighthouseNotifications = newArray;
    });

    $scope.nextCompanies = $scope.companies;

    $scope.prevCompanies = $scope.companies;

    $scope.animate = function(id) {
        $('#projectBox' + id).css({position: 'relative'}).
            animate({right: '151%', width: '248px'}, {duration: 200});
    };

    $scope.go = function(path) {
        window.location.replace(path);
    };
}]);

App.controller('CompanyInnerController', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
    $scope.tabFlag = 'companies';
    $scope.activityFeedAll = [];
    $scope.currentTab = '/js/templates/dashboard/tabs/activityFeed.htm';
    $scope.lighthouseTab = '/js/templates/dashboard/tabs/lighthouseFeed.htm';
    $scope.savedSearchTab = '/js/templates/dashboard/tabs/savedSearch.htm';
    $scope.dataRoomNotificationsCount = 0;
    $scope.lighthouseNotificationsCount = 0;
    $scope.savedSearchNotificationsCount = 0;

    $scope.currentUserId = currentUserId;
    $scope.currentUserCompanyId = currentUserCompanyId;


    $scope.message = {
        isInvite: false,
        MessageSystem: {}
    };

    $scope.companyTypes = {
        1: 'Fund',
        2: 'Company',
        3: 'Loan',
        4: 'Mezz',
        5: 'Service',
        6: 'Fund',
        7: 'Listing'
    };

    if ($routeParams.id) {
        $http.post('/dashboard/getSingleCompany/' + $routeParams.id).success(function(response) {
            if (response.error === false) {
                $scope.companyID = response.data.data.Company.id;
                $scope.userID = response.data.userID;
                $scope.companyLogo = response.data.data.Company.logo;
                $scope.companyTitle = response.data.data.Company.title;
                $scope.companyCompleteness = response.data.completeness;
            }
        });
    }

    $http.post('/dashboard/dataRoomActivity/companies/' + $routeParams.id).success(function(response) {
        if (response.error === false) {
            $scope.roomsActivity = response.data;
            $scope.dataRoomNotificationsCount = response.dataRoomNotificationsCount;
            $scope.activityFeed = response.activity;
            angular.forEach(response.activity, function(notification) {
                notification.DataRoomActivity['User'] = notification.User;
                $scope.activityFeedAll = $scope.activityFeedAll.concat(notification.DataRoomActivity);
            });
            $scope.activityFeedTab = (response.activity !== null && response.activity.length > 0 || $scope.lighthouseNotifications !== null) ?
                '/js/templates/dashboard/tabs/activityFeed.htm' : '/js/templates/dashboard/tabs/noFeed.htm';

            $scope.dataRoomsTab = (Object.keys(response.data).length > 0) ?
                '/js/templates/dashboard/tabs/dataRoomsActivity.htm' : '/js/templates/dashboard/tabs/noDataRoomActivity.htm';

            if ($routeParams.tab) {
                switch ($routeParams.tab) {
                    case 'dataRooms':
                        $scope.currentTab = $scope.dataRoomsTab;
                        break;

                    case 'lighthouse':
                        $scope.currentTab = $scope.lighthouseTab;
                        break;

                    case 'savedSearch':
                        $scope.currentTab = $scope.savedSearchTab;
                        break;

                    default:
                        $scope.currentTab = $scope.activityFeedTab;
                        break;
                }
            }


        }
    });

    $scope.loadSavedSearchNotifications = function(limited, isActivity) {
        var entityId = 2;
        limited = limited ? ('?limited=' + limited) : '';

        $http.get('/searchTemplates/getNotifications/' + entityId + '/' + $routeParams.id + limited).success(function(res) {
            if (isActivity) {
                angular.forEach(res.notifications, function(notification) {
                    $scope.activityFeedAll = $scope.activityFeedAll.concat(notification);
                });
            }
            $scope.savedSearchNotifications = res.notifications;
            $scope.savedSearchNotificationsCount = res.notificationCount;
        });
    };

    $scope.loadLighthouseNotifications = function(limited, isActivity) {
        var entityId = 2;
        limited = limited ? ('?limited=' + limited) : '';

        $http.get('/searchTemplates/getNotifications/' + entityId + '/' + $routeParams.id + '/2' + limited).success(function(res) {
            if (isActivity) {
                angular.forEach(res.notifications, function(notification) {
                    $scope.activityFeedAll = $scope.activityFeedAll.concat(notification);
                });
            }
            $scope.lighthouseNotifications = res.notifications;
            $scope.lighthouseNotificationsCount = res.notificationCount;
        });
    };

    $scope.loadSavedSearchNotifications(false, true);
    $scope.loadLighthouseNotifications(false, true);

    $scope.clearLighthouseNotifications = function() {
        var entityId = $routeParams.id == 'me' ? 1 : ($routeParams.id == 'company' ? 2 : 3);
        $http.get('/searchTemplates/clearNotifications/' + entityId + '/2');
        $scope.lighthouseNotifications = [];
        $scope.lighthouseNotificationsCount = 0;
    };

    $scope.clearSavedSearchNotifications = function() {
        var entityId = $routeParams.id == 'me' ? 1 : ($routeParams.id == 'company' ? 2 : 3);
        $http.get('/searchTemplates/clearNotifications/' + entityId + '/1');
        $scope.savedSearchNotifications = [];
        $scope.savedSearchNotificationsCount = 0;
    };

    $scope.clearNotification = function(notification, notifications, template_id) {
        $http.get('/searchTemplates/clearNotification/' + notification.id);
        notifications.splice(notifications.indexOf(notification), 1);
        $scope.lighthouseNotificationsCount--;
        if (notifications.length < 1) {
            delete $scope.lighthouseNotifications[template_id];
            if (angular.equals({}, $scope.lighthouseNotifications)) {
                $scope.lighthouseNotifications = [];
            }
        }
    };

    $scope.goToDataRoom = function(path, id) {
        $http.get('/dashboard/markActivityAsViewed/' + id).success(function() {
            window.location.href = '/collaboration-rooms#!' + path;
        });
    };

    $scope.removeNotification = function(notification, notifications) {
        if (typeof notifications === 'undefined') {
            $http.get('/dashboard/removeDataRoomMNotification/' + notification.DataRoomActivity.id);
            $scope.activityFeed.splice($scope.activityFeed.indexOf(notification), 1);
        } else {
            $http.get('/searchTemplates/clearNotification/' + notification.id);
            notifications.splice(notifications.indexOf(notification), 1);
            $scope.lighthouseNotificationsCount--;
            if (notifications.length < 1) {
                delete $scope.lighthouseNotifications[template_id];
                if (angular.equals({}, $scope.lighthouseNotifications)) {
                    $scope.lighthouseNotifications = [];
                }
            }
        }
    };

    $scope.removeActivityFeedNotification = function(notification) {
        if (typeof notification.foundEntityData === 'undefined') {
            $http.get('/dashboard/removeDataRoomNotification/' + notification.id);
        } else {
            $http.get('/searchTemplates/clearNotification/' + notification.id);
        }
        $scope.activityFeedAll.splice($scope.activityFeedAll.indexOf(notification), 1);
    };

    $scope.goToLighthouseSearchResult = function(notification, event) {
        var clickable = $(event.target).data('clickable');
        if (clickable !== false) {
            var entityId = notification.found_entity_id,
                url = notification.found_entity == 1 ?
                '/user/id' + entityId :
                    (notification.found_entity == 2 ?
                    '/company/id' + entityId : '/user/id' + notification.foundEntityData.Company.user_id + '/companies/id' + entityId);

            if (!notification.viewed) {
                $http.get('/dashboard/markLighthouseNotificationsAsViewed/' + notification.id).success(function() {
                    window.location.href = url;
                });
            } else {
                window.location.href = url;
            }
            notification.viewed = true;
        }

    };
    $scope.clearDataRoomsNotifications = function() {
        angular.forEach($scope.activityFeed, function(notification) {
            $http.get('/dashboard/removeDataRoomNotification/' + notification.DataRoomActivity.id);
        });
        $scope.activityFeed = [];
        $scope.roomsActivity = [];
        $scope.dataRoomNotificationsCount = 0;
    };

    var inviteTypes = {
        1: 'my profile', 2: 'my company\'s profile', 3: 'my company'
    };

    $scope.$watch('message.MessageSystem.entityId', function(newValue, oldValue) {
        if (newValue !== oldValue) {
            newValue = newValue.split('__');
            companyIndex = newValue[1];
            newValue = newValue[0];
            if (newValue != -1) {
                $scope.message.MessageSystem.entityId = '-1';
                $scope.message.MessageSystem.subject = 'Invitation to view ' + inviteTypes[1] + ' on RealConnex';

                var link = (newValue == 'me') ?
                'user/id' + $scope.currentUserId :
                    (newValue == 'company' ?
                    'company/id' + $scope.currentUserCompanyId :
                    'user/id' + $scope.currentUserId + '/companies/id' + newValue);

                $scope.message.MessageSystem.text =
                    'I think you might be interested in checking out ' +
                    ((newValue == 'me') ? 'my profile' : ((newValue == 'company') ? 'my company\'s' : $scope.userCompanies[companyIndex].title)) +
                    ' on RealConnex ' + location.protocol + '//' +
                    location.hostname + '/' + link;
            }
        }
    });

    $scope.sendMessage = function() {
        $http.post('/messages/sendMessage', {data: $scope.message}).success(function(response) {
            if (response.error === false) {
                $scope.$emit('notify', {text: ($scope.message.isInvite) ? 'Invite was sent' : 'Message was sent'});
                $scope.closePopup();
            } else {
                $scope.loading = false;
                $scope.$emit('notify', {text: 'Error'});
            }
        });
    };

    $scope.getEntityInfo = function(notification, isInvite) {
        $scope.message.isInvite = isInvite;
        if (notification.found_entity == 2) {
            $http.post('/inner_api/getUserIdByCompany/' + notification.foundEntityData.Company.id, {}).success(function(response) {
                if (response.error === false) {
                    $scope.message.MessageSystem.receiver_id = response.user_id;
                } else {
                    $scope.$emit('notify', {text: 'Error'});
                }
            });
        } else {
            $scope.message.MessageSystem.receiver_id = (notification.found_entity == 1) ? notification.foundEntityData.User.id : notification.foundEntityData.Company.user_id;
        }
        angular.element('select.styled').trigger('refresh');
    };
    $scope.closePopup = function() {
        angular.element('.fancybox-close').click();
        $scope.clearFields();
    };

    $scope.clearFields = function() {
        $scope.message.MessageSystem.subject = '';
        $scope.message.MessageSystem.text = '';
    }
}]);

App.controller('ProjectInnerController', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
    $scope.tabFlag = 'projects';
    $scope.activityFeedAll = [];
    $scope.currentTab = '/js/templates/dashboard/tabs/activityFeed.htm';
    $scope.lighthouseTab = '/js/templates/dashboard/tabs/lighthouseFeed.htm';
    $scope.savedSearchTab = '/js/templates/dashboard/tabs/savedSearch.htm';
    $scope.dataRoomNotificationsCount = 0;
    $scope.lighthouseNotificationsCount = 0;
    $scope.savedSearchNotificationsCount = 0;

    $scope.currentUserId = currentUserId;
    $scope.currentUserCompanyId = currentUserCompanyId;
    $scope.userProjects = projectsList.filter(function(value) {
        return value.title != null;
    });
    $scope.message = {
        isInvite: false,
        MessageSystem: {}
    };

    $scope.projectTypes = {
        1: 'Fund',
        2: 'Project',
        3: 'Loan',
        4: 'Mezz',
        5: 'Service',
        6: 'Fund',
        7: 'Listing'
    };

    if ($routeParams.id) {
        $http.post('/dashboard/getSingleProject/' + $routeParams.id).success(function(response) {
            if (response.error === false) {
                $scope.projectID = response.data.data.Project.id;
                $scope.userID = response.data.userID;
                $scope.projectLogo = response.data.data.Project.logo;
                $scope.projectTitle = response.data.data.Project.title;
                $scope.projCompleteness = response.data.completeness;
            }
        });
    }

    $http.post('/dashboard/dataRoomActivity/projects/' + $routeParams.id).success(function(response) {
        if (response.error === false) {
            $scope.roomsActivity = response.data;
            $scope.dataRoomNotificationsCount = response.dataRoomNotificationsCount;
            $scope.activityFeed = response.activity;
            angular.forEach(response.activity, function(notification) {
                notification.DataRoomActivity['User'] = notification.User;
                $scope.activityFeedAll = $scope.activityFeedAll.concat(notification.DataRoomActivity);
            });
            $scope.activityFeedTab = (response.activity !== null && response.activity.length > 0 || $scope.lighthouseNotifications !== null) ?
                '/js/templates/dashboard/tabs/activityFeed.htm' : '/js/templates/dashboard/tabs/noFeed.htm';

            $scope.dataRoomsTab = (Object.keys(response.data).length > 0) ?
                '/js/templates/dashboard/tabs/dataRoomsActivity.htm' : '/js/templates/dashboard/tabs/noDataRoomActivity.htm';

            if ($routeParams.tab) {
                switch ($routeParams.tab) {
                    case 'dataRooms':
                        $scope.currentTab = $scope.dataRoomsTab;
                        break;

                    case 'lighthouse':
                        $scope.currentTab = $scope.lighthouseTab;
                        break;

                    case 'savedSearch':
                        $scope.currentTab = $scope.savedSearchTab;
                        break;

                    default:
                        $scope.currentTab = $scope.activityFeedTab;
                        break;
                }
            }


        }
    });

    $scope.loadSavedSearchNotifications = function(limited, isActivity) {
        var entityId = 3;
        limited = limited ? ('?limited=' + limited) : '';

        $http.get('/searchTemplates/getNotifications/' + entityId + '/' + $routeParams.id + limited).success(function(res) {
            if (isActivity) {
                angular.forEach(res.notifications, function(notification) {
                    $scope.activityFeedAll = $scope.activityFeedAll.concat(notification);
                });
            }
            $scope.savedSearchNotifications = res.notifications;
            $scope.savedSearchNotificationsCount = res.notificationCount;
        });
    };

    $scope.loadLighthouseNotifications = function(limited, isActivity) {
        var entityId = 3;
        limited = limited ? ('?limited=' + limited) : '';

        $http.get('/searchTemplates/getNotifications/' + entityId + '/' + $routeParams.id + '/2' + limited).success(function(res) {
            if (isActivity) {
                angular.forEach(res.notifications, function(notification) {
                    $scope.activityFeedAll = $scope.activityFeedAll.concat(notification);
                });
            }
            $scope.lighthouseNotifications = res.notifications;
            $scope.lighthouseNotificationsCount = res.notificationCount;
        });
    };

    $scope.loadSavedSearchNotifications(false, true);
    $scope.loadLighthouseNotifications(false, true);

    $scope.clearLighthouseNotifications = function() {
        var entityId = $routeParams.id == 'me' ? 1 : ($routeParams.id == 'company' ? 2 : 3);
        $http.get('/searchTemplates/clearNotifications/' + entityId + '/2');
        $scope.lighthouseNotifications = [];
        $scope.lighthouseNotificationsCount = 0;
    };

    $scope.clearSavedSearchNotifications = function() {
        var entityId = $routeParams.id == 'me' ? 1 : ($routeParams.id == 'company' ? 2 : 3);
        $http.get('/searchTemplates/clearNotifications/' + entityId + '/1');
        $scope.savedSearchNotifications = [];
        $scope.savedSearchNotificationsCount = 0;
    };

    $scope.clearNotification = function(notification, notifications, template_id) {
        $http.get('/searchTemplates/clearNotification/' + notification.id);
        notifications.splice(notifications.indexOf(notification), 1);
        $scope.lighthouseNotificationsCount--;
        if (notifications.length < 1) {
            delete $scope.lighthouseNotifications[template_id];
            if (angular.equals({}, $scope.lighthouseNotifications)) {
                $scope.lighthouseNotifications = [];
            }
        }
    };

    $scope.goToDataRoom = function(path, id) {
        $http.get('/dashboard/markActivityAsViewed/' + id).success(function() {
            window.location.href = '/collaboration-rooms#!' + path;
        });
    };

    $scope.removeNotification = function(notification, notifications) {
        if (typeof notifications === 'undefined') {
            $http.get('/dashboard/removeDataRoomMNotification/' + notification.DataRoomActivity.id);
            $scope.activityFeed.splice($scope.activityFeed.indexOf(notification), 1);
        } else {
            $http.get('/searchTemplates/clearNotification/' + notification.id);
            notifications.splice(notifications.indexOf(notification), 1);
            $scope.lighthouseNotificationsCount--;
            if (notifications.length < 1) {
                delete $scope.lighthouseNotifications[template_id];
                if (angular.equals({}, $scope.lighthouseNotifications)) {
                    $scope.lighthouseNotifications = [];
                }
            }
        }
    };

    $scope.removeActivityFeedNotification = function(notification) {
        if (typeof notification.foundEntityData === 'undefined') {
            $http.get('/dashboard/removeDataRoomNotification/' + notification.id);
        } else {
            $http.get('/searchTemplates/clearNotification/' + notification.id);
        }
        $scope.activityFeedAll.splice($scope.activityFeedAll.indexOf(notification), 1);
    };

    $scope.goToLighthouseSearchResult = function(notification, event) {
        var clickable = $(event.target).data('clickable');
        if (clickable !== false) {
            var entityId = notification.found_entity_id,
                url = notification.found_entity == 1 ?
                '/user/id' + entityId :
                    (notification.found_entity == 2 ?
                    '/company/id' + entityId : '/user/id' + notification.foundEntityData.Project.user_id + '/projects/id' + entityId);

            if (!notification.viewed) {
                $http.get('/dashboard/markLighthouseNotificationsAsViewed/' + notification.id).success(function() {
                    window.location.href = url;
                });
            } else {
                window.location.href = url;
            }
            notification.viewed = true;
        }

    };
    $scope.clearDataRoomsNotifications = function() {
        angular.forEach($scope.activityFeed, function(notification) {
            $http.get('/dashboard/removeDataRoomNotification/' + notification.DataRoomActivity.id);
        });
        $scope.activityFeed = [];
        $scope.roomsActivity = [];
        $scope.dataRoomNotificationsCount = 0;
    };

    var inviteTypes = {
        1: 'my profile', 2: 'my company\'s profile', 3: 'my project'
    };

    $scope.$watch('message.MessageSystem.entityId', function(newValue, oldValue) {
        if (newValue !== oldValue) {
            newValue = newValue.split('__');
            projectIndex = newValue[1];
            newValue = newValue[0];
            if (newValue != -1) {
                $scope.message.MessageSystem.entityId = '-1';
                $scope.message.MessageSystem.subject = 'Invitation to view ' + inviteTypes[1] + ' on RealConnex';

                var link = (newValue == 'me') ?
                'user/id' + $scope.currentUserId :
                    (newValue == 'company' ?
                    'company/id' + $scope.currentUserCompanyId :
                    'user/id' + $scope.currentUserId + '/projects/id' + newValue);

                $scope.message.MessageSystem.text =
                    'I think you might be interested in checking out ' +
                    ((newValue == 'me') ? 'my profile' : ((newValue == 'company') ? 'my company\'s' : $scope.userProjects[projectIndex].title)) +
                    ' on RealConnex ' + location.protocol + '//' +
                    location.hostname + '/' + link;
            }
        }
    });

    $scope.sendMessage = function() {
        $http.post('/messages/sendMessage', {data: $scope.message}).success(function(response) {
            if (response.error === false) {
                $scope.$emit('notify', {text: ($scope.message.isInvite) ? 'Invite was sent' : 'Message was sent'});
                $scope.closePopup();
            } else {
                $scope.loading = false;
                $scope.$emit('notify', {text: 'Error'});
            }
        });
    };

    $scope.getEntityInfo = function(notification, isInvite) {
        $scope.message.isInvite = isInvite;
        if (notification.found_entity == 2) {
            $http.post('/inner_api/getUserIdByCompany/' + notification.foundEntityData.Company.id, {}).success(function(response) {
                if (response.error === false) {
                    $scope.message.MessageSystem.receiver_id = response.user_id;
                } else {
                    $scope.$emit('notify', {text: 'Error'});
                }
            });
        } else {
            $scope.message.MessageSystem.receiver_id = (notification.found_entity == 1) ? notification.foundEntityData.User.id : notification.foundEntityData.Project.user_id;
        }
        angular.element('select.styled').trigger('refresh');
    };
    $scope.closePopup = function() {
        angular.element('.fancybox-close').click();
        $scope.clearFields();
    };

    $scope.clearFields = function() {
        $scope.message.MessageSystem.subject = '';
        $scope.message.MessageSystem.text = '';
    }
}]);

App.controller('TabsInnerController', ['$routeParams', '$scope', '$http', function($routeParams, $scope, $http) {
    $scope.dashboardWelcomeTour = dashboardWelcomeTour;
    $scope.tabFlag = 'joined';
    $scope.currentTab = '/js/templates/dashboard/tabs/activityFeed.htm';
    $scope.lighthouseTab = '/js/templates/dashboard/tabs/lighthouseFeed.htm';
    $scope.savedSearchTab = '/js/templates/dashboard/tabs/savedSearch.htm';
    $scope.currentUserId = currentUserId;
    $scope.currentUserCompanyId = currentUserCompanyId;
    $scope.userProjects = projectsList.filter(function(value) {
        return value.title != null;
    });
    $scope.currentProject = -1;
    $scope.activityFeedAll = [];
    $scope.dataRoomNotificationsCount = 0;
    $scope.lighthouseNotificationsCount = 0;
    $scope.savedSearchNotificationsCount = 0;
    $scope.message = {
        isInvite: false,
        MessageSystem: {}
    };


    if ($scope.dashboardWelcomeTour) {
        window.location.reload();
    }

    if ($routeParams.id == 'joined') {
        $scope.blockLightHouse = true;
    }

    if ($routeParams.id == 'notifications') {
        // Animate scroll all notifications
        $('#activityFeed').scrollTo(1000);
    }

    $scope.projectTypes = {
        1: 'Fund',
        2: 'Project',
        3: 'Loan',
        4: 'Mezz',
        5: 'Service',
        6: 'Fund',
        7: 'Listing'
    };

    $http.post('/dashboard/dataRoomActivity/' + $routeParams.id).success(function(response) {
        if (response.error === false) {
            $scope.roomsActivity = response.data;
            $scope.showProfileInfo = true;


            $scope.activityFeed = response.activity;
            angular.forEach(response.activity, function(notification) {
                notification.DataRoomActivity['User'] = notification.User;
                $scope.activityFeedAll = $scope.activityFeedAll.concat(notification.DataRoomActivity);
            });

            $scope.profileData = response.profileData;
            $('#profileProgress').progressbar({value: $scope.profileData.profile_completeness});

            $scope.dataRoomNotificationsCount = response.dataRoomNotificationsCount;

            if ($routeParams.id !== 'joined') {
                $scope.loadSavedSearchNotifications(false, true);
                $scope.loadLighthouseNotifications(false, true);
            } else {
                $scope.showProfileInfo = false;
            }
            if ($routeParams.id == 'all') {
                angular.element('#_all').addClass('active');
                $scope.showProfileInfo = false;
            }
            if ($routeParams.id == 'projects') {
                angular.element('#_projects').addClass('active');
            }

            $scope.activityFeedTab = (response.activity !== null && response.activity.length > 0 || $scope.lighthouseNotifications !== null  ) ?
                '/js/templates/dashboard/tabs/activityFeed.htm' : '/js/templates/dashboard/tabs/noFeed.htm';

            $scope.dataRoomsTab = (Object.keys(response.data).length > 0) ?
                '/js/templates/dashboard/tabs/dataRoomsActivity.htm' : '/js/templates/dashboard/tabs/noDataRoomActivity.htm';

            if ($routeParams.tab) {
                switch ($routeParams.tab) {
                    case 'dataRooms':
                        $scope.currentTab = $scope.dataRoomsTab;
                        break;

                    case 'lighthouse':
                        $scope.currentTab = $scope.lighthouseTab;
                        break;

                    case 'savedSearch':
                        $scope.currentTab = $scope.savedSearchTab;
                        break;

                    default:
                        $scope.currentTab = $scope.activityFeedTab;
                        break;
                }
            }
        }
    });

    $scope.goToDataRoom = function(path, id) {
        $http.get('/dashboard/markActivityAsViewed/' + id).success(function() {
            window.location.href = '/collaboration-rooms#!' + path;
        });
    };

    $scope.goToLighthouseSearchResult = function(notification, event) {
        var clickable = $(event.target).data('clickable');
        if (clickable !== false) {
            var entityId = notification.found_entity_id,
                url = notification.found_entity == 1 ?
                '/user/id' + entityId :
                    (notification.found_entity == 2 ?
                    '/company/id' + entityId : '/user/id' + notification.foundEntityData.Project.user_id + '/projects/id' + entityId);

            if (!notification.viewed) {
                $http.get('/dashboard/markLighthouseNotificationsAsViewed/' + notification.id).success(function() {
                    window.location.href = url;
                });
            } else {
                window.location.href = url;
            }
            notification.viewed = true;
        }

    };

    $scope.loadSavedSearchNotifications = function(limited, isActivity) {
        var entityId = $routeParams.id == 'me' ? 1 : ($routeParams.id == 'company' ? 2 : ($routeParams.id == 'all' ? 'all' : 3));
        limited = limited ? ('?limited=' + limited) : '';

        $http.get('/searchTemplates/getNotifications/' + entityId + limited).success(function(res) {
            if (isActivity) {
                angular.forEach(res.notifications, function(notification) {
                    $scope.activityFeedAll = $scope.activityFeedAll.concat(notification);
                });
                // $scope.activityFeedAll = $scope.activityFeedAll.concat(res.notifications);
            }
            $scope.savedSearchNotifications = res.notifications;
            $scope.savedSearchNotificationsCount = res.notificationCount;
        });
    };

    $scope.loadLighthouseNotifications = function(limited, isActivity) {
        var entityId = $routeParams.id == 'me' ? 1 : ($routeParams.id == 'company' ? 2 : ($routeParams.id == 'all' ? 'all' : 3));
        limited = limited ? ('?limited=' + limited) : '';
        $http.get('/searchTemplates/getNotifications/' + entityId + '/0/2' + limited).success(function(res) {
            if (isActivity) {
                angular.forEach(res.notifications, function(notification) {
                    $scope.activityFeedAll = $scope.activityFeedAll.concat(notification);
                });
            }
            $scope.lighthouseNotifications = res.notifications;
            $scope.lighthouseNotificationsCount = res.notificationCount;
        });
    };

    $scope.loadAllLighthouseNotifications = function(templateID) {
        var entityId = $routeParams.id == 'me' ? 1 : ($routeParams.id == 'company' ? 2 : ($routeParams.id == 'all' ? 'all' : 3));
        $http.get('/searchTemplates/getNotifications/' + entityId + '/0/2?templateID=' + templateID).success(function(res) {
            $scope.lighthouseNotifications[templateID] = res.notifications;
            // $scope.lighthouseNotificationsCount = res.notificationCount;
        });
    };

    $scope.clearLighthouseNotifications = function() {
        var entityId = $routeParams.id == 'me' ? 1 : ($routeParams.id == 'company' ? 2 : ($routeParams.id == 'all' ? 'all' : 3));
        $http.get('/searchTemplates/clearNotifications/' + entityId + '/2');
        $scope.lighthouseNotifications = [];
        $scope.lighthouseNotificationsCount = 0;
    };

    $scope.clearSavedSearchNotifications = function() {
        var entityId = $routeParams.id == 'me' ? 1 : ($routeParams.id == 'company' ? 2 : ($routeParams.id == 'all' ? 'all' : 3));
        $http.get('/searchTemplates/clearNotifications/' + entityId + '/1');
        $scope.savedSearchNotifications = [];
        $scope.savedSearchNotificationsCount = 0;
    };


    $scope.clearDataRoomsNotifications = function() {
        angular.forEach($scope.activityFeed, function(notification) {
            $http.get('/dashboard/removeDataRoomNotification/' + notification.DataRoomActivity.id);
        });
        $scope.activityFeed = [];
        $scope.roomsActivity = [];
        $scope.dataRoomNotificationsCount = 0;
    };

    $scope.removeNotification = function(notification, notifications) {
        if (typeof notifications === 'undefined') {
            $http.get('/dashboard/removeDataRoomNotification/' + notification.DataRoomActivity.id);
            $scope.activityFeed.splice($scope.activityFeed.indexOf(notification), 1);
        } else {
            $http.get('/searchTemplates/clearNotification/' + notification.id);
            notifications.splice(notifications.indexOf(notification), 1);
            $scope.lighthouseNotificationsCount--;
            if (notifications.length < 1) {
                delete $scope.lighthouseNotifications[template_id];
                if (angular.equals({}, $scope.lighthouseNotifications)) {
                    $scope.lighthouseNotifications = [];
                }
            }
        }
    };

    $scope.removeActivityFeedNotification = function(notification) {
        if (typeof notification.foundEntityData === 'undefined') {
            $http.get('/dashboard/removeDataRoomNotification/' + notification.id);
        } else {
            $http.get('/searchTemplates/clearNotification/' + notification.id);
        }
        $scope.activityFeedAll.splice($scope.activityFeedAll.indexOf(notification), 1);
    };
    /// Message logic
    var inviteTypes = {
        1: 'my profile', 2: 'my company\'s profile', 3: 'my project'
    };

    $scope.$watch('message.MessageSystem.entityId', function(newValue, oldValue) {
        if (newValue !== oldValue) {
            newValue = newValue.split('__');
            projectIndex = newValue[1];
            newValue = newValue[0];
            if (newValue != -1) {
                $scope.message.MessageSystem.entityId = '-1';
                $scope.message.MessageSystem.subject = 'Invitation to view ' + inviteTypes[1] + ' on RealConnex';

                var link = (newValue == 'me') ?
                'user/id' + $scope.currentUserId :
                    (newValue == 'company' ?
                    'company/id' + $scope.currentUserCompanyId :
                    'user/id' + $scope.currentUserId + '/projects/id' + newValue);

                $scope.message.MessageSystem.text =
                    'I think you might be interested in checking out ' +
                    ((newValue == 'me') ? 'my profile' : ((newValue == 'company') ? 'my company\'s' : $scope.userProjects[projectIndex].title)) +
                    ' on RealConnex ' + location.protocol + '//' +
                    location.hostname + '/' + link;
            }
        }
    });

    $scope.sendMessage = function() {
        $http.post('/messages/sendMessage', {data: $scope.message}).success(function(response) {
            if (response.error === false) {
                $scope.$emit('notify', {text: ($scope.message.isInvite) ? 'Invite was sent' : 'Message was sent'});
                $scope.closePopup();
            } else {
                $scope.loading = false;
                $scope.$emit('notify', {text: 'Error'});
            }
        });
    };

    $scope.getEntityInfo = function(notification, isInvite) {
        $scope.message.isInvite = isInvite;
        if (notification.found_entity == 2) {
            $http.post('/inner_api/getUserIdByCompany/' + notification.foundEntityData.Company.id, {}).success(function(response) {
                if (response.error === false) {
                    $scope.message.MessageSystem.receiver_id = response.user_id;
                } else {
                    $scope.$emit('notify', {text: 'Error'});
                }
            });
        } else {
            $scope.message.MessageSystem.receiver_id = (notification.found_entity == 1) ? notification.foundEntityData.User.id : notification.foundEntityData.Project.user_id;
        }
        angular.element('select.styled').trigger('refresh');
    };

    $scope.closePopup = function() {
        angular.element('.fancybox-close').click();
        $scope.clearFields();
    };

    $scope.clearFields = function() {
        $scope.message.MessageSystem.subject = '';
        $scope.message.MessageSystem.text = '';
    }
}]);

