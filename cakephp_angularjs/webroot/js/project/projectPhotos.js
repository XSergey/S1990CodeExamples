
function ProjectPhotos() {

    var uploader = null,
        el = null,
        settings = {
            photoItemHtml: '',
            browseBtn: '',
            containerPhotos: '',
            listPhotosEl: '',
            uploadUrl: '',
            deletePhotoItemUrl: '',
            projectId: null,
            thumbsSize: '60x70'
        },
        init = function(opt) {
            settings = $.extend(settings, opt);
            settings.photoItemHtml = $('#projectPhotoItemTmpl').html();
            var that = this;

            uploader = new plupload.Uploader({
                runtimes : 'gears,html5,flash,silverlight,browserplus',
                browse_button : settings.browseBtn,
                chunk_size: '10mb',
                container : settings.containerPhotos,
                max_file_size : '10mb',
                url : settings.uploadUrl,
                flash_swf_url : '/js/plu_uploader/plupload.flash.swf',
                filters : [
                    {title : "Image files", extensions : "jpg,png,jpeg"}
                ],
                multi_selection: true,
                multipart_params: {
                    'projectId': settings.projectId
                }
            });
            uploader.init();
            uploader.bind('FilesAdded', function(up, files) {
                $.each(files, function(i, file) {
                    var photoTmpl = {
                        size: settings.thumbsSize,
                        fileId: file.id,
                        photoPath: '/in_progress.jpg'
                    }
                    $(settings.listPhotosEl).append($.nano(settings.photoItemHtml, photoTmpl));
                });
                up.start();
            });

            uploader.bind('UploadProgress', function(up, file) {
                $('#progressBarPhoto_' + file.id).css({
                    width: file.percent + '%'
               });
            });

            uploader.bind('Error', function(up, err) {
                window.alert('Error message "Please upload a file type JPG, JPEG, or PNG"');
                up.refresh();
            });

            uploader.bind('FileUploaded', function(up, file, info) {
                var rowProgress = $('#progressBarPhoto_' + file.id),
                    result = $.parseJSON(info.response);
                if (!result.error) {
                    var imgTag = $('#imgPhoto_' + file.id);
                    imgTag.attr('src', '/thumbs/' + settings.thumbsSize + result.photo);
                    imgTag.closest('li').data('photoId', result.photoId);
                } else {
                    window.alert(result.errorDesc);
                }
                rowProgress.fadeOut('fast', function(){ $(this).remove() });
            });
            bindEvents();
        },

        bindEvents = function() {
            // Delete photo
            $(el).on('click', '.deletePhotoItem', function(e){
                e.preventDefault();
                var photoId = $(this).closest('li').data('photoId');
                if (confirm('Are you sure?')) {
                    deletePhoto(photoId, $(this));
                }

            });

        },

        deletePhoto = function(photoId, thisBtn) {
            if (photoId != undefined || photoId != 0) {
                var that = this;
                $.post(settings.deletePhotoItemUrl + '/' + photoId, '',
                    function(data) {
                        if(!data.error) {
                            thisBtn.closest('li').fadeOut().remove();
                        } else {
                            window.alert(data.errorDesc);
                        }
                }, "json");
            }
        }

    return {
        init: init
    }
}