var projectsLogic = {
    loadedFilterTypes: [],
    loadedFilterResults: [],
    config: {
        selectors: {
            projectsListHolder: '#projectContainer'
        },
        url: {
            getFilteredData: '/projects/filter/'
        }
    },

    init: function(){
        var self = this;
        $(document).on('click', this.config.selectors.projectsListHolder + ' [data-action]', function(e){
            var action = $(this).data('action');
            if(typeof self[action] == 'function') {
                self[action](this, e);
            }
        });
    },

    editProject: function(elem){
        elem = $(elem);
        var projectId = elem.data('id'),
            sectionHash = elem.data('sectionHash');

        $.post("/edit/section/"+sectionHash, {projectId: projectId}, function(data) {
            if(!data.error) {
                var parent = elem.closest('.eachSection');

                parent.find('.viewPart').hide();
                parent.find('.editPart').html(data.result.content);
            } else {

            }
        }, "json");
    },

    filterProjects: function(elem){
        var self = this,
            $elem = $(elem),
            requestedDataId = $elem.data('id'),
            targetSections = $elem.attr('href');

        if (this.loadedFilterTypes.indexOf(requestedDataId) === -1) {
            var url = this.config.url.getFilteredData + requestedDataId;

            $.get(url, function(res){
                if (res.content) {
                    self.loadedFilterTypes.push(requestedDataId);
                    self.loadedFilterResults[requestedDataId] = res.content;
                    $(targetSections).html(res.content);
                    $(targetSections).addClass('loaded');
                } else {

                }
            }, 'json');
        }
    }
};
