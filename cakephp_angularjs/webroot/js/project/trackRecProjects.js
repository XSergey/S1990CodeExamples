
var TR_Projects = {
    settings: {
        el: '#collapseProjects',
        boxProjFields: '#addProjectFields'
    },
    init: function(opt) {
        this.settings = $.extend(this.settings, opt);
        this.bindEvents();
    },
    bindEvents: function() {
        var that = this,
            opt = this.settings;
        $(opt.el).on('click', '[data-action]', function(e) {
            e.preventDefault();
            if (typeof that[this.dataset.action] === 'function') {
                that[this.dataset.action](this);
            }
        });
        that.initAddressAutocomplete();
    },
    addProject: function() {
        var that = this,
            dataFields = $(that.settings.boxProjFields).find('input, textarea').serialize();
        $.post("/companies/addTrackRecordProject", dataFields,
            function(data) {
                if(!data.error) {
                    $('#addedProjectsList').html(data.content);
                    that.hideAddProject();
                } else {
                    window.alert(data.errorDesc);
                }
        }, "json");
    },
    showAddProject: function(btn) {
        var that = this;
        $('#addProjectBtnBox').hide();
        $(that.settings.boxProjFields).slideDown('fast', function(){
            $('#TrackRecordProjectsDatePurchased').datepicker({
                format: 'yyyy-mm-dd'
            });
            $('#TrackRecordProjectsDateSold').datepicker({
                format: 'yyyy-mm-dd'
            });
        });
    },
    hideAddProject: function() {
        var that = this;
        $('#addProjectBtnBox').show();
        $(that.settings.boxProjFields).find('input[type=text]').each(function(){
            $(this).val('');
        });
        $(that.settings.boxProjFields).slideUp('fast', function(){

        });
    },
    deleteProjItem: function(btn) {
        var projId = $(btn).data('projId');
        if (confirm('Are you sure?')) {
            $.post("/companies/deleteProject/" + projId, '',
                function(data) {
                    if(!data.error) {
                        $('#TRProjItem_' + projId + ', #TRProjItem_' + projId + 'view').fadeOut('fast', function(){
                            $(this).remove();
                        });
                    } else {
                        window.alert(data.errorDesc);
                    }
            }, "json");
        }
    },
    togglePhotoProj: function(btn) {
        // Dirty hack. Because TR has no effect slide
        var trPhotos = $(btn).closest('tr').next('tr');
        if (trPhotos.is(':hidden')) {
            trPhotos.show().find('td > .photosDiv').slideDown('fast')
        } else {
            trPhotos.find('td > .photosDiv').slideUp('fast', function(){
                trPhotos.hide();
            });
        }
    },
    initAddressAutocomplete: function () {
        var inputField = document.getElementById('projAddr');
        var options = {
            types: ['(cities)'],
            componentRestrictions: {country: 'us'}
        };
        var autocomplete = new google.maps.places.Autocomplete(inputField, options);
        google.maps.event.addListenerOnce(autocomplete, 'place_changed', function() {
            var place = autocomplete.getPlace();
        });
    }
};
