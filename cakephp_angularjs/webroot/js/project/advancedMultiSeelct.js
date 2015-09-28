/*
 * Author: v.jelev
 * Email: ivan@vizualtech.com
 */

(function($) {
    $(document).ready(function() {
        var advancedSelect = {
            config: {
                selectors: {
                    emptyItem: '.firstEmpty',
                    mainHolder: '.specialSelect',
                    mainDropBox: '.amsDropDown',
                    subDropDown: '.subDropDown',
                    itemsHolder: '.resultCheckboxes'
                },
                activeClass: 'active',
                animationSpeed: 'fast'
            },

            init: function(opt) {
                this.config = $.extend(this.config, opt);

                var self = this,
                    checkboxSelector = this.config.selectors.mainDropBox + ' input[type=checkbox]';

                $(document)
                    .on('change', checkboxSelector, function(event) {
                        self.toggleItem(this, event);
                        $('body').trigger('onAdvancedSelectChange');
                    })
                    .on('click', this.config.selectors.mainHolder + ' [data-action]', function(event) {
                        self[$(this).data('action')](this, event);
                    })
                    .on('change', 'input.subDropBoxItem', function(event) {
                        self.checkSubItem(this, event);
                    });

                $(this.config.selectors.itemsHolder).each(function() {
                    var elem = $(this);
                    if (elem.html().trim() === '') {
                        elem.siblings('.firstEmpty').show();
                    }
                });
            },

            toggleItem: function(elem) {
                var $elem = $(elem),
                    mainHolder = $elem.parents(this.config.selectors.mainHolder),
                    itemsHolder = mainHolder.find(this.config.selectors.itemsHolder);

                if (!$elem.hasClass('subDropBoxItem')) { // if not fake checkbox in popover|prevent double element adding
                    if (elem.checked) {
                        mainHolder.find(this.config.selectors.emptyItem).hide();
                        itemsHolder.append(this.elemGenerator.badge($elem.attr('id'), $elem.data('name')));

                        var subDropDownHolder = $elem.parents(this.config.selectors.subDropDown);

                        if (subDropDownHolder.length > 0) { // if checkbox is subItem
                            var parentItem = subDropDownHolder.siblings('[type=checkbox]');
                            if (subDropDownHolder.find('input:checked').length > 0) {
                                if (!parentItem[0].checked) parentItem.trigger('click');
                            }
                        }
                    } else {
                        itemsHolder.find('[data-id="' + $elem.attr('id') + '"]').parent().remove();
                        if ($elem.hasClass('parentCheckbox')) { // if we checked off parent, then all children also checked off;
                            $elem.siblings(this.config.selectors.subDropDown).find('input:checked').trigger('click').removeAttr('checked');
                        }
                        if (itemsHolder.find('li').length == 0) { // show empty item if no checked items in list
                            mainHolder.find(this.config.selectors.emptyItem).show();
                        }
                    }

                    if (mainHolder.parents('#subRoleSelect').length > 0) {
                        var checkedItemsList = [];

                        mainHolder.find('input[type=checkbox]:checked').each(function() {
                            checkedItemsList.push($(this).val());
                        });

                        ajaxUIBloced = true;
                        assetStrategies.getList(checkedItemsList, function(data) {
                            ajaxUIBloced = false;
                            var assetStrategySelect = $('#assetStrategySelect'),
                                checkboxHolder = assetStrategySelect.find('.amsDropDown > .row'),
                                currentItemIdsArr = [],
                                inNewItems = false;

                            checkboxHolder.find('[type=checkbox]').each(function() {
                                currentItemIdsArr.push($(this).val());
                            });

                            $.each(data, function(key, val) {
                                var subItems = '';

                                if ($.inArray(val.AssetStrategy.id, currentItemIdsArr) === -1) {
                                    inNewItems = true;
                                    if (val.children.length > 0) {
                                        subItems += '<div class="subDropDown hide"><div class="container" style="min-width: 200px">';
                                        $.each(val.children, function(_key, _val) {
                                            subItems +=
                                                '<div class="row subItemElem">' +
                                                '<div class="col-md-12">' +
                                                '<input type="checkbox" data-name="' + _val.AssetStrategy.title + '" class="checkboxIn" name="data[AssetStrategy][AssetStrategy][]" value="' + _val.AssetStrategy.id + '" id="AssetstrategyId_checkbox_' + _val.AssetStrategy.id + '">' +
                                                '<label for="AssetstrategyId_checkbox_' + _val.AssetStrategy.id + '">' + _val.AssetStrategy.title + '</label>' +
                                                '</div>' +
                                                '</div>';
                                        });
                                        subItems += '</div></div>';
                                    }

                                    var multiSelectClass = (subItems === '') ? '' : ' multiCheckbox';
                                    var parentCheckbox = (subItems === '') ? '' : ' parentCheckbox';

                                    checkboxHolder.append(
                                        '<div class="col-md-6 mainItemElem">' +
                                        '<div class="row' + multiSelectClass + '">' +
                                        '<div class="col-md-1">' +
                                        '<input type="checkbox" data-name="' + val.AssetStrategy.title + '" class="checkboxIn' + parentCheckbox + '" name="data[AssetStrategy][AssetStrategy][]" value="' + val.AssetStrategy.id + '" id="AssetstrategyId_checkbox_' + val.AssetStrategy.id + '">' +
                                        subItems +
                                        '</div>' +
                                        '<div class="col-md-9">' +
                                        '<label for="AssetstrategyId_checkbox_' + val.AssetStrategy.id + '">' + val.AssetStrategy.title + '</label>' +
                                        '</div>' +
                                        '</div>' +
                                        '</div>');
                                } else {
                                    var index = currentItemIdsArr.indexOf(val.AssetStrategy.id);
                                    currentItemIdsArr.splice(index, 1);
                                    if (val.children.length > 0) {
                                        $.each(val.children, function(_key, _val) {
                                            index = currentItemIdsArr.indexOf(_val.AssetStrategy.id);
                                            currentItemIdsArr.splice(index, 1);
                                        });
                                    }
                                }
                            });

                            if (currentItemIdsArr.length > 0) {
                                $.each(currentItemIdsArr, function() {
                                    var checkbox = checkboxHolder.find('#AssetstrategyId_checkbox_' + this);
                                    if (checkbox.length > 0) {
                                        if (checkbox[0].checked === true) {
                                            checkbox.trigger('click');
                                        }
                                        if (checkbox.parents('.subItemElem').length > 0) {
                                            checkbox.parents('.subItemElem').remove();
                                        } else if (checkbox.parents('.mainItemElem').length > 0) {
                                            checkbox.parents('.mainItemElem').remove();
                                        }
                                    }
                                });
                            }
                        }, mainHolder.parent().attr('user-role'));
                    }

                    if (mainHolder.parents('#roleSelect').length > 0) {
                        checkedItemsList = [];

                        mainHolder.find('input[type=checkbox]:checked').each(function() {
                            checkedItemsList.push($(this).val());
                        });

                        ajaxUIBloced = true;

                        $.post('/innerApi/getSubRoles', {'checkedRoles': checkedItemsList}, function(data) {
                            ajaxUIBloced = false;
                            var subRoleSelect = $('#subRoleSelect2'),
                                checkboxHolder = subRoleSelect.find('.amsDropDown > .row'),
                                currentItemIdsArr = [],
                                inNewItems = false,
                                modelName = subRoleSelect.data('name') || 'IdealProfileSubroles';

                            checkboxHolder.find('[type=checkbox]').each(function() {
                                currentItemIdsArr.push($(this).val());
                            });

                            $.each(data, function(key, val) {
                                var subItems = '';

                                if ($.inArray(val.Subrole.id, currentItemIdsArr) === -1) {
                                    console.log('sdsc');
                                    inNewItems = true;
                                    if (val.children.length > 0) {
                                        subItems += '<div class="subDropDown hide"><div class="container" style="min-width: 200px">';
                                        $.each(val.children, function(_key, _val) {
                                            subItems +=
                                                '<div class="row subItemElem">' +
                                                '<div class="col-md-12">' +
                                                '<input type="checkbox" data-name="' + _val.Subrole.title + '" class="checkboxIn" name="data[' + modelName + '][' + modelName + '][]" value="' + _val.Subrole.id + '" id="' + modelName + 'Id_checkbox_' + _val.Subrole.id + '">' +
                                                '<label for="IdealprofilesubrolesId_checkbox_' + _val.Subrole.id + '">' + _val.Subrole.title + '</label>' +
                                                '</div>' +
                                                '</div>';
                                        });
                                        subItems += '</div></div>';
                                    }

                                    var multiSelectClass = (subItems === '') ? '' : ' multiCheckbox';
                                    var parentCheckbox = (subItems === '') ? '' : ' parentCheckbox';

                                    if (modelName === 'IdealProfileSubroles') {
                                        checkboxHolder.append(
                                            '<div class="col-md-6 mainItemElem">' +
                                            '<div class="row' + multiSelectClass + '">' +
                                            '<div class="col-md-1">' +
                                            '<input type="checkbox" data-name="' + val.Subrole.title + '" class="checkboxIn' + parentCheckbox + '" name="data[' + modelName + '][' + modelName + '][]" value="' + val.Subrole.id + '" id="' + modelName + 'Id_checkbox_' + val.Subrole.id + '">' +
                                            subItems +
                                            '</div>' +
                                            '<div class="col-md-9">' +
                                            '<label for="' + modelName + 'Id_checkbox_' + val.Subrole.id + '">' + val.Subrole.title + '</label>' +
                                            '</div>' +
                                            '</div>' +
                                            '</div>');
                                    } else {
                                        checkboxHolder.append(
                                            '<div class="col-md-6 mainItemElem">' +
                                            '<div class="row' + multiSelectClass + '">' +
                                            '<div class="col-md-1">' +
                                            '<input type="checkbox" data-name="' + val.Subrole.title + '" class="checkboxIn' + parentCheckbox + '" name="data[dynamic][' + modelName + ']" value="' + val.Subrole.id + '" id="' + modelName + 'Id_checkbox_' + val.Subrole.id + '">' +
                                            subItems +
                                            '</div>' +
                                            '<div class="col-md-9">' +
                                            '<label for="' + modelName + 'Id_checkbox_' + val.Subrole.id + '">' + val.Subrole.title + '</label>' +
                                            '</div>' +
                                            '</div>' +
                                            '</div>');
                                    }

                                } else {
                                    var index = currentItemIdsArr.indexOf(val.Subrole.id);
                                    currentItemIdsArr.splice(index, 1);
                                    if (val.children.length > 0) {
                                        $.each(val.children, function(_key, _val) {
                                            index = currentItemIdsArr.indexOf(_val.Subrole.id);
                                            currentItemIdsArr.splice(index, 1);
                                        });
                                    }
                                }
                            });

                            if (currentItemIdsArr.length > 0) {
                                $.each(currentItemIdsArr, function(k, v) {
                                    var checkbox = checkboxHolder.find('#' + modelName + 'Id_checkbox_' + v);
                                    if (checkbox.length < 1) {
                                        modelName = modelName[0].toUpperCase() + modelName.toLowerCase().substring(1);
                                        console.log(modelName);
                                        checkbox = checkboxHolder.find('#' + modelName + 'Id_checkbox_' + v);
                                    }

                                    if (checkbox.length > 0) {
                                        if (checkbox[0].checked === true) {
                                            checkbox.trigger('click');
                                        }
                                        if (checkbox.parents('.subItemElem').length > 0) {
                                            checkbox.parents('.subItemElem').remove();
                                        } else if (checkbox.parents('.mainItemElem').length > 0) {
                                            checkbox.parents('.mainItemElem').remove();
                                        }
                                    }
                                });
                            }
                        }, 'json');
                    }
                }
            },

            deleteItem: function(elem, event) {
                event.stopPropagation(); // prevent js bubble effect
                var $elem = $(elem),
                    mainHolder = $elem.parents(this.config.selectors.mainHolder);
                mainDropBox = mainHolder.find(this.config.selectors.mainDropBox);
                dataId = $elem.data('id');

                mainDropBox.find('#' + dataId).trigger('click');
            },

            closeDropBox: function(elem) {
                //TODO: close dropbox on mouse leave;
            },

            toggleDropBox: function(elem) {
                var $elem = $(elem),
                    $wel = $elem.siblings('.well'),
                    $labels = $wel.find('.mainItemElem > .row > .col-md-9 > label'),
                    $holder = $elem.parents(this.config.selectors.mainHolder),
                    self = this;

                var clickChecker = function(e) {
                    if ($holder.hasClass(self.config.activeClass) && !$(e.target).parents(self.config.selectors.mainHolder).length > 0) {
                        $(document).unbind('click', clickChecker);
                        self.toggleDropBox(elem);
                    }
                };

                $wel.show();
                var leftColumnWidth = 0;
                var rightColumnWidth = 0;
                var maxWidth = 'auto';
                var evenElems = $wel.find('.mainItemElem:even');
                var oddElems = $wel.find('.mainItemElem:odd');

                evenElems.width(maxWidth);
                oddElems.width(maxWidth);

                // if in FancyBox set max-width to 200px
                if ($wel.parents('.fancybox-wrap').length > 0) {
                    evenElems.css({'max-width':'240px'});
                    oddElems.css({'max-width':'240px'});
                } else {
                    evenElems.css({'max-width':'auto'});
                    oddElems.css({'max-width':'auto'});
                }

                $labels.filter(':even').each(function() {
                    var currentElemWidth = $(this).width() + 40;
                    if (leftColumnWidth < currentElemWidth) {
                        leftColumnWidth = currentElemWidth;
                    }
                });

                $labels.filter(':odd').each(function() {
                    var currentElemWidth = $(this).width() + 40;
                    if (rightColumnWidth < currentElemWidth) {
                        rightColumnWidth = currentElemWidth;
                    }
                });

                evenElems.width(leftColumnWidth);
                oddElems.width(rightColumnWidth);

                $wel.hide();

                $wel.attr('style', 'width: ' + (leftColumnWidth + rightColumnWidth + 50) + 'px !important');


                if ($holder.hasClass(this.config.activeClass)) {
                    $(document).unbind('click', clickChecker);
                    $holder.find(this.config.selectors.mainDropBox).slideUp(this.config.animationSpeed);
                    $holder.removeClass(this.config.activeClass);
                } else {
                    $(document).bind('click', clickChecker);
                    $wel.slideDown(this.config.animationSpeed);
                    $holder.addClass(this.config.activeClass);
                    if (!elementInViewport($wel[0])) {
                        $positions = elementInViewport($wel[0], true);
                        if ($positions.left || $positions.right) {
                            if ($positions.right)
                                $wel.css({right: 0, left: 'auto'});
                            if (!elementInViewport($wel[0])) {
                                $positions = elementInViewport($wel[0], true);
                                if ($positions.left || $positions.right) {
                                    var $left = 0;
                                    while (!elementInViewport($wel[0])) {
                                        $left = $left * -1;
                                        $wel.css({'left': $left});
                                        $left = $left * -1;
                                        $left += 10;
                                        if ($left >= 200) break;
                                    }
                                }
                            }
                        } else {
                            if ($positions.bottom) {
                                $height = $wel[0].offsetHeight * -1;
                                $wel.css({top: $height});
                            }
                        }

                    }
                }
            },

            checkSubItem: function(elem, event) {
                var originalId = $(elem).data('id');
                $('#' + originalId).trigger('click');
            },

            elemGenerator: {
                badge: function(elemId, title) {
                    return '<li class="active">' +
                        '<a href="javascript:" class="del" data-action="deleteItem" data-id="' + elemId + '" >' +
                        title +
                        '</a>' +
                        '</li>';
                }
            }
        };
        advancedSelect.init();
    });
})(jQuery);
