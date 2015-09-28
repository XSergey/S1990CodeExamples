angular.module('app').factory('uploaderService', function() {
    var uploader;

    var settings = {
        uploadPhotoUrl: '/account/uploadPhoto',
        uploadBtn: 'uploadFileBtn'
    };

    return {
        init: function(callback, _settings) {
            settings = $.extend(settings, _settings);
            uploader = new plupload.Uploader({
                runtimes: 'gears, html5, flash, silverlight, browserplus',
                browse_button: settings.uploadBtn,
                chunk_size: '1mb',
                max_file_size: '10mb',
                url: settings.uploadPhotoUrl,
                flash_swf_url: '/js/plu_uploader/plupload.flash.swf',
                filters: [
                    {title: "Image files", extensions: "jpg,png,jpeg"}
                ],
                multi_selection: false
            });
            uploader.init();
            uploader.bind('FilesAdded', function(upload) {
                upload.start()
            });
            uploader.bind('FileUploaded', function(up, file, info) {
                var result = $.parseJSON(info.response);
                if (!result.error) {
                    callback(result.photo);
                }
            });
        },

        uploaderInit: function(callback, _settings) {
            settings = $.extend(settings, _settings);
            uploader = new plupload.Uploader({
                runtimes: 'gears, html5, flash, silverlight, browserplus',
                browse_button: settings.uploadBtn,
                chunk_size: '1mb',
                max_file_size: '5mb',
                url: settings.uploadPhotoUrl,
                flash_swf_url: '/js/plu_uploader/plupload.flash.swf',
//                filters : [{title : "Image files", extensions : "jpg,png,jpeg"}],
                multi_selection: false
            });
            uploader.init();
            uploader.bind('FilesAdded', function(upload) {
                upload.start()
            });
            uploader.bind('FileUploaded', function(up, file, info) {
                if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(file.name)) {
                    $('.isEmbed').css('display', 'block');
                }
                var result = $.parseJSON(info.response);
                if (!result.error) {
                    var respObj = {
                        fileUrl: result.url,
                        fileName: result.filename
                    };

                    if (result.pathToFile) {
                        respObj.filePath = result.pathToFile;
                    }

                    callback(respObj);
                }
            });
        },

        allType: function(callback, _settings, start) {
            fileList = '<tr><th colspan="3" class="name-col">Files Name</th></tr>';
            mainList = '<tr><th colspan="3" class="name-col">Files Name</th></tr>';
            settings = $.extend(settings, _settings);
            uploader = new plupload.Uploader({
                runtimes: 'gears, html5, flash, silverlight, browserplus',
                browse_button: 'uploadFileBtn',
                max_file_size: '100mb',
                url: settings.uploadPhotoUrl,
                flash_swf_url: '/js/plu_uploader/plupload.flash.swf'
            });
            uploader.bind('FilesAdded', function(up, files) {
                if (fileList == '') {
                    fileList = mainList;
                }
                plupload.each(files, function(file) {
                    fileList += '<tr id="' + file.id + '"><td class="ico-col"><img src="/img/new/file2.png" alt="">' +
                        '</td><td class="name-col">' +
                        file.name + ' - ' + plupload.formatSize(file.size) + '</td>' +
                        '<td class="upload-col"><a href="#" data-file="' + file.id +
                        '" class="cancel remove_file"></a></td></tr>';
                });
                $('#file_list').html(fileList);
            });

            uploader.bind('UploadProgress', function(up, file) {
                $('#' + file.id + ' .upload-col').html('<img src="/img/new/loader.gif" alt="" width="24" height="24">');
            });

            uploader.init();

            /// start upload
            $('.sbm_upload').click(function() {
                uploader.settings.multipart_params = { path: $('#path').val(), room_id: $('#room_id').val()};
                uploader.start();
                return true;
            });
            /// remove file
            $('#create3').on('click', '.remove_file', function(e) {
                id = $(this).attr('data-file');
                $.each(uploader.files, function(i, file) {

                    if (file && file.id == id) {
                        $('#' + file.id).remove();
                        uploader.removeFile(file);
                    }
                });
                fileList = mainList;
                $.each(uploader.files, function(i, file) {
                    fileList += '<tr id="' + file.id + '"><td class="ico-col"><img src="/img/new/file2.png" alt="">' +
                        '</td><td class="name-col">' +
                        file.name + ' - ' + plupload.formatSize(file.size) + '</td>' +
                        '<td class="upload-col"><a href="#" data-file="' +
                        file.id + '" class="cancel remove_file"></a></td></tr>';
                });
                $('#file_list').html(fileList);
            });
            // cancel upload
            $('.cancel_upload').click(function() {
                uploader.stop();
                $.each(uploader.files, function(i, file) {
                    uploader.removeFile(file);
                });
                fileList = '';
                $('#file_list').html('');
            });

            uploader.bind('FileUploaded', function(up, file, info) {
                $('#' + file.id + ' .upload-col').html('<a href="#" class="done"></a>');
            });

            uploader.bind('UploadComplete', function(up) {
                fileList = mainList;
                $.each(uploader.files, function(i, file) {
                    fileList += '<tr id="' + file.id + '"><td class="ico-col"><img src="/img/new/file2.png" alt="">' +
                        '</td><td class="name-col">' +
                        file.name + ' - ' + plupload.formatSize(file.size) + '</td>' +
                        '<td class="upload-col"><a href="#"  class="done"></a></td></tr>';
                });
                $('#file_list').html(fileList);
                callback($('#path').val());
            });

        }
    };
});