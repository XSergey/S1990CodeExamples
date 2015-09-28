/**
 * Created by Alex Lens
 * Date: 04.12.14.
 */
    var currentAdminEmailElm,
        timer;
        timeout = 300;

    var companyAdminManagment = {
        settings: {
            addBtn: '.add-admin',
            saveBtn: '.saveBasic',
            deleteBtn: '.delete-admin',
            editSection: '.contact',
            errorValidClass: 'errorValid'
        },
        userExist: '',
        currentAdminEmailElm: '',
        init: function(opt) {
            this.settings = $.extend(this.settings, opt);
            this.bindEvents();
        },
        bindEvents: function() {
            var that = this,
                opt = this.settings;

            $(opt.addBtn).click(function(e) {
                e.preventDefault();
                $('.add-admin-row').before('<div class="row admin-row"> <em class="ico"></em>' +
                    '<input name="data[Company][CompaniesUser][' + $('.admin-row').length +
                    '][user_email]" placeholder="Admin email" class="txt admin-input" value="" type="email">' +
                    '<a class="delete delete-admin" href="javascript:">' +
                    '<i class="fa fa-trash-o" style="margin: 9px 0 0 10px;"></i></a></div>'
                );
            });
            $(opt.editSection + ' ' + opt.saveBtn).click(function(e) {
                var adminElm = $('.admin-input'),
                    readyForSave = true;
                $.each(adminElm, function(index, element) {
                    if (!that.validEmail($(element).val())) {
                        if (readyForSave) {
                            that.showError('Email not valid', $(element));
                        } else {
                            $(element).addClass(that.settings.errorValidClass);
                        }
                        readyForSave = false;
                    } else {
                        if (!$(element).data('exist')) {
                            if (readyForSave) {
                                that.showError('This e-mail is not currently registered in the system. Please have the ' +
                                'member register with this e-mail address and then you can add them as the admin.', $(element));
                            } else {
                                $(element).addClass(that.settings.errorValidClass);
                            }
                            readyForSave = false;
                        }
                    }
                });
                return readyForSave;
            });

            $(opt.editSection).on('keyup', '.admin-input', function() {
                clearTimeout(timer);
                var adminEmailElm = $(this),
                    adminEmail = $(adminEmailElm).val();

                if (that.validEmail(adminEmail)) {
                    timer = setTimeout(function() {
                        $.when(that.checkEmailExist(adminEmail)).then(function() {
                            if (!that.userExist) {
                                adminEmailElm.data('exist', 0);
                            } else {
                                adminEmailElm.data('exist', 1);
                            }
                        });
                    }, timeout);

                }
            });

            $(opt.editSection).on('click', opt.deleteBtn, function(e) {
                e.preventDefault();
                var adminEmailElm = $(this).siblings('.admin-input'),
                    adminEmail = $(adminEmailElm).val(),
                    adminId = $(this).data('adminId');
                if (adminId) {
                    currentAdminEmailElm = adminEmailElm;
                    js_func.confirm('Confirmation Needed', 'Are you sure want delete this admin?',
                        (that.deleteAdmin), (function() {}));
                } else {
                    $(adminEmailElm).parent('.row').remove();
                }
            });


        },


        deleteAdmin: function() {
            var adminId = $(currentAdminEmailElm).siblings('.delete-admin').data('adminId');

            $.post('/company/deleteAdmin/' + adminId + '/' + window.companyId, {}, function(res) {
                if (res.error === false) {
                    $(currentAdminEmailElm).parent('.row').remove();
                } else {
                    $.pnotify({ text: 'Error occurred... please try again' });
                }
            }, 'json');
        },

        checkEmailExist: function(email) {
            var that = this;
            return $.post('/company/checkUserExist', {'email': email}, function(res) {
                if (res.error === false) {
                    that.userExist = res.exist;
                } else {
                    this.showError('Error occurred when checking user email');
                }
            }, 'json');
        },

        showError: function(msg, elem) {
            if (typeof elem != 'undefined') {
                elem.addClass(this.settings.errorValidClass);
            }
            $.pnotify({ text: msg });
        },

        validEmail: function(email) {

            var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return pattern.test(email);
        }
    };
