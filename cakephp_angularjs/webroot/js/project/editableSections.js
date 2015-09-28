var EditableSections = {
    finishSkipBtns: null,
    settings: {
        el: '#accountContainer',
        phone: '.phone',
        completePercent: undefined,
        linkFirstEdit: undefined
    },
    init: function(opt) {
        this.settings = $.extend(this.settings, opt);
        this.finishSkipBtns = ($(this.settings.el).find('.finishSkip').length > 0) ? $(this.settings.el).find('.finishSkip') : false;
        this.bindEvents();
    },
    bindEvents: function() {
        var that = this,
            opt = this.settings;

        $(opt.el).on('click', '[data-action]', function(e) {
            e.preventDefault();

            var dataAction = this.getAttribute('data-action');
            if (typeof that[dataAction] === 'function') {
                that[dataAction](this);
            }
        });
        $(opt.el).on('submit', 'form', function(e) {
            e.preventDefault();
            var sectionHash = $(this).data('sectionHash');
            that._sendPost(sectionHash, $(this));
            return false;
        });

        ///////////////////////////////////////////////////////////
        $(opt.el).on('mouseover', '.multiCheckbox', function(e) {
            var offsetCurrentElem = $(this).find('.subDropDown').offset().top + $(this).find('.subDropDown').outerHeight(true);
            var footerOffset = $("#footer").offset().top;
            var addHeight = offsetCurrentElem - footerOffset;
            //if multiCheckbox subDropDown going under footer than add height
            if (addHeight > 0) {
                $('.page-holder').height($('.page-holder').height() + addHeight);
            }
        });
        ////////////////////////////////////////////////////////////

        if (opt.linkFirstEdit != undefined && opt.completePercent < 1) {
            $(this.settings.linkFirstEdit).trigger('click');
        }
    },

    editSection: function(btn) {
        var that = this,
            sectionHash = $(btn).data('sectionHash'),
            thisSection = $(btn).closest('.eachSection'),
            data_id = $(btn).data('id');

        $('#content').find('form').submit();

        $.ajax({
            url: "/edit/section/" + sectionHash,
            data: {id: data_id},
            success: function(data){
                if (!data.error) {
                    that.finishSkip('hide');
                    thisSection.find('.viewPart').hide();
                    thisSection.find('.editPart').html(data.result.content);
                    $(that.settings.phone).mask("(999) 999-9999");
                } else {
                    window.alert(data.errorDesc);
                }
            },
            cache: false
        });
    },

    _sendPost: function(sectionHash, form) {
        var  requiredMulty = $( form ).find('.requiredMultySelect'),
             isStopIt = false;
        $.each(requiredMulty, function( index, value ) {
            if (!isStopIt && $(value).find('.field .resultCheckboxes').has('li').length == 0) {
                js_func.confirm(' ', 'Please fill out the required fields marked in red.',
                    (function() {}), (function() {}), {cancel: {class: 'display-none'}});
                isStopIt = true;
            }
        });
        var that = this,
            thisSection    = form.closest('.eachSection'),
            thisMatchesElm = $('#templateMatches');

        if ($(form).parents('.item-top').length == 0) {
            $(form).find('input[type="text"]').each(function(key, elem) {
//                console.log(elem);
                /* elem.value = elem.value.replace(/\./g, '');
                 elem.value = elem.value.replace(/\,/g, '');*/
            });
        }

        if (!isStopIt) {
            $.post('/edit/section/' + sectionHash, form.serialize(),
                function(data) {
                    if (!data.error) {
                        if (that.validate(data, form)) {
                            that.finishSkip('show');
                            thisSection.find('.viewPart').html(data.result.content);
                            thisMatchesElm.html(data.result.matches);
                            thisSection.find('.editPart').empty();
                            thisSection.find('.viewPart').show();
                            document.isStoped = false;
                        } else {
                            document.isStoped = true;
                            $('.ui-pnotify').hide();
                        }
                    } else {
                        document.isStoped = true;
                    }

                    if (data.result.notices) {
                        $.each(data.result.notices, function( index, notice ) {
                            js_func.showMessage(notice, 'notice');
                        });
                    }

                }, 'json').success(function() {
                    if (document.isSubmit != false && !document.isStoped) {
                        var temp = document.isSubmit;
                        document.isSubmit = false;
                        location.href = temp;
                    }
                    document.isProfileChanged = false;
                });
        }

    },

    cancelEdit: function(btn) {
        var thisSection = $(btn).closest('.eachSection');
        thisSection.find('.editPart').empty();
        thisSection.find('.viewPart').show();
        this.finishSkip('show');
        document.isProfileChanged = false;
    },

    finishSkip: function(status) {
        if (this.finishSkipBtns) {
            this.finishSkipBtns[status]();
        }
    },

    validate: function(data, elemHolder) {
        if (data.result.validationErrors) {
            showValidationErrors(data.result.validationErrors, elemHolder);
            return false;
        } else {
            return true;
        }
    }
};