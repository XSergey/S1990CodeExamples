window.ajaxUIBloced = true;
$(document).ajaxStart(function() {
    if (ajaxUIBloced === false) {
        $.blockUI(
            {
                baseZ: 9000,
                message: false
            }
        );
    }
}).ajaxStop($.unblockUI);

function showValidationErrors(validationErrors, formEl) {
    formEl.find('.error-message').remove();
    $.each(validationErrors, function(model, fields) {
        $.each(validationErrors[model], function(field, error) {
            var errorObj = $('<span>', {'class': 'error-message'}).html(error);
            formEl.find('*[name="data[' + model + '][' + field + ']"]').parent().append(errorObj);
        });
    });
}

function ajaxLoader(state) {
    if (state == 'show') {
        $.blockUI({baseZ: 9000, message: false});
    } else {
        $.unblockUI();
    }
}

jQuery.expr[':'].icontains = function(a, i, m) {
    return jQuery(a).text().toUpperCase()
            .indexOf(m[3].toUpperCase()) >= 0;
};

function ajaxBlockDiv(divEl) {
    divEl.block({
        message: '<img src="/img/ajax/loaderLine.gif"/>',
        css: {
            border: '1px solid #aaa'
        },
        overlayCSS: {
            backgroundColor: '#fff',
            opacity: 0.2,
            cursor: 'wait'
        }
    });
}

var LeftRightAnimate = function() {
    var currentCount = 1,
        settings = {
            animateEl: '#lorem',
            maxAnimate: 2,
            horizontalWidth: 20
        },
        init = function(opt) {
            settings = $.extend(settings, opt);
            $(settings.animateEl).css({'position': 'relative'});
            setTimeout(beeRight, 1000);
        };

    function beeLeft() {
        $(settings.animateEl).each(function() {
            $(this).stop();
            $(this).animate({left: '-=' + settings.horizontalWidth}, 500, 'swing', beeRight);
        });
    }

    function beeRight() {
        if (currentCount <= settings.maxAnimate) {
            currentCount++;
            $(settings.animateEl).each(function() {
                $(this).stop();
                $(this).animate({left: '+=' + settings.horizontalWidth}, 500, 'swing', beeLeft);
            });
        }
    }

    return {
        init: init
    };
};

(function(b) {
    b.nano = function(c, e) {
        return c.replace(/\{([\w\.]*)\}/g, function(c, f) {
            var d = f.split('.'), a = e[d.shift()];
            b.each(d, function() {
                a = a[this];
            });
            return null === a || void 0 === a ? '' : a;
        });
    };
})(jQuery);

function getURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
    return false;
}


function GeoLocations() {
    jeoquery.defaultData.userName = 'VTdeveloper';
    var settings = {
            countryIso: 'US',
            inputId: null,
            callBack: false,
            scopeParent: false,
            modelName: 'Location',
            isArrayData: false,
            defaultValue: ''
        },

        init = function(opt) {
            settings = $.extend(settings, opt);
            var locId = 'LocationsData_' + settings.inputId.replace('#', '');
            $(settings.inputId).jeoCityAutoComplete({
                country: settings.countryIso,
                callback: function(city) {
                    $('#' + locId).val(city.geonameId);
                    if (settings.callBack && typeof(settings.callBack) === 'function') {
                        settings.callBack($('#' + locId), settings.scopeParent);
                    }
                }
            });

            $(settings.inputId).focusout(function() {
                if ($(this).val() === '') {
                    $('#' + locId).val('');
                }
            });

            var addArr = (settings.isArrayData) ? '[]' : '';

            var input = $('input[name="data[' + settings.modelName + '][' + settings.dataName + ']"]');

            if (input.length == 0) {
                $(settings.inputId).after('<input type="hidden" name="data[' + settings.modelName + '][' + settings.dataName + ']' + addArr + '" value="' + settings.defaultValue + '" id="' + locId + '"/>');
            }
        };

    return {
        init: init
    };
}

function GeoCoverages() {
    var settings = {
            geoContainerId: null,
            dataName: 'geoId',
            listLocations: []
        },

        currentIndex = 0,
        geoStorage = [],

        init = function(opt) {
            settings = $.extend(settings, opt);
            settings.listLocations = (settings.listLocations.length < 1) ? [''] : settings.listLocations;
            for (var geoId in settings.listLocations) {
                if (settings.listLocations.hasOwnProperty(geoId)) {
                    geoStorage.push(settings.listLocations[geoId]);
                }
            }
            generateInputs();
            bindEvents();
        };

    rndPrefix = function() {
        var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        return randLetter + Date.now();
    };

    bindEvents = function() {
        $(settings.geoContainerId).on('click', '.addLocationCover', function(e) {
            e.preventDefault();
            addLocationInput($(this));
        });
        $(settings.geoContainerId).on('click', '.delLocationCover', function(e) {
            e.preventDefault();
            delLocationInput($(this));
        });
    };

    generateInputs = function() {
        var indexItem, dataTpl = {}, newItemTpl = '', delSpan = '', itemsLength = geoStorage.length,
            del = (itemsLength > 1) ? '<span class="delLocationCover"><img src="/img/new/trash.png" alt=""/></span>' : '',
            tplItem = $('#geoLocationsTemplate').html(), allItemsHtml = '';

        for (indexItem = currentIndex; indexItem < itemsLength; ++indexItem) {
            delSpan = (indexItem == 0) ? '' : del;
            dataTpl = {
                delBtn: delSpan,
                prefix: rndPrefix(),
                geoId: getKeyByValue(settings.listLocations, geoStorage[indexItem]),
                nameGeo: settings.dataName,
                valInput: geoStorage[indexItem]
            };
            newItemTpl = $.nano(tplItem, dataTpl);
            allItemsHtml += newItemTpl;
        }
        currentIndex = indexItem;
        $(settings.geoContainerId).append(allItemsHtml);
        $(settings.geoContainerId).find('.geoLocInput:not(.ui-autocomplete-input)').each(function() {
            var thisId = this.id,
                geoId = $(this).data('geonameId');
            GeoLocations().init({
                isArrayData: true,
                inputId: '#' + thisId,
                dataName: settings.dataName,
                defaultValue: geoId
            });
        });
    };

    getKeyByValue = function(from, val) {
        for (var prop in from) {
            if (from.hasOwnProperty(prop) && from[prop] === val) {
                return prop;
            }
        }
        return false;
    };

    addLocationInput = function(btn) {
        geoStorage.push('');
        generateInputs();
    };

    delLocationInput = function(btn) {
        geoStorage.pop();
        currentIndex = geoStorage.length;
        btn.closest('.locationCover').remove();
    };

    return {
        init: init
    };
}

function isIE() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);

    return (msie > 0) || isIE11;
}

function elementInViewport(el, side) {
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;
    var positions = {top: false, bottom: false, left: false};

    while (el.offsetParent) {
        el = el.offsetParent;
        top += el.offsetTop;
        left += el.offsetLeft;
    }
    // 61 (px) : footer height
    if (side) {
        positions.top = !(top >= window.pageYOffset);
        positions.bottom = !((top + height + 61) <= (window.pageYOffset + window.innerHeight));
        positions.left = !(left >= window.pageXOffset);
        positions.right = !((left + width) <= (window.pageXOffset + window.innerWidth));
        return positions;
    }

    return (
    top >= window.pageYOffset && left >= window.pageXOffset &&
    (top + height + 61) <= (window.pageYOffset + window.innerHeight) &&
    (left + width) <= (window.pageXOffset + window.innerWidth)
    );
}

(function($) {
    $(document).on('mouseover', '[data-title]', function() {
        var tooltip = $.pnotify({
            text: $(this).data('title'),
            hide: false,
            buttons: {closer: false, sticker: false},
            history: {history: false},
            animate_speed: 100,
            opacity: .9,
            stack: false,
            auto_display: false
        });

        $(this).mouseout(function() {
            tooltip.remove();
        });

        $(this).mousemove(function() {
            tooltip.css({
                'top': event.clientY - 10,
                'left': event.clientX / 1.2
            });
        });

        $('#_save-search').click(function() {
            $('#save-search').click();
        });
    });

})(jQuery);

jQuery(document).ready(function() {
    $('.documentLoading').removeClass('documentLoading');
});


document.isSubmit = false;
document.isProfileChanged = false;

$(function() {
    $('#content').on('change', 'input', function() {
        document.isProfileChanged = true;
    });
});

function closePopup() {
    $('.fancybox-close').click();
}

$(document).on('click', '.is_edit', function() {
    var obj = $(this);
    var is_edit = true;
    if (document.isProfileChanged) {
        $.each($('.editPart'), function(k, v) {
            if ($(v).html().length > 0) {
                is_edit = false;
                js_func.confirm('Confirmation Needed', 'You have unsaved changes to your profile, do you want to save them?',
                    (function() {
                        document.isSubmit = obj.attr('href');
                        $('input[type=submit].sbm[value="Save"]').trigger('click', {path: obj.attr('href')});
                    }), (function() {
                        location.href = obj.attr('href');
                    }));
            }
        });
    }

    return is_edit;
});
var js_func = {
    confirm: (function(title, text, funct, cancel, opt) {
        title = title || 'Success';
        text = text || '';

        (new PNotify({
            title: title,
            text: text,
            icon: 'glyphicon glyphicon-question-sign',
            hide: false,
            addClass: 'tug',
            confirm: {
                confirm: true,
                buttons: [
                    {
                        text: 'Ok',
                        addClass: 'sbm btn-confirm confirm'

                    },
                    {
                        text: 'Cancel',
                        addClass: (typeof opt !== "undefined") ? opt.cancel.class : 'sbm btn-confirm cancel'
                    }
                ]
            },
            buttons: {
                closer: false,
                sticker: false
            },
            history: {
                history: false
            }
        })).get().on('pnotify.confirm', function(notice) {
                funct();
            }).on('pnotify.cancel', function() {
                if (typeof cancel !== 'undefined' && typeof cancel == 'function')
                    cancel();
            });
    }),
    msgBox: (function(title, text) {
        title = title || 'Success';
        text = text || '';

        (new PNotify({
            title: title,
            text: text,
            icon: 'glyphicon glyphicon-question-sign',
            hide: false,
            addClass: 'tug',
            confirm: {
                confirm: true,
                buttons: [
                    {
                        text: 'Close',
                        addClass: 'sbm btn-confirm confirm'

                    },
                    {
                        text: 'Cancel',
                        addClass: 'hide'
                    }
                ]
            },
            buttons: {
                closer: false,
                sticker: false
            },
            history: {
                history: false
            }
        }));
    }),
    showMessage: (function(text, type, title) {
        title = title || '';
        $.pnotify({
            title: title,
            text: text,
            type: type,
            before_open: function(pnotify) {
                pnotify.css({
                    "left": ($(window).width() / 2) - (pnotify.width() / 2)
                });
            }
        });
    })
};


