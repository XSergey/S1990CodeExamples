/*
 * Author: v.jelev
 * Email: ivan@vizualtech.com
 */

(function ($) {
    $(document).ready(function () {

        window.assetStrategies = {
            config: {
                url: '/innerApi/getAssetStrategies.json'
            },

            getList: function (checkedSubroles, callback, role) {
                var data = {'checkedSubroles': checkedSubroles};
                if (typeof role !== 'undefined')
                    data.role = role;
                $.post(this.config.url, data, callback, 'json');
            }
        };
    });
})(jQuery);