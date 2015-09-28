/**
 * Created by Alex Lens on 14.11.14.
 */
var EntityLightHouseSearch = {
    settings: {
        validateClass: '.required-l',
        switchButton: '.switchVisibility'
    },
    init: function(opt) {
        this.settings = $.extend(this.settings, opt);
        this.bindEvents();
        this.onChangeVisibilityStatus();
    },
    bindEvents: function() {
        var that = this,
            opt = this.settings;

        $(opt.switchButton).click(function() {
            var currentVisibilityStatus = $(this).data('searchStatus'),
                requestVisibilityStatus = currentVisibilityStatus == 1 ? 0 : 1,
                self = this,
                errorText;
            if (requestVisibilityStatus == '0' || that.validate()) {

                js_func.confirm('Confirmation needed.', 'Are you sure want to switch ' + (requestVisibilityStatus == 1 ? 'on' : 'off') + ' Lighthouse search?', function() {
                    $.post('/' + that.settings.type + '/switchVisibility/' + entityID + '/' + requestVisibilityStatus, {}, function(res) {
                        if (res.error === false) {
                            if (res.data) {
                                $('#templateMatches').html(res.data.count);
                                $('.schedule').data('templateId', res.data.id);
                                $('#templateMatches').attr('href', '/search?template=' + res.data.id);
                            }
                            $('#myonoffswitch_').prop('checked', requestVisibilityStatus);
                            $('.switchVisibility').data('visibilityStatus', requestVisibilityStatus);
                            $(self).data('searchStatus', requestVisibilityStatus);
                            that.onChangeVisibilityStatus();
                            $.pnotify({text: requestVisibilityStatus == 1 ? 'Posting activated' : 'Posting deactivated'});
                        } else {
                            var errText = 'Error occurred... please try again';
                            if (res.errorDesc) {
                                errText = res.errorDesc;
                            }
                            $.pnotify({text: errText});
                        }
                    }, 'json');
                });
            } else {
                errorText = 'Please fill out the required fields marked in red.';
                if (typeof(LSWithRequirement) != 'undefined') {
                    errorText = 'Please fill out the required fields marked in red.<br> <strong class="red">Please make sure to add a requirement.</strong>';
                }
                js_func.confirm(' ', errorText,
                    (function() {
                    }), (function() {
                    }), {cancel: {class: 'display-none'}});
            }
        });

        $('.schedule').change(function() {
            var schedule = $(this).val(),
                templateID = $(this).data('templateId');

            if (templateID != '') {
                $.post('/projects/setEntitySchedule/' + templateID + '/' + schedule, {}, function(res) {
                    if (res.error === false) {
                        $.pnotify({text: 'Posting search schedule was changed success'});
                    } else {
                        $.pnotify({text: 'Error occurred... please try again'});
                    }
                }, 'json');
            } else {
                $.pnotify({text: 'Your project lighthouse search not activated yet'});
            }
        });
    },

    validate: function() {
        $('.item-top .sbm, .item-content .sbm').click();
        var required = $('#projectInfoContainer .empty-required');
        if (required.length > 0) {
            $.each(required, function(index, elem) {
                $(elem).parent('.required-l').html('<span class="empty-required required">Please fill out this field.</span>');
            });
            return false;
        } else {
            if (typeof(LSWithRequirement) != 'undefined' && $('#req-quantity').html() < 1) {
                return false;
            }

            return true;
        }
    },

    onChangeVisibilityStatus: function() {
        if ($('#myonoffswitch_').prop('checked')) {
            $('#post-off-notice').addClass('display-none');
            $('#tooltip-search-text').html('1) This posting AND all associated requirements are searchable by other' +
                ' members.<br>2) You will be notified of matches.');
            $('.search-btn-new').addClass('selected');
        } else {
            if ($('.switchVisibility').data('visibilityStatus') == 0) {
                $('#post-off-notice').removeClass('display-none');
                $('#tooltip-search-text').html('1) This posting AND all associated requirements are no longer searchable by' +
                ' other members.<br>2) You will no longer be notified of matches.');
            } else {
                $('#tooltip-search-text').html('1) This posting AND all associated requirements are searchable by other' +
                ' members.<br>2) You will be notified of matches.');
            }

            $('.search-btn-new').removeClass('selected');
        }
    }
};