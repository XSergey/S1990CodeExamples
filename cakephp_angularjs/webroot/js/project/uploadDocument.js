var UploadDocument = {

    uploader: null,
    settings: {
        uploadBtnId: 'uploadBtn',
        uploadUrl: '/projects/uploadDocument',
        documentId: 'document',
        dataHolderId: 'dataHolder',
        onError: function(err) {
            $.pnotify(err.message);
        }
    },
    'init': function(opt) {
        var that = this;
        this.settings = $.extend(this.settings, opt);
        this.uploader = new plupload.Uploader({
            runtimes: 'gears,html5,flash,silverlight,browserplus',
            browse_button: that.settings.uploadBtnId,
            chunk_size: '10mb',
            max_file_size: '10mb',
            url: that.settings.uploadUrl,
            multi_selection: false
        });
        this.uploader.init();
        this.uploader.bind('FilesAdded', function(up, files) {
//            $('#' + that.settings.documentId).val(files[0].name);
            that.uploader.start();
        });
        this.uploader.bind('Error', function(up, err) {
            err.up = up;
            UploadDocument.settings.onError(err);
            up.refresh();
        });
        this.uploader.bind('FileUploaded', function(up, file, info) {
            var result = $.parseJSON(info.response);
            if (!result.error) {
                $('#' + that.settings.documentId).val(file.name);
                $('#' + that.settings.dataHolderId).val(result.path);
            } else {
                $.pnotify(result.errorDesc);
            }
        });
    }
};
