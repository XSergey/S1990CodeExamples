angular.module('app').directive('activeOn', ['$location', function($location) {
    return function(scope, element, attrs) {
        var styleClass = attrs.class || 'active';
        scope.$on('$routeChangeSuccess', function() {
            $location.path() === attrs.activeOn ?
                element.addClass(styleClass) :
                element.removeClass(styleClass);
        });
    }
}]);

angular.module('app').directive('autoFocus', ['$parse', function($parse) {
    return {
        restrict: 'A',
        scope: {
            'autoFocus': '=',
            'onEnter': '=',
            'onEsc': '='
        },
        controller: function($scope, $element, $attrs) {
            var keyEnter = 13,
                keyEsc = 27;
            $element.on('blur', function() {
                $element.context.value = '';
                $scope.autoFocus = false;
                $scope.$apply();
            });
            $element.on('keydown', function(e) {
                if (e.keyCode == keyEnter) {
                    ($scope.onEnter || angular.noop)($element.context.value);
                    $element.blur();
                } else if (e.keyCode == keyEsc) {
                    ($scope.onEsc || angular.noop)($element.context.value);
                    $element.blur();
                }
            });
            $scope.$watch('autoFocus', function() {
                if ($scope.autoFocus) {
                    $element.focus();
                }
            });
        }
    };
}]);

angular.module('app').directive('compile', ['$compile', function($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
                return scope.$eval(attrs.compile);
            },
            function(value) {
                element.html(value);
                $compile(element.contents())(scope);
            }
        );
    };
}]);

angular.module('app').directive('selectbox', ['$timeout', function($timeout) {
    return {
        link: function(scope, element, attrs) {
            angular.element(element).selectbox();
            scope.$watch(attrs.selectbox, function() {
                $timeout(function() {
                    angular.element(element).trigger('refresh');
                });
            }, true);
            scope.$watch(attrs.ngModel, function() {
                angular.element(element).trigger('refresh');
            });
        }
    };
}]);

angular.module('app').directive('checkbox', ['$timeout', function($timeout) {
    return {
        link: function(scope, element, attrs) {
            angular.element(element).Custom({customStyleClass: 'checkbox', customHeight: '17', enableHover: false});
            scope.$watch(attrs.ngChecked, function() {
                angular.element(element).trigger('change');
            });
        }
    };
}]);

angular.module('app').directive('htmlText', function($parse) {
    return {
        link: function(scope, element, attrs) {
            var len = parseInt(attrs.htmlTruncateLength);
            scope.$watch(attrs.htmlText, function(content) {
                if (angular.isUndefined(content))
                    return;

                var endLine = content.indexOf('<br>');
                if (len)
                    if (endLine < 0) {
                        // One line
                        // Truncate text if it more then setting length
                        if (content.length > len)
                            content = angular.element.trim(content).substring(0, len) + '...';

                    } else {
                        // More then 1 lines, substring it
                        content = angular.element.trim(content).substring(0, endLine);
                        // Truncate text
                        if (content.length > len)
                            content = angular.element.trim(content).substring(0, len);
                        content += ' ...';
                    }
                element.html(content);
            });

        }
    };
});

angular.module('app').directive('fancybox', ['$compile', '$http', '$parse', function($compile, $http, $parse) {
    return {
        restrict: 'A',

        controller: function($scope, $element, $attrs) {
            $scope.openFancybox = function(url, options) {
                $http.post(url, options).then(function(response) {
                    var content = angular.element('<div />').attr('id', '_fancybox-content').append(response.data);
                    $compile(content)($scope);
                    $.fancybox.open({
                        'content': content,
                        'type': 'html',
                        'padding': 0,
                        'autoScale': true,
                        'autoDimensions': true,
                        'transitionIn': 'none',
                        'transitionOut': 'none',
                        'scrolling': options.scrolling || 'auto',
                        'centerOnScroll': true,
                        'helpers': {
                            overlay: {
                                locked: false
                            }
                        },
                        'afterLoad': function() {
                            $('body').bind('onAdvancedSelectChange', function() {
                                $(this).resize();
                            });
                        },
                        'afterClose': function() {
                            $('body').unbind('onAdvancedSelectChange');
                        }
                    });
                });
            };
            $element.on('click', function(e) {
                if (angular.isDefined($attrs.popupId)) {
                    angular.element.fancybox.open({
                        'content': angular.element($attrs.popupId),
                        'type': 'html',
                        'padding': 0,
                        'autoScale': true,
                        'autoDimensions': true,
                        'transitionIn': 'none',
                        'transitionOut': 'none',
                        'scrolling': 'auto',
                        'centerOnScroll': true,
                        'helpers': {
                            overlay: {
                                locked: false
                            }
                        },
                        'afterClose': function() {
                            $parse($attrs.popupOnClose)($scope);
                        }
                    });
                    e.stopPropagation();
                }
            });
        }
    };
}]);

angular.module('app').directive('popup', ['$compile', '$http', '$parse', '$templateCache', '$cacheFactory', function($compile, $http, $parse, $templateCache, $cacheFactory) { // Show cached popup (fancybox)
    return {
        restrict: 'A',
        $scope: false,

        controller: function($scope, $element, $attrs) {
            var that = this;
            var cacheContent = $cacheFactory.get('cacheContent') || $cacheFactory('cacheContent');

            $element.on('click', function(e) {
                    var ae = angular.element,
                        template = $attrs.popup || 'js/templates/template.htm',
                        templateId = template + '_id',
                        cacheId = templateId + '_' + $scope.$id;
                    if (angular.isUndefined($scope.closePopup))
                        $scope.closePopup = function() {
                            ae.fancybox.close();
                        };
                    var isShow = true;
                    if (angular.isDefined($attrs.popupBeforeShow)) {
                        // Callback must return true value if you want to show box
                        isShow = $parse($attrs.popupBeforeShow)($scope);
                    }

                    if (isShow) {
                        that.popup = function(content) {
                            ae.fancybox.open({
                                'content': content,
                                'type': 'html',
                                'padding': 0,
                                'autoScale': true,
                                'autoDimensions': true,
                                'transitionIn': 'none',
                                'transitionOut': 'none',
                                'scrolling': 'auto',
                                'centerOnScroll': true,
                                'helpers': {
                                    overlay: {
                                        locked: false
                                    }
                                },
                                'afterLoad': function() {
                                    if ($scope.$$phase !== '$digest') {
                                        $scope.$digest();
                                    }

                                },
                                'afterShow':function(){
                                   if (angular.isDefined($attrs.popupAfterShow)) {
                                        // Callback must return true value if you want to show box
                                        isShow = $parse($attrs.popupAfterShow)($scope);
                                    }
                                },
                                'afterClose': function() {
                                }
                            });
                        };

                        that.compile = function(html) {
                            var _content = ae('<div />').attr('id', '_fancybox-content').append(html);
                            if (!compiled) {
                                //Compile
                                compiled = $compile(_content)
                                //Bind to scope
                                compiled($scope);
                            }
                            return _content;
                        };


                        //Compiled cache
                        var cached = cacheContent.get(cacheId);
                        if (angular.isUndefined(cached)) {
                            //Template cache
                            var cachedTemplate = $templateCache.get(templateId);
                            if (angular.isUndefined(cachedTemplate)) {
                                $http.get(template).success(function(response) {
                                    $templateCache.put(templateId, response);
                                    var compiled = that.compile(response);
                                    cacheContent.put(cacheId);
                                    that.popup(compiled);
                                });
                            } else {
                                var compiled = that.compile(cachedTemplate);
                                cacheContent.put(cacheId);
                                that.popup(compiled);
                            }
                        } else {
                            that.popup(cached);
                        }
                    }
                }
            );
        }
    };
}]);

angular.module('app').directive('multiSelectbox', ['$filter', '$timeout', '$animate', function($filter, $timeout, $animate) {
    return {
        restrict: 'EA',
        templateUrl: function(elem, attrs) {
            var template = attrs.template || 'default';
            return '/js/templates/multiSelect/' + template + '.htm';
        },
        scope: {
            'list': '=',
            'selected': '=',
            'defaultSelected': '=',
            'name': '@',
            'field': '@',
            'labelField': '@',
            'placeholder': '@'
        },
        link: function($scope, $element, $attrs) {
            var container = $element.find('.msb-container'),
                dropDown = $element.find('.msb-dropdown'),
                anchorTop = angular.isDefined($attrs.anchorTop) ? true : false,
                anchorLeft = angular.isDefined($attrs.anchorLeft) ? true : false,
                searchPromise = null;
            dropDown.width(400);
            //Disable animation effects in angular
            $animate.enabled(false, $element);
            $scope.searchText = '';
            $scope.items = [];
            $scope.checkedItems = [];
            $scope.isSearching = false;
            $scope.tail = Math.random().toString(36).substring(7);

            if (!angular.isFunction($scope.list)) {
                $scope.$watch('list', function() {
                    $scope.items = [];
                    $scope.list.forEach(function(value) {
                        $scope.items.push({
                            'item': value,
                            'checked': ($filter('filter')($scope.checkedItems,
                                function(val) {
                                    return val.item[$scope.field] == value[$scope.field];
                                }).length > 0)
                        });
                    });
                });
            }

            $scope.isSearchEnable = function() {
                return angular.isDefined($scope.list) && angular.isFunction($scope.list);
            };

            $scope.search = function() {
                $timeout.cancel(searchPromise);
                searchPromise = $timeout(function() {
                    $scope.isSearching = true;
                    $scope.list($scope.searchText, function(result) {
                        if (result) {
                            $scope.items = [];
                            result.forEach(function(value) {
                                $scope.items.push({
                                    'item': value,
                                    'checked': ($filter('filter')($scope.checkedItems,
                                        function(val) {
                                            return val.item[$scope.field] === value[$scope.field];
                                        }).length > 0)
                                });
                            });
                        }
                        $scope.isSearching = false;
                    });
                }, 500);
            };

            $scope.$watch('defaultSelected', function(value) {
                $scope.checkedItems = [];
                if (angular.isDefined($scope.defaultSelected) && $scope.defaultSelected != null)
                    value.forEach(function(item) {
                        $scope.checkedItems.push({
                            'item': item,
                            'checked': true
                        });
                        $scope.items.forEach(function(value) {
                            if (value.item[$scope.field] == item[$scope.field]) {
                                value.checked = true;
                            }
                        });
                    });
            }, true);
            //Close dropbox by outside click
            angular.element(document).on('click', function(event) {
                if (dropDown.is(':visible') && (angular.element(event.target).parents(dropDown.selector).length < 1)) {
                    $scope.hideList();
                }
            });

            $scope.hideList = function() {
                if (anchorTop)
                    dropDown.animate({
                        'top': '0px',
                        'height': 'toggle',
                        'opacity': 'toggle'
                    }, 200, function() {
                        container.css('z-index', 5);
                    });
                else
                    dropDown.slideUp('fast', function() {
                        container.css('z-index', 5);
                    });
            };

            $scope.showList = function() {
                // Расчет высоты списка с 2 колонками
                if ($scope.isSearchEnable()) {
                    dropDownHeight = 200;
                } else {
                    var divColMd6Height = 16,
                        dropDownHeight = Math.ceil($scope.items.length / 2) * divColMd6Height + 10;
                    if (dropDownHeight > 200)
                        dropDownHeight = 200;
                }

                // Задаем высоту списка
                dropDown.height(dropDownHeight);

                // Список поверх остального
                container.css('z-index', 9999);

                // Показываем список над/под полем ввода
                if (anchorTop) {
                    dropDown.css('top', '-10px');
                    dropDown.animate({'height': 'toggle', 'top': -dropDown.outerHeight() - 1 + 'px'}, 250);
                } else {
                    dropDown.slideDown('fast');
                }

                // Запускаем поиск если список показываем впервые
                if ($scope.items.length == 0 && angular.isDefined($scope.list) && angular.isFunction($scope.list)) {
                    $scope.search();
                }
            };

            $scope.toggleDropBox = function($event) {
                $event.stopPropagation();
                if (angular.element($event.target).parents(dropDown.selector).length > 0)
                    return false;
                //if ((window.innerWidth - container.offset().left - container.outerWidth()) < (dropDown.outerWidth() - container.outerWidth() + 15))
                //    anchorLeft = false;
                //else
                //    anchorLeft = true;

                if (anchorLeft)
                    dropDown.css('left', '0px');
                else
                    dropDown.css('left', (container.outerWidth() - dropDown.outerWidth() - 1) + 'px');


                if (dropDown.is(':visible') && (angular.element($event.target).parents(dropDown.selector).length < 1)) {
                    // *** hide item list
                    $scope.hideList();
                }
                else {
                    // *** show item list
                    $scope.showList();
                }
            };

            $scope.changeItem = function(item, event) {
                if (event)
                    event.stopPropagation();

                var index = null;
                $scope.checkedItems.forEach(function(value, key) {
                    if (value.item[$scope.field] == item.item[$scope.field]) {
                        index = key;
                    }
                });

                if (angular.isNumber(index)) {
                    if (item.checked)
                        $scope.checkedItems.push(item);
                    else
                        $scope.checkedItems.splice(index, 1);
                } else
                    $scope.checkedItems.push(item);

                $scope.updateSelected();
            };

            $scope.deleteItem = function(item, index, event) {
                if (event)
                    event.stopPropagation();

                $scope.checkedItems.splice(index, 1);
                $scope.items.forEach(function(value, key) {
                    if (value.item[$scope.field] == item.item[$scope.field]) {
                        value.checked = false;
                    }
                });
                $scope.updateSelected();
            };

            $scope.updateSelected = function() {
                $scope.selected = [];
                $scope.checkedItems.forEach(function(value) {
                    $scope.selected.push(value.item);
                });
            };
        }
    };
//******************************************************************************************************************
// --- EXAMPLE ---
// <multi-selectbox
//          data-name               string ("country")
//          data-anchor-left        flag
//          data-anchor-top         flag
//          data-selected           array|object ('selected.countries')
//          data-default-selected   array|object ('selected.countries')
//          data-list               array|object|function ("list.countries")
//          data-field              string ("countryCode")
//          data-label-field        string ("countryName")
//          data-placeholder        string ("-- Select country --")
// ></multi-selectbox>
//******************************************************************************************************************
}]);

angular.module('app').directive('sliderRange', function() {
    return {
        restrict: 'E',
        template: '' +
        '<div class="slider-holder slider-hold" >' +
        '   <div class="tooltip_sides min">' +
        '       <div class="tooltip - inner">[[ current[0] ]] [[ label ]]</div>' +
        '   </div>' +
        '   <div class="slider-range-holder"></div>' +
        '   <div class="tooltip_sides max">' +
        '       <div class="tooltip - inner">[[ current[1] ]] [[ label ]]</div>' +
        '   </div>' +
        '</div>',
        scope: {
            'default': '=',
            'margin': '=',
            'current': '='
        },
        link: function($scope, $element, $attrs) {
            var holder = $element.find('.slider-range-holder');

            $scope.label = $attrs.label || '';
            $scope.current = $scope.current || $scope.default || [0, 0];

            $scope.$watch('default', function() {
                holder.slider('values', $scope.default);
                $scope.current = $scope.default;
            });

            $scope.$watch('margin', function() {
                if ($scope.margin) {
                    holder.slider('option', 'min', $scope.margin[0]);
                    holder.slider('option', 'max', $scope.margin[1]);
                }
            });

            holder.slider({
                range: true,
                min: 0,
                max: 100,
                slide: function(event, ui) {
                    $scope.current = ui.values;
                    $scope.$apply();
                }
            });
        }
    };
//******************************************************************************************************************
//--- EXAMPLE ---
//<slider-range
//      data-current    array|object ("equity_required")
//      data-default    array|object ("[10,90]")
//      data-margin     array|object ("[0,100]")
//      data-label      strng ("%")
//></slider-range>
//******************************************************************************************************************
});

angular.module('app').directive('usmap', function($timeout) {
    return {
        templateUrl: function(elem, attrs) {
            var template = attrs.template || 'default';
            return '/js/templates/geoWidget/' + template + '.html';
        },
        scope: {
            'editMode': '@',
            'selected': '=',
            'onChange': '=',
            'onRegionChange': '='
        },
        link: function($scope, $element, $attrs) {
            var editColors = {
                    west: '#86778E',
                    southwest: '#374D83',
                    midwest: '#99B163',
                    southeast: '#F48913',
                    northeast: '#EAC34F'
                },
                nonEditColors = {
                    west: '#D5D0D8',
                    southwest: '#B9C1D4',
                    midwest: '#DBE4C9',
                    southeast: '#FBD6AD',
                    northeast: '#F8EAC2'
                },
                editStyles = {},
                nonEditStyles = {};

            var regions = {
                west: {checked: false, states: ['WA', 'ID', 'MT', 'OR', 'CA', 'NV', 'AK', 'HI']},
                midwest: {
                    checked: false,
                    states: ['OH', 'MI', 'IN', 'IL', 'WI', 'MO', 'IA', 'MN', 'ND', 'SD', 'NE', 'KS']
                },
                southwest: {checked: false, states: ['WY', 'UT', 'AZ', 'NM', 'CO', 'TX', 'OK', 'AR']},
                southeast: {checked: false, states: ['KY', 'NC', 'TN', 'LA', 'MS', 'AL', 'GA', 'SC', 'FL']},
                northeast: {
                    checked: false,
                    states: ['ME', 'NH', 'VT', 'NY', 'MA', 'RI', 'CT', 'NJ', 'PA', 'DE', 'MD', 'VA', 'DC', 'MV']
                }
            };

            angular.forEach(regions, function(array, regionName) {
                array.states.forEach(function(state) {
                    editStyles[state] = {fill: editColors[regionName]};
                    nonEditStyles[state] = {fill: nonEditColors[regionName]};
                });
            });

            var map = $element.find('.usmap');
            map
                .css('width', $attrs.width || 500)
                .css('height', $attrs.height || 400);

            map.usmap({
                'showLabels': false,
                'stateStyles': {
                    stroke: '#FFFFFF'/*#41A59B*/,
                    'stroke-width': 1,
                    'stroke-linejoin': 'round',
                    scale: [1, 1]
                },
                'stateSpecificStyles': angular.copy($scope.editMode == 'true' ? editStyles : nonEditStyles),
                'stateHoverStyles': {
                    fill: '#C7F464',
                    stroke: '#ADCC56',
                    scale: [1.1, 1.1]
                },
                'stateHoverAnimation': 100,
                'labelBackingStyles': {
                    fill: '#4ECDC4',
                    stroke: '#41A59B',
                    'stroke-width': 1,
                    'stroke-linejoin': 'round',
                    scale: [1, 1]
                },

                // The styles for the hover
                'labelBackingHoverStyles': {
                    fill: '#C7F464',
                    stroke: '#ADCC56'
                },

                'labelTextStyles': {
                    fill: '#222',
                    'stroke': 'none',
                    'font-weight': 300,
                    'stroke-width': 0,
                    'font-size': '10px'
                },

                // The click action
                click: function(event, data) {
                    if (data.name !== 'WV') {
                        if (typeof event.originalEvent.checked !== 'undefined') {
                            if (typeof data.shape != 'undefined')
                                if (event.originalEvent.checked) {
                                    if ($scope.editMode == 'true') {
                                        angular.element(data.shape[0]).attr('fill', '#4ECDC4');
                                        this.stateSpecificStyles[data.name].fill = '#4ECDC4';
                                    } else {
                                        angular.element(data.shape[0]).attr('fill', editStyles[data.name].fill);
                                        this.stateSpecificStyles[data.name].fill = editStyles[data.name].fill;
                                    }
                                } else {
                                    if ($scope.editMode == 'true') {
                                        angular.element(data.shape[0]).attr('fill', editStyles[data.name].fill);
                                        this.stateSpecificStyles[data.name].fill = editStyles[data.name].fill;
                                    } else {
                                        angular.element(data.shape[0]).attr('fill', nonEditStyles[data.name].fill);
                                        this.stateSpecificStyles[data.name].fill = nonEditStyles[data.name].fill;
                                    }
                                }
                        } else if (angular.isDefined($scope.onChange) && angular.isFunction($scope.onChange)) {
                            $scope.onChange(data.name);
                        }
                    }
                },

                mouseover: function(event, data) {
                    if ($scope.editMode == 'false') {
                        return false;
                    }
                },

                mouseout: function(event, data) {
                    if ($scope.editMode == 'false') {
                        return false;
                    }
                }
            });

            $scope.$watch('selected', function(newStates, oldStates) {
                if (newStates && oldStates) {
                    var newItems = newStates.map(function(item) {
                            return item.adminCode1;
                        }),
                        oldItems = oldStates.map(function(item) {
                            return item.adminCode1;
                        });

                    newStates.forEach(function(value) {
                        if (oldItems.indexOf(value.adminCode1) < 0) {
                            map.usmap('trigger', value.adminCode1, 'click', {'checked': true});
                        }
                    });

                    oldStates.forEach(function(value) {
                        if (newItems.indexOf(value.adminCode1) < 0) {
                            map.usmap('trigger', value.adminCode1, 'click', {'checked': false});
                        }
                    });
                }
            }, true);

            $scope.changeRegion = function(regionName) {
                if (angular.isDefined($scope.onRegionChange) && angular.isFunction($scope.onRegionChange)) {
                    $scope.onRegionChange(regionName);
                }
            };
        }
    };
});

angular.module('app').directive('privacy', function() {
    return {
        link: function($scope, $element, $attrs) {
            if (!$attrs.isOwner) {
                var arrPrivacyData = $scope[$attrs.itemName][$attrs.modelName];
                if (typeof arrPrivacyData !== 'undefined') {
                    arrPrivacyData.forEach(function(item) {
                        if (item.field_name === $attrs.fieldName) {
                            if (typeof item.allowed_users_id !== 'undefined' && item.allowed_users_id) {
                                var arrAllowUsers = item.allowed_users_id.split(' ');
                                if ((arrAllowUsers.length > 0) && (arrAllowUsers.indexOf($attrs.user) >= 0))
                                    return;
                            }
                            $element.html("<a href='#' class='access requestPrivacyField' data-hash='" + item.hash + "'>Request a Viewing</a>");
                        }
                    });
                }
            }
        }
    };
//******************************************************************************************************************
// --- EXAMPLE ---
//<td  data-privacy
//          data-is-owner       bool ("{{ isMyProject }}")
//          data-item-name      string ("requirement")
//          data-model-name     string ('PrivacyFinancialRequirementField')
//          data-field-name     string ('title')
//          data-user           int ("{{ authProfile.id }}")
// >
//******************************************************************************************************************
});

angular.module('app').directive('repeatDone', function() {
    return function(scope, element, attrs) {
        if (scope.$last) { // all are rendered
            scope.$eval(attrs.repeatDone);
        }
    }
});

angular.module('app').directive('objToStr', function() {
    return {
        restrict: 'E',
        scope: {
            'object': '='
        },
        link: function(scope, element, attrs) {
            scope.$watch('object', function(value) {
                if (angular.isDefined(scope.object) && scope.object.length > 0) {
                    var str = scope.object.map(function(value) {
                        return value[attrs.field];
                    }).join(', ');
                } else
                    str = '-';
                element.html(str);
            }, true);
        }
    };
//******************************************************************************************************************
// --- EXAMPLE ---
//<obj-to-str
//      data-object     array|object ("selected.countries")
//      data-field      string ("countryName")
// ></obj-to-str>
//******************************************************************************************************************
});

//angular.module('app').directive('file', function() {
//    return {
//        require: 'ngModel',
//        restrict: 'A',
//        link: function($scope, el, attrs, ngModel) {
////            var uploader = new plupload.Uploader({
////                runtimes: 'gears, html5, flash, silverlight, browserplus',
//////                    browse_button: settings.uploadBtn,
////                chunk_size: '1mb',
////                max_file_size: '5mb',
//////                    url: settings.uploadPhotoUrl,
////                flash_swf_url: '/js/plu_uploader/plupload.flash.swf',
//////                filters : [{title : "Image files", extensions : "jpg,png,jpeg"}],
////                multi_selection: false
////            });
////            uploader.init();
////            uploader.bind('FilesAdded', function(upload) {
////                upload.start();
////            });
//            el.bind('change', function(event) {
//                var files = event.target.files;
//                var file = files[0];
////                uploader.files = files;
////                uploader.addFile(files);
////                uploader.bind('FileUploaded', function(up, file, info) {
////                    if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(file.name)) {
////                        $('.isEmbed').css('display', 'block');
////                    }
////                    var result = $.parseJSON(info.response);
////                    if (!result.error) {
////                        var respObj = {
////                            fileUrl: result.url,
////                            fileName: result.filename
////                        };
////                        callback(respObj);
////                    }
////                });
//                ngModel.$setViewValue(file);
//                $scope.$apply();
//            });
//        }
//    };
//});
