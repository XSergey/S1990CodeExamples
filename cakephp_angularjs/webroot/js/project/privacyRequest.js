var Privacy_requests = {
    settings: {
        el: 'body',
        entityType: null
    },

    init: function(opt) {
        this.settings = $.extend(this.settings, opt);
        this.bindEvents();
    },
    bindEvents: function() {
        var self = this,
            opt = this.settings;
        $(opt.el).on('click', '[data-action]', function(e) {
            e.preventDefault();
            if (typeof self[$(this).data('action')] === 'function') {
                self[$(this).data('action')](this);
            }
        });
    },
    sendRequestView: function(btn) {
        var enityId = $(btn).data('entityId'),
            self = this;
        $.post('/privacy/sendRequestView/' + this.settings.entityType + '/' + enityId, '',
            function(data) {
                if (!data.error) {
                    $.pnotify({text: 'Your request has been sent to the owner of this profile. You will be e-mailed when you have been granted access.'});
                } else {
                    $.pnotify({text: data.errorDesc});
                }
            }, 'json');
    }
};
