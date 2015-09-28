var UploadPhotos = {
    uploader: null,
    settings: {
        size: '189x189',
        uploadBtnId: 'uploadAvaBtn',
        container: 'uploadedFile',
        uploadPhotoUrl: '/account/uploadPhoto',
        progressBar: '#progressPhoto',
        progressBarWrap: '#progressBarAva',
        photoId: '#avatarImg',
        dataHolder: '#dataHolder'
    },
    init: function(opt) {
        var that = this;
        that.settings = $.extend(this.settings, opt);
        // Fixed bug #11710. Bug fires if there are more than one inits on the same page !!!
        $('#' + this.settings.uploadBtnId).data('settings', $.extend([], this.settings));
        //  !!!
        this.uploader = new plupload.Uploader({
            runtimes: 'gears,html5,flash,silverlight,browserplus,html4',
            browse_button: that.settings.uploadBtnId,
            chunk_size: '10mb',
            container: that.settings.container,
            max_file_size: '10mb',
            url: that.settings.uploadPhotoUrl,
            flash_swf_url: 'theme/Realconnex/js/plu_uploader/plupload.flash.swf',
            silverlight_xap_url: 'theme/Realconnex/js/plu_uploader/plupload.silverlight.xap',
            filters: [
                {title: "Image files", extensions: "jpg,png,jpeg"}
            ],
            multipart_params: {
                id: $('#' + that.settings.uploadBtnId).data('id')
            },
            multi_selection: false
        });
        this.uploader.init();
        this.uploader.bind('FilesAdded', function(up, files) {
            $.each(files, function(i, file) {
                $(that.settings.progressBar).css({width: '1%'});
                $(that.settings.progressBarWrap).show();
            });

            up.start();
        });

        this.uploader.bind('UploadProgress', function(up, file) {
            $(that.settings.progressBar).css({width: file.percent + '%'});
        });

        this.uploader.bind('Error', function(up, err) {
            if (err.code == plupload.INIT_ERROR) {
                console.log(err);
                $.pnotify('Please install or activate flash player');
            } else {
                $.pnotify(err.message);
            }
            up.refresh();
        });

        this.uploader.bind('FileUploaded', function(up, file, info) {
            var result = $.parseJSON(info.response);
            // Fixed bug #11710 !!!
            var data = $('#' + this.settings.browse_button).data();
            if (!result.error) {
                var imgTag = $(data.settings.photoId),
                    dataHolder = $(data.settings.dataHolder);
                if (data.settings.size !== null) {
                    imgTag.attr('src', '/thumbs/' + data.settings.size + result.photo);
                    $('#clearAvaBtn').css('display', 'block');
                } else {
                    imgTag.attr('src', result.photo);
                }
                if (dataHolder.length > 0) {
                    dataHolder.val(result.photo);
                }
            } else {
                window.alert(result.errorDesc);
            }
            $(data.settings.progressBarWrap).fadeOut('normal');
            $(data.settings.progressBar).css({width: '1%'});
        });
    }
};