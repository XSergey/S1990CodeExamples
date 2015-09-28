$.getScript('/theme/Realconnex/js/project/ga_config.js', function()
{
    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    ga('create', GoogleAnalytics.trackingID, { 'cookieDomain': GoogleAnalytics.cookieDomain });
    ga('send', 'pageview');

    /*ga('create', 'UA-50093875-4', {'cookieDomain': 'realconnex.com'});
     ga('send', 'pageview');*/


    var googleEventTracking = {
        category: {
            homepage: 'homepage',
            searchTypeFilter: 'search Type Filter',
            searchFilter: 'search Filter',
            footer: 'footer'
        },
        action: {
            click: 'click',
            login: 'login',
            share: 'share',
            roles: 'roles',
            sign_up: 'sign_up',
            perform: 'perform',
            video_play: 'video_play'
        },
        label: {
            button: 'button',
            failing_login: 'failing_logging'
        }

    }

    jQuery(document).ready(function() {
        $('.footerLink').click(function() {
            ga('send', 'event',
                googleEventTracking.category.footer,
                googleEventTracking.action.click,
                $(this).text());
        });

        $('#mainSearchItems .searchTreeFilter').click(function() {
            var filter = $(this).find('img')[0];
            ga('send', 'event',
                googleEventTracking.category.searchTypeFilter,
                googleEventTracking.action.perform,
                $(filter).attr('alt')
            );
        });

        $('#initSearchForm').on('click', '#secondSearchItems .searchTreeFilter, #thirdSearchItems .searchTreeFilter, #fourthSearchItems .searchTreeFilter',
            function (){
                var filter = $(this).find('.hold strong span').html();
                ga('send', 'event',
                    googleEventTracking.category.searchTypeFilter,
                    googleEventTracking.action.perform,
                    filter
                );
            }
        );


        $('#searchFilters .specialSelect').click(function() {
            if (!$(this).hasClass('active')) {
                var filter = $(this).parents('.field').children('label').html();
                ga('send', 'event',
                    googleEventTracking.category.searchFilter,
                    googleEventTracking.action.perform,
                    filter
                );
            }
        });

        $('#searchFilters .well input:checkbox').click(function() {

            var filter = $(this).parents('.field').children('label').html();
            ga('send', 'event',
                googleEventTracking.category.searchFilter,
                googleEventTracking.action.perform,
                filter
            );
        });

        $('#searchFilters input:radio, #searchFilters input:checkbox').click(function() {

            var filter = $(this).siblings('label').html();
            ga('send', 'event',
                googleEventTracking.category.searchFilter,
                googleEventTracking.action.perform,
                filter
            );

        });
    });
});


