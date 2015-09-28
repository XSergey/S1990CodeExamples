angular.module('app').controller('DataRoom', ['$scope', '$http', '$cacheFactory', '$route', '$routeParams', 'dataRoomsFactory', 'uploaderService', function ($scope, $http, $cacheFactory, $route, $routeParams, dataRoomsFactory, uploaderService) {

    $scope.dataRoom = {
        notice: {
            current : 'Adding Room',
            create  : 'Adding Room',
            edit    : 'Editing Room'
        },
        invite: {
            unInvitedUsers: []
        },
        entities: [],
        projects: projects,
        companies: companies,
        folders: folders,
        params: {
            companyExist: companyExist,
            forProject: forProject, //filtered by project
            forCompany: forCompany, //filtered by company
            userName: userName,
            apiHome: apiHome, //full path current user
            currentDir: '/',
            homeDir: '/',
            inner: false,
            folderTree: {},
            isActive: 'all',
            showRooms: 'all',
            roomType: 'me',
            roomName: '',
            roomEntity: '',
            roomEdit: false,
            joinedRoom: false,
            loading: false,
            closed: false
        }
    };

    $scope.friends = [];
    $scope.selected = [];

    $scope.templates = {
        rooms: {
            basic: '/js/templates/dataRoom/rooms.htm',
            empty: '/js/templates/dataRoom/no_rooms.htm',
            enteties: '/js/templates/dataRoom/enteties.htm'
        },
        folders: {
            basic: '/js/templates/dataRoom/folders.htm'
        },
        current: {
            basic: '/js/templates/dataRoom/rooms.htm'
        }
    };

    $scope.$on('$routeChangeSuccess', function(event, current, previous) {
        $scope.choseActiveTab(current.params.path);
        $scope.openFolder('/' + current.params.path);
    });

    $scope.choseActiveTab = function(path) {
        if (path == 'me' || path == 'projects' || path == 'companies' || path == 'joined' || path == 'all') {
            $scope.dataRoom.params.isActive = path;
        }
    };


    $scope.$watch('selectedFriends', function() {
        if (angular.isDefined($scope.selectedFriends) && $scope.selectedFriends != null) {
            $scope.exist = false;

            angular.forEach($scope.selected, function(value, key) {
                if (value.id == $scope.selectedFriends.originalObject.id) {
                    $scope.$emit('notify', {text: 'This user already selected'});
                    $scope.exist = true;
                }
            });
            if (!$scope.exist) {
                $scope.selected.push($scope.selectedFriends.originalObject);
            }
            angular.element('#_value').val('');
            $scope.selectedFriends.originalObject = null;
        }
    });

    $scope.deleteUserFromSelected = function(id) {
        angular.forEach($scope.selected, function(value, key) {
            if (value.id == id) {
                $scope.currentUser = value;
                $scope.currentKey = key;
            }
        });
        if ($scope.dataRoom.params.roomEdit == true) {
            $scope.dataRoom.invite.unInvitedUsers.push($scope.currentUser);
        }
        $scope.selected.splice($scope.currentKey, 1);
        $scope.currentUser = null;
    };

    $scope.addToInvite = function() {
        if ($scope.inviteEmail) {
            if (/^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/.test($scope.inviteEmail)) {
                $scope.selected.push({
                    email: $scope.inviteEmail,
                    full_name: $scope.inviteEmail.slice(0, $scope.inviteEmail.indexOf('@')),
                    avatar: '/thumbs/51x51/img/no_image/default.png'
                });
                $scope.inviteEmail = '';
            } else {
                $scope.$emit('notify', {text: 'Email not valid !!!'});
            }
        } else {
            $scope.$emit('notify', {text: "Email can't be empty !!!"});
        }
    };


    $scope.initUploader = function() {
        var settings = {uploadPhotoUrl: '/collaboration-rooms/uploadFile', path: $scope.dataRoom.params.currentDir};
        $scope.uploder = uploaderService.allType(function(path) {
            $scope.openFolder($scope.dataRoom.params.currentDir);
        }, settings);
    };

    $scope.initUploader();

    $scope.closePopup = function() {
        $scope.friends = $scope.allFriends;
        $scope.searchStr = '';
        $scope.dataRoom.params.roomName = '';
        $scope.roomComment = '';
        $scope.selected = [];
        angular.element('#_value').val('');
        $scope.dataRoom.params.roomEdit = false;
        angular.element('.fancybox-close').click();

    };
    /// changing creating name
    $scope.changeName = function(type) {
        $scope.dataRoom.params.roomType = type;
        if (type == 'company') {
            $scope.dataRoom.entities = $scope.dataRoom.companies;
            $scope.dataRoom.params.roomEntity = $scope.dataRoom.companies?  $scope.dataRoom.companies[0].id : '';
        }

        if (type == 'projects') {
            $scope.dataRoom.entities = $scope.dataRoom.projects;
            $scope.dataRoom.params.roomEntity = $scope.dataRoom.projects? $scope.dataRoom.projects[0].id : '';
        }

        setTimeout(function(){  angular.element('select.styled').trigger('refresh'); }, 200);

    };

    /// Api logic
    $scope.openFolder = function(path) {
        if (path == '/me' || path == '/companies' || path == '/projects' || path == '/all' || path == '/joined') {
            if (path == '/companies') {
                path = 'company';
            } else {
                path = path.substr(1);
            }

            dataRoomsFactory.getRooms({}, {path: path}).$promise.then(function(response) {
                if (response.error === false) {
                    if (response.inner === true) {
                        $scope.dataRoom.params.inner = true;
                        $scope.templates.current.basic = $scope.templates.folders.basic;
                        $scope.dataRoom.params.innerName = response.tree[response.tree.length - 1].name;
                        $scope.roomId = response.id;
                        if (response.closed) {
                            $scope.dataRoom.params.closed = true;
                        } else {
                            $scope.dataRoom.params.closed = false;
                        }
                    } else {
                        $scope.dataRoom.params.inner = false;
                        if ($routeParams.path == 'projects' || $routeParams.path == 'companies') {
                            $scope.templates.current.basic = $scope.templates.rooms.enteties;
                        } else if ($routeParams.path == 'joined') {
                            $scope.templates.current.basic = $scope.templates.rooms.basic;
                            $scope.join = 'active';
                        } else {
                            $scope.templates.current.basic = $scope.templates.rooms.basic;
                        }
                    }
                    $scope.dataRoom.params.folderTree = response.tree;
                    $scope.dataRoom.folders = response.data;
                    $scope.dataRoom.params.currentDir = response.currentDir;
                    $scope.current = response.currentDir;
                    $scope.$emit('openRoom', {id: response.id});
                } else {
                    $scope.$emit('notify', {text: 'Open error!!!'});
                }
            });

        } else {
            $http.post('/collaboration-rooms', {path: path}).success(function(response) {
                if (response.error === false) {
                    if (response.inner === true) {
                        $scope.dataRoom.params.inner = true;
                        $scope.dataRoom.params.joinedRoom = response.joined;
                        $scope.templates.current.basic = $scope.templates.folders.basic;
                        $scope.dataRoom.params.innerName = response.tree[response.tree.length - 1].name;
                        $scope.roomId = response.id;
                        if (response.closed) {
                            $scope.dataRoom.params.closed = true;
                        }
                        else {
                            $scope.dataRoom.params.closed = false;
                        }
                    } else {
                        $scope.dataRoom.params.inner = false;
                        if ($routeParams.path == 'projects' || $routeParams.path == 'companies') {
                            $scope.templates.current.basic = $scope.templates.rooms.enteties;
                        } else if ($routeParams.path == 'joined') {
                            $scope.templates.current.basic = $scope.templates.rooms.basic;
                            $scope.join = 'active';
                        }
                        else {
                            $scope.templates.current.basic = $scope.templates.rooms.basic;
                        }
                    }
                    $scope.dataRoom.params.folderTree = response.tree;
                    $scope.dataRoom.folders = response.data;
                    $scope.dataRoom.params.currentDir = response.currentDir;
                    $scope.current = response.currentDir;
                    $scope.$broadcast('openRoom', {id: response.id, path: response.currentDir});
                } else {
                    $scope.$emit('notify', {text: 'Open dir error!!!'});
                }
            });
        }
    };

    $scope.createFolder = function() {
        $scope.dataRoom.params.loading = true;
        $http.post('/collaboration-rooms/createFolder', {
            path: $scope.dataRoom.params.currentDir + '/' + $scope.folder.name, room_id: $scope.roomId,
            folderName: $scope.folder.name
        }).success(function(response) {
            if (response.error === false) {
                $scope.dataRoom.params.loading = false;
                $scope.folder.name = '';
                angular.element('.fancybox-close').click();
                $scope.openFolder($scope.dataRoom.params.currentDir);
                $scope.$emit('notify', {text: 'Folder was created.'});
            } else {
                $scope.dataRoom.params.loading = false;
                $scope.$emit('notify', {text: 'Folder not created !!!'});
            }
        });
    };

    $scope.deleteFolder = function() {
        $http.post('/collaboration-rooms/deleteFolder', {
            path: $scope.dataRoom.params.currentDir,
            room_id: $scope.roomId
        }).success(function(response) {
            if (response.error === false) {
                $scope.openFolder($scope.dataRoom.params.currentDir);
                $scope.$emit('notify', {text: ' success deleted!!!'});
            } else {
                $scope.$emit('notify', {text: 'Folder not deleted !!!'});
            }
        });
    };

    $scope.deleteItem = function(path, name, isFolder) {
        if (isFolder) {
            var type = 'Folder';
        } else {
            var type = 'File';
        }
        $http.post('/collaboration-rooms/deleteFolder', {
            path: path,
            itemName: name,
            room_id: $scope.roomId,
            type: type
        }).success(function(response) {
            if (response.error === false) {
                $scope.openFolder($scope.dataRoom.params.currentDir);
                $scope.$emit('notify', {text: type + ' success deleted!!!'});
            } else {
                $scope.$emit('notify', {text: type + ' not deleted !!!'});
            }
        });
    };

    $scope.getFile = function(file) {
        $http.post('/collaboration-rooms/getFile', {file: file}).success(function(response) {
            if (response.error === false) {
                window.open(response);
            } else {
                $scope.$emit('notify', {text: 'Error !!!'});
            }
        });
    };

    /// Rooms operation
    $scope.createRoom = function() {
        $scope.dataRoom.notice.current = $scope.dataRoom.notice.create;
        $scope.dataRoom.params.loading = true;
        if ($scope.dataRoom.params.roomName !== '') {
            $http.post('/collaboration-rooms/createRoom', {
                roomName: $scope.dataRoom.params.roomName, roomType: $scope.dataRoom.params.roomType,
                roomEntity: $scope.dataRoom.params.roomEntity, path: $scope.dataRoom.params.homeDir + '/' + $scope.dataRoom.params.roomType + '/' + $scope.dataRoom.params.roomName,
                users: $scope.selected, comment: $scope.roomComment
            }).success(function(response) {
                if (response.error === false) {
                    $scope.dataRoom.params.loading = false;
                    $scope.dataRoom.params.roomName = '';
                    $scope.roomComment = '';
                    $scope.cleanCache();
                    $scope.closePopup();
                    $scope.openFolder($scope.dataRoom.params.currentDir);
                    $scope.$emit('notify', {text: 'Your room has been created.'});
                } else {
                    $scope.dataRoom.params.loading = false;
                    $scope.$emit('notify', {text: 'Your room has not been created.'});
                }
            });
        } else {
            $scope.dataRoom.params.loading = false;
            $scope.$emit('notify', {text: 'Room name cant be empty  !!!'});
        }
    };

    $scope.editRoom = function(roomName, path, fromInnerPage) {
        $http.post('/collaboration-rooms/getInvitedUsers', {path: path}).success(function(response) {
            if (response.error === false) {
                if (response.users) {
                    $scope.friends = response.users;
                    if (response.invited) {
                        $scope.selected = response.invited;
                    }
                }
            }
        });
        $scope.dataRoom.params.roomEdit = true;
        $scope.roomOldName = roomName;
        $scope.dataRoom.params.roomName = roomName;
        $scope.roomPath = path;
        $scope.EditFromInnerPage = fromInnerPage;
    };

    $scope.beforeAddRoom = function () {
        $scope.selected = [];
    };

    $scope.saveEditRoom = function() {
        $scope.dataRoom.notice.current = $scope.dataRoom.notice.edit;
        $scope.dataRoom.params.loading = true;
        $http.post('/collaboration-rooms/editRoom', {
            path: $scope.roomPath, name: $scope.dataRoom.params.roomName, old_name: $scope.roomOldName,
            users: $scope.selected, usersUninvited: $scope.dataRoom.invite.unInvitedUsers, comment: $scope.roomComment,
            fromInnerPage: $scope.EditFromInnerPage
        }).success(function(response) {
            if (response.error === false) {
                $scope.dataRoom.params.loading = false;
                $scope.dataRoom.params.roomName = '';
                $scope.dataRoom.params.roomEdit = true;
                $scope.closePopup();
                if (response.currentDir) {
                    $scope.openFolder(response.currentDir);
                } else {
                    $scope.openFolder($scope.dataRoom.params.currentDir);
                }

                $scope.$emit('notify', {text: 'Your room has been successfully updated.'});
            } else {
                $scope.dataRoom.params.loading = false;
                $scope.$emit('notify', {text: "We're sorry an error has occurred and your room has not been updated. Please try again later."});
            }
        });
    };

    $scope.deleteRoom = function(roomPath, name, room_id) {
        $http.post('/collaboration-rooms/deleteRoom', {
            path: roomPath,
            itemName: name,
            room_id: room_id,
            type: 'room'
        }).success(function(response) {
            if (response.error === false) {
                $scope.cleanCache();
                $scope.openFolder($scope.dataRoom.params.currentDir);
                $scope.$emit('notify', {text: 'Your room has been deleted.'});
            } else {
                $scope.$emit('notify', {text: 'Your room has not been deleted.'});
            }
        });
    };

    $scope.closeRoom = function (roomPath, roomName, roomId) {
        if (!roomId) {
            roomId = $scope.roomId;
        }
        if (!roomName) {
            roomName = $scope.dataRoom.params.innerName;
        }
        $http.post('/collaboration-rooms/closeRoom', {
            path: roomPath,
            roomName: roomName,
            roomId: roomId
        }).success(function(response) {
            if (response.error === false) {
                $scope.cleanCache();
                $scope.openFolder($scope.dataRoom.params.currentDir);
                $scope.$emit('notify', {text: 'Your room is closed.'});
            } else {
                $scope.$emit('notify', {text: 'Your room is not closed.'});
            }
        });
    };

    $scope.openRoom = function(roomPath, roomName, roomId) {
        if (!roomId) {
            roomId = $scope.roomId;
        }
        if (!roomName) {
            roomName = $scope.dataRoom.params.innerName;
        }
        $http.post('/collaboration-rooms/openRoom', {
            path: roomPath,
            roomName: roomName,
            roomId: roomId
        }).success(function(response) {
            if (response.error === false) {
                $scope.openFolder($scope.dataRoom.params.currentDir);
                $scope.$emit('notify', {text: 'Your room has been re-opened.'});
            } else {
                $scope.$emit('notify', {text: 'Your room has not been re-opened.'});
            }
        });
    };

    $scope.getProjects = function() {
        $http.post('/collaboration-rooms/getUserProjects').success(function (response) {
            if (response.error === false) {
                $scope.dataRoom.projects = response.projects;
            } else {
                $scope.$emit('notify', {text: 'Projects not loaded!!!'});
            }
        });
    };

    $scope.leaveRoom = function(roomUrl, roomPath) {
        $http.post('/collaboration-rooms/leaveRoom', {url: roomUrl, path: roomPath}).success(function(response) {
            if (response.error === false) {
                $scope.openFolder($scope.dataRoom.params.currentDir);
                $scope.$emit('notify', {text: 'Room left successfully!!!'});
            } else {
                $scope.$emit('notify', {text: 'Room has not left !!!'});
            }
        });
    };

    $scope.cleanCache = function() {
        $cacheFactory.get('$http').remove('/getRooms/projects');
        $cacheFactory.get('$http').remove('/getRooms/company');
        $cacheFactory.get('$http').remove('/getRooms/me');
        $cacheFactory.get('$http').remove('/getRooms/all');
    };

    $scope.normalizePath = function(path) {
        return path.replace(/\#/g, "%23");
    };

}]).config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/:path*', {
            controller: 'DataRoom'
        });
}]);
