var Privacy_fields = {
    settings: {
        el: 'body'
    },

    init: function(opt) {
        this.settings = $.extend(this.settings, opt);
        this.bindEvents();
    },
    bindEvents: function() {
        var self = this,
            opt = this.settings;
        $(opt.el).on('change', '.privacyFieldCheckbox', function() {
            window.ajaxUIBloced = true;
            $(this).parent().toggleClass('openLock');
            self.checkboxFieldSave(this);
            window.ajaxUIBloced = false;
        });
        $(opt.el).on('change', '.privacyCheckbox', function() {
            $(this).parent().toggleClass('openLock');
        });
        $(opt.el).on('click', '.requestPrivacyField', function(e) {
            e.preventDefault();
            self.sendRequestViewing(this);
        });
    },
    checkboxFieldSave: function(checkbox) {
        var isCheck = checkbox.checked,
            privacyHash = (isCheck) ? $(checkbox).data('hash1') : $(checkbox).data('hash2');
        if (privacyHash) {
            $.post('/privacy/savePrivacyField/' + privacyHash, '',
                function(data) {
                    if (data.error) {
                        $.pnotify(data.errorDesc);
                    }
                }, 'json');
        }
    },

    sendRequestViewing: function(btn) {
        var privacyHash = $(btn).data('hash');
        $.post('/privacy/sendRequestViewField/' + privacyHash, '',
            function(data) {
                if (!data.error) {
                    $.pnotify('Request sent successfully');
                } else {
                    $.pnotify(data.errorDesc);
                }
            }, 'json');
    }
};
