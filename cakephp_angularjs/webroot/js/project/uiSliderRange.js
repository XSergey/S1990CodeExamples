var uiSliderRange = {
    config: {
        selectors: {
            slider: '.slider-range',
            sliderHolder: '.slider-holder',
            dataHolder: '.rangeData'
        },
        activeClass: 'ui-slider',
        maxZIndex: 1
    },

    init: function() {
        var sliders = $(this.config.selectors.slider + ':not(.' + this.config.activeClass + ')'),
            self = this;
        sliders.each(function(index, el) {
            $(this).closest(self.config.selectors.sliderHolder).attr('style', 'z-index : ' + (self.config.maxZIndex));
            self.activateSlider(this);
        });
    },

    activateSlider: function(elem) {
        var $elem = $(elem),
            parent = $elem.parent(),
            dataHolder = parent.find(this.config.selectors.dataHolder),
            minValueInput = dataHolder.find('[type=hidden]:first'),
            maxValueInput = dataHolder.find('[type=hidden]:last'),
            minValue = $elem.data('min'),
            maxValue = $elem.data('max'),
            currentMin = $elem.data('currentMin'),
            currentMax = $elem.data('currentMax'),
            label = $elem.data('label') + '';

        if ($elem.hasClass('singleSlider')) {
            $elem.slider({
                range: false,
                min: minValue,
                max: maxValue,
                value: $elem.data('current'),
                slide: function(event, ui) {
                    minValueInput.val(ui.value);
                    var val = ui.value + '';

                    var currentElem = $(event.target);
                    $(currentElem).
                        closest(uiSliderRange.config.selectors.sliderHolder).
                        find('.tooltip_sides:first div').
                        text(val + label);
                },
                create: function(event, ui) {
                    var currentElem = $(event.target);
                    currentElem.parent().prepend("<div class='tooltip_sides min'><div class='tooltip-inner'></div></div>");
                    $(currentElem).
                        closest(uiSliderRange.config.selectors.sliderHolder).
                        find('.tooltip_sides:first div').
                        text(currentElem.data('currentMin') + currentElem.data('label'));
                }
            });
        } else {
            $elem.slider({
                range: true,
                min: minValue,
                max: maxValue,
                values: [currentMin, currentMax],
                slide: function(event, ui) {
                    var currentElem = $(event.target);

                    if (ui.values[0] == minValue && ui.values[0] == ui.values[1]) {
                        $(currentElem).
                            closest(uiSliderRange.config.selectors.sliderHolder).
                            find('.tooltip_sides:first div').
                            html('< ' + ui.values[0] + label);
                        $(currentElem).
                            closest(uiSliderRange.config.selectors.sliderHolder).
                            find('.tooltip_sides:last div').
                            html('100' + label);

                        minValueInput.val('');
                        maxValueInput.val(ui.values[1]);

                    } else if (ui.values[1] == maxValue && ui.values[0] == ui.values[1]) {
                        $(currentElem).
                            closest(uiSliderRange.config.selectors.sliderHolder).
                            find('.tooltip_sides:first div').
                            html('1' + label);

                        $(currentElem).
                            closest(uiSliderRange.config.selectors.sliderHolder).
                            find('.tooltip_sides:last div').
                            html('> ' + ui.values[1] + label);

                        minValueInput.val(ui.values[0]);
                        maxValueInput.val('');
                    } else {
                        $(currentElem).
                            closest(uiSliderRange.config.selectors.sliderHolder).
                            find('.tooltip_sides:first div').
                            html(ui.values[0] + label);

                        $(currentElem).
                            closest(uiSliderRange.config.selectors.sliderHolder).
                            find('.tooltip_sides:last div').
                            html(ui.values[1] + label);

                        minValueInput.val(ui.values[0]);
                        maxValueInput.val(ui.values[1]);
                    }
                },
                stop: function(event, ui) {
                    if (typeof searchApp === 'object') {
                        searchApp.updateFilter(minValueInput);
                        searchApp.updateFilter(maxValueInput);
                    }
                },
                create: function(event, ui) {
                    var currentElem = $(event.target);
                    currentElem.parent().prepend("<div class='tooltip_sides min'><div class='tooltip-inner'></div></div>");
                    $(currentElem).
                        closest(uiSliderRange.config.selectors.sliderHolder).
                        find('.tooltip_sides:first div').
                        html(currentElem.data('currentMin') + currentElem.data('label'));

                    currentElem.parent().append("<div class='tooltip_sides max'><div class='tooltip-inner'></div></div>");
                    $(currentElem).
                        closest(uiSliderRange.config.selectors.sliderHolder).
                        find('.tooltip_sides:last div').
                        html(currentElem.data('currentMax') + currentElem.data('label'));
                }
            });
        }
    }
};

var uiSlider = {
    config: {
        selectors: {
            slider: '.slider-range',
            sliderHolder: '.slider-holder',
            dataHolder: '.rangeData'
        },
        activeClass: 'ui-slider',
        maxZIndex: 100
    },

    init: function() {
        var sliders = $(this.config.selectors.slider + ':not(.' + this.config.activeClass + ')'),
            self = this;
        sliders.each(function(index, el) {
            $(this).closest(self.config.selectors.sliderHolder).attr('style', 'z-index : ' + (self.config.maxZIndex - index));
            self.activateSlider(this);
        });
    },

    activateSlider: function(elem) {
        var $elem = $(elem),
            parent = $elem.parent(),
            dataHolder = parent.find(this.config.selectors.dataHolder),
            minValueInput = dataHolder.find('[type=hidden]:first'),
            maxValueInput = dataHolder.find('[type=hidden]:last'),
            minValue = $elem.data('min'),
            maxValue = $elem.data('max'),
            currentMin = $elem.data('currentMin'),
            currentMax = $elem.data('currentMax'),
            label = $elem.data('label') + '';

        $elem.slider({
            range: true,
            min: minValue,
            max: maxValue,
            values: [currentMin, currentMax],
            slide: function(event, ui) {

                minValueInput.val(ui.values[0]);
                maxValueInput.val(ui.values[1]);

                var currentElem = $(event.target),
                    $minSlider = currentElem.find('a.ui-slider-handle:first'),
                    $maxSlider = currentElem.find('a.ui-slider-handle:last'),
                    $minSliderTooltip = currentElem.find('.tooltip_sides.min'),
                    $maxSliderTooltip = currentElem.find('.tooltip_sides.max');

                $minSliderTooltip.offset({'left': $minSlider.offset().left - 15});
                $maxSliderTooltip.offset({'left': $maxSlider.offset().left - 15});
                $minSliderTooltip.find('.tooltip-inner').text(ui.values[0] + currentElem.data('label'));
                $maxSliderTooltip.find('.tooltip-inner').text(ui.values[1] + currentElem.data('label'));
            },

            start: function(event, ui) {
                var currentElem = $(event.target),
                    $minSlider = currentElem.find('a.ui-slider-handle:first'),
                    $maxSlider = currentElem.find('a.ui-slider-handle:last'),
                    $minSliderTooltip = currentElem.find('.tooltip_sides.min'),
                    $maxSliderTooltip = currentElem.find('.tooltip_sides.max');

                $minSliderTooltip.show();
                $maxSliderTooltip.show();
                $minSliderTooltip.offset({'left': $minSlider.offset().left - 15});
                $maxSliderTooltip.offset({'left': $maxSlider.offset().left - 15});
            },

            stop: function(event, ui) {
                if (typeof searchApp === 'object') {
                    $(ui.handle).is(':nth-child(2)') ?
                        searchApp.updateFilter(minValueInput) :
                        searchApp.updateFilter(maxValueInput);
                }
                var currentElem = $(event.target),
                    $minSliderTooltip = currentElem.find('.tooltip_sides.min'),
                    $maxSliderTooltip = currentElem.find('.tooltip_sides.max');

                $minSliderTooltip.hide();
                $maxSliderTooltip.hide();
            },
            create: function(event, ui) {
                var currentElem = $(event.target);

                currentElem.
                    append("<div class='tooltip_sides min'><div class='tooltip-inner'>min</div></div>").
                    append("<div class='tooltip_sides max'><div class='tooltip-inner'>max</div></div>");
                currentElem.
                    find('.tooltip_sides.min').
                    hide().
                    find('.tooltip-inner').
                    text(currentElem.data('currentMin') + currentElem.data('label'));
                currentElem.
                    find('.tooltip_sides.max').
                    hide().
                    find('.tooltip-inner').
                    text(currentElem.data('currentMax') + currentElem.data('label'));
            }
        });
    }
};
