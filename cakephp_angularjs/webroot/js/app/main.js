var options = window.angularInjections || ['ngRoute', 'ngResource'];
angular.module('app', options).
    config(['$interpolateProvider', '$locationProvider', '$httpProvider', function($interpolateProvider, $locationProvider, $httpProvider) {
        $interpolateProvider.startSymbol('[[').endSymbol(']]');
        $locationProvider.hashPrefix('!');
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        $httpProvider.defaults.transformRequest = [function(data) {
            var param = function(obj) {
                var query = '';
                var name, value, fullSubName, subValue, innerObj, i;
                for (name in obj) {
                    value = obj[name];
                    if (value instanceof Array) {
                        for (i = 0; i < value.length; ++i) {
                            subValue = value[i];
                            fullSubName = name + '[' + i + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value instanceof Object) {
                        for (subName in value) {
                            subValue = value[subName];
                            fullSubName = name + '[' + subName + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    } else if (value !== undefined && value !== null) {
                        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                    }
                }
                return query.length ? query.substr(0, query.length - 1) : query;
            };
            return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
        }];

    }]);

angular.module('app').controller('AppController', ['$scope', '$sce', function($scope, $sce) {
    var self = this;

    $scope.$on('$routeChangeStart', function() {
        self.isLoading = true;
    });

    $scope.$on('$routeChangeSuccess', function() {
        self.isLoading = false;
    });

    $scope.$on('validation', function(event, args) {
        args.form.find('.error-message').remove();
        angular.element.each(args.errors, function(model, fields) {
            angular.element.each(args.errors[model], function(field, error) {
                var errorObj = angular.element('<span>', {'class': 'error-message'}).html(error);
                args.form.find('*[name="data[' + model + '][' + field + ']"]').parent().append(errorObj);
            });
        });
    });

    $scope.$on('notify', function(event, args) {
        typeof $.pnotify === 'function' ? $.pnotify({
            text: args.text,
            delay: 3000,
            before_open: function(pnotify) {
                pnotify.css({'left': ($(window).width() / 2) - (pnotify.width() / 2)});
            }
        }) : null;
    });

    $scope.toHtml = function(html_code) {
        html_code = html_code.replace(/\n/g, '<br/>');
        return $sce.trustAsHtml(html_code);
    };

    $scope.confirm = function(title, text, funct) {
        if (typeof (title) == 'undefined' || title == null) {
            title = 'Confirmation Needed';
        }

        if (typeof (text) == 'undefined' || text == null) {
            title = 'Are you sure?';
        }
        (new PNotify({
            title: title,
            text: text,
            icon: 'glyphicon glyphicon-question-sign',
            hide: false,
            addClass: 'tug',
            confirm: {
                confirm: true,
                buttons: [
                    {text: 'Ok', addClass: 'sbm btn-confirm confirm'},
                    {text: 'Cancel', addClass: 'sbm btn-confirm cancel'}
                ]

            },
            buttons: {
                closer: false,
                sticker: false
            },
            history: {
                history: false
            }
        })).get().on('pnotify.confirm', function() {
                funct('test');
            }).on('pnotify.cancel', function() {
                return false;
            });
    };
}]);
// ***  FILTERS  ***
angular.module('app').filter('nl2br', function() {
    return function(text) {
        return text.replace(/\n/g, '<br/>');
    };
});

angular.module('app').filter('toHtml', ['$sce', function($sce) {
    return function(html_code) {
        html_code = html_code.replace(/\n/g, '<br/>');
//        return $sce.getTrustHtml(html_code);
        return $sce.trustAsHtml(html_code);
    };
}]);

angular.module('app').filter('slice', function() {
    return function(arr, start, end) {
        if (angular.isDefined(arr))
            return arr.slice(start, end);
    };
});

angular.module('app').filter('slide', function() {
    return function(arr, countPerPage, totalCount) {
        var cur = 0, prev = 0;
        while (cur < totalCount) {
            prev = cur;
            arr.push({'start': cur, 'end': cur + countPerPage});
            cur += countPerPage;
        }
        console.log(totalCount);
        if (cur > totalCount) {
            arr[arr.length - 1].end -= countPerPage;
            arr[arr.length - 1].end += totalCount - prev;
        }
        return arr;
    };
});

angular.module('app').filter('alphabetGroups', function($filter) {
    return function(list, fieldName, start, end) {

        var sortedContacts = (angular.isDefined(start) && angular.isDefined(end)) ?
                $filter('orderBy')(list, '+' + fieldName, false).slice(start, end) :
                $filter('orderBy')(list, '+' + fieldName, false),
            result = [],
            currentChar = '';

        angular.forEach(sortedContacts, function(value) {
            var valueChar = value[fieldName] ? value[fieldName][0].toUpperCase() : 'NONE';

            if (valueChar != currentChar) {
                currentChar = valueChar;
                result.push({'group': currentChar, 'list': []});
            }
            result[result.length - 1].list.push(value);
        });
        return result;
    };
});

// ***  DIRECTIVES  ***
angular.module('app').directive('ngConfirmClick', [
    function() {
        return {
            link: function(scope, element, attr) {
                var msg = attr.ngConfirmClick || 'Are you sure?';
                var clickAction = attr.confirmedClick;
                element.bind('click', function(event) {
                    (new PNotify({
                        text: msg,
                        icon: 'glyphicon glyphicon-question-sign',
                        hide: false,
                        addClass: 'tug',
                        confirm: {
                            confirm: true,
                            buttons: [
                                {
                                    text: 'Yes',
                                    addClass: 'sbm btn-confirm confirm'
                                },
                                {
                                    text: 'No',
                                    addClass: 'sbm btn-confirm cancel'
                                }
                            ]
                        },
                        buttons: {
                            closer: false,
                            sticker: false
                        },
                        history: {
                            history: false
                        }
                    })).get().on('pnotify.confirm', function() {
                            scope.$eval(clickAction);
                        }).on('pnotify.cancel', function() {
                            return false;
                        });
                });
            }
        };
    }]);



