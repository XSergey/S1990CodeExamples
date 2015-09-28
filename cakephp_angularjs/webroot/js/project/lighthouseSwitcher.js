/**
 *
 * Created by developer on 09.01.15.
 */
var LighthouseSwitcher = {

    settings: {
        switcher: '.popup .switcher',
        switchIcon: '.search-btn',
        checkbox: '#myonoffswitch'
    },
    init: function(opt) {
        this.settings = $.extend(this.settings, opt || {});
        this.bindEvents();
    },
    bindEvents: function() {

        var that = this,
            opt = this.settings;

        //init switcher
        $(opt.checkbox).prop('checked') ? $(opt.switchIcon).addClass('selected') : $(opt.switchIcon).removeClass('selected');

        $(opt.switcher).click(function() {
            var current = $(opt.checkbox).prop('checked');
            js_func.confirm('Confirmation needed.', 'Are you sure want switch ' + (current ? 'off' : 'on') + ' Lighthouse search?', function() {
                that.switchLighthouse.apply(that, [!current]);
            });
        });
    },
    switchLighthouse: function(status) {
        var opt = this.settings;
        $(opt.checkbox).prop('checked', status);
        status ? $(opt.switchIcon).addClass('selected') : $(opt.switchIcon).removeClass('selected');
    }

}
