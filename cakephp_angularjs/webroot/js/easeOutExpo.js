$(function(){
    var style = 'easeOutExpo';
    var default_left = Math.round($('.sub-menu li.active').offset().left - $('.sub-menu ul').offset().left);
    var default_top = '0'; /* 30 - indentation from the menu */
    var default_width = $('.sub-menu li.active').outerWidth();

    $('#border').css({left: default_left, top: default_top, width: default_width});

    $('.sub-menu li')
        .hover(function () {
            left = Math.round($(this).offset().left - $('.sub-menu ul').offset().left);
            width = $(this).outerWidth();
            $('#border').stop(false, true).animate({left: left, width: width},{duration:500, easing: style});
        })
        .click(function () {
            $('.sub-menu li').removeClass('active');
            $(this).addClass('active');
        });

    $('.sub-menu ul').mouseleave(function () {
        default_left = Math.round($('.sub-menu li.active').offset().left - $('.sub-menu ul').offset().left);
        default_width = $('.sub-menu li.active').outerWidth();
        $('#border').stop(false, true).animate({left: default_left, width: default_width},{duration:1500, easing: style});
    });
});

