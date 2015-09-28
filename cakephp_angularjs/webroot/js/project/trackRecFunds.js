
var TR_Funds = {
    settings: {
        el: '#collapseFunds',
        boxFundFields: '#addFundFields'
    },
    init: function(opt) {
        this.settings = $.extend(this.settings, opt);
        this.bindEvents();
    },
    bindEvents: function() {
        var that = this,
            opt = this.settings;
        $(opt.el).on('click', '[data-action]', function(e) {
            e.preventDefault();
            if (typeof that[this.dataset.action] === 'function') {
                that[this.dataset.action](this);
            }
        });
    },
    addFund: function() {
        var that = this,
            dataFields = $(that.settings.boxFundFields).find('input, textarea').serialize();
        $.post("/companies/addTrackRecordFund", dataFields,
            function(data) {
                if(!data.error) {
                    $('#addedFundsList').html(data.content);
                    that.hideAddFund();
                } else {
                    window.alert(data.errorDesc);
                }
        }, "json");
    },
    showAddFund: function(btn) {
        var that = this;
        $('#addFundBtnBox').hide();
        $(that.settings.boxFundFields).slideDown('fast');
    },
    hideAddFund: function() {
        var that = this;
        $('#addFundBtnBox').show();
        $(that.settings.boxFundFields).find('input[type=text]').each(function(){
            $(this).val('');
        });
        $(that.settings.boxFundFields).slideUp('fast');
    },
    deleteFundItem: function(btn) {
        var fundId = $(btn).data('fundId');
        if (confirm('Are you sure?')) {
            $.post("/companies/deleteFund/" + fundId, '',
                function(data) {
                    if(!data.error) {
                        $('#TRFundItem_' + fundId + ', #TRFundItem_' + fundId + 'view').fadeOut('fast', function(){
                            $(this).remove();
                        });
                    } else {
                        window.alert(data.errorDesc);
                    }
            }, "json");
        }
    }
};
