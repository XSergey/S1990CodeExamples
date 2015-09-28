/**
 * Created by alex-lens on 10.01.15.
 */

var deleteCompanyBtn,
    isReadyCompanies = false;

function validateDomain(domain) {
    var re = /\S+\.\S+/;
    return re.test(domain);
}

function saveDataFromPopup() {
    var companiesArr = $('.popup .yes-no-list'), arrId, currentRow, inputs;
    if (companiesArr.length > 0) {
        $.each(companiesArr, function( index, element ) {
            arrId = $(element).data('arrId');
            inputs = $(element).find(':input');
            currentRow = $( "#company" + arrId );
            $(currentRow).html(inputs);
        });
    }
    $('.saveBasic').click();
    $('.fancybox-close').click();
}

$(function() {

    $('.popup').on('click', ".companyConfirm", function () {
        var innerSection = $(this).siblings('.inner-list');
        $(innerSection).removeClass('display-none');
        $(innerSection).addClass('checked');
        $(innerSection).find('.radio:first').click();
    });

    $('.popup').on('click', ".companyNotConfirm", function () {
        var innerSection = $(this).parents('.yes-no-list').find('.inner-list');
        $(innerSection[0]).addClass('display-none checked');
    });

    $('.popup').on('click', ".sbm", function () {

        if ($('.companyConfirm:checked').length > 0 &&  $('#companiesPopup select option[value=0]:selected').length != 0) {
            $.pnotify({ text: 'You need choose company roles of each companies' });
        } else if ($('.popup .data-form').length - 1 !== $('.checked').length) {
                $.pnotify({ text: 'You need make one\'s choice for proceed creating companies !!!' });
        } else {
            isReadyCompanies = true;
            saveDataFromPopup();
        }
    });

    $('.saveBasic').click(function(e) {
        var newCompanyRows = $('.company-id.notEmpty[value=""]'),
            innerHtml = '';

        if (newCompanyRows.length > 0 && !isReadyCompanies) {
            e.preventDefault();
            var tmpl = '', data = {};
            $.each(newCompanyRows, function( index, element ) {
                tmpl = document.getElementById('list-template').innerHTML;
                data = { companyTitle: $(element).siblings('.txt').val(), i: $(element).data('arrId'), domain: userDomain };
                innerHtml += _.template(tmpl, data);
            });

            $('.popup #innerHtml').html(innerHtml);
            $('select.styled').selectbox();

            $.fancybox({
                'padding'			: 0,
                'autoScale'			: true,
                'autoDimensions'    : true,
                'transitionIn'		: 'none',
                'transitionOut'		: 'none',
                'scrolling'   		: 'auto',
                'href' : '#companiesPopup'
            });

        } else {
            return true;
        }
        return false;
    });

    $('#add-company').click(function (e) {
        e.preventDefault();
        var NumberOfCompanies = $('.company').length,
            currentNumber = NumberOfCompanies + 1;
        if (NumberOfCompanies < 5) {
            var tmpl = document.getElementById('company-row-template').innerHTML,
                data = { i: currentNumber},
                html = _.template(tmpl, data);
            $('.add-company-row').before(html);
            if (currentNumber == 5) {
                $('.add-company-row .note-text').html('You can only be associated with 5 companies at' +
                ' a time.<br> Please remove a company if you wish to be associated with another company.');
                $('#add-company').addClass('display-none');
            }
        }
    });

    function deleteCompany() {
        var companyId = $(deleteCompanyBtn).siblings('.company-id').val(),
            companyRow = $(deleteCompanyBtn).parent('.row.company');
        $.ajax({
            url: "/companies/deleteCompany/" + companyId,
            type: 'POST',
            dataType: "json",
            success: function (res) {
                if (!res.error) {
                    companyRow.remove();
                    $('.add-company-row .note-text').html('Your Company details are shown on the next tab');
                    $('#add-company').removeClass('display-none');
                } else {
                    $.pnotify({ text: res.errorDesc });
                }
            }
        });
    }

    $('.delete-company').click(function() {
        deleteCompanyBtn = $(this);
        var companyTitle = $(deleteCompanyBtn).siblings('.txt').val();
        js_func.confirm('Confirmation Needed', 'Are you sure want delete company <strong>' +
            companyTitle + '</strong> ?',
            (deleteCompany), (function() {}));
    });

    $('.editPart').on('focus', ".company-autocomplete", function () {
        var  that = this;
        $(this).autocomplete({
            source: function (request, response) {
                $.ajax({
                    url: "/company/getFilteredCompanies",
                    type: 'POST',
                    dataType: "json",
                    data: {
                        companyName: request.term
                    },
                    success: function (data) {
                        if (!data.companies) {
                            $(that).siblings('.company-id').val('');
                            $(that).siblings('.company-id').addClass('notEmpty');
                        }
                        response(data.companies);
                    }
                });
            },
            minLength: 2,
            select: function (event, data) {
                if (data.item) {
                    $(this).val(data.item.label);
                    $(this).siblings('.company-id').val(data.item.value);
                }

                return false;
            },
            open: function () {
                $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
            },
            close: function () {
                $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
            }
        });
    });
});
