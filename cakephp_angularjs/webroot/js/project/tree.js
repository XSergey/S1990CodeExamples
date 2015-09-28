/**
 * Created by jelev on 03.04.14.
 */
var vj_tree = {
    config: {
        layerPadding: 10, // px.

        classes: {
            vLine: 'v-line',
            hLine: 'h-line'
        }
    },

    init: function(){
        var self = this;
        $(document).on('treeChanged', function(){
            var treeLayers = $('#tree').find('[data-layer]');

            treeLayers.find('.v-line').remove();
            treeLayers.find('.h-line').remove();

            if (treeLayers.find('[data-layer-item-active]').length > 1) {
                treeLayers.each(function(index) {

                    var bottomLine = $('<div>', {class:self.config.classes.vLine + ' bottom', style: "top:100%; left: 49%"});
                    var topLine = $('<div>', {class:self.config.classes.vLine + ' top', style: "bottom:100%; left: 49%"});

                    var prevLayer = $(treeLayers[index-1]);
                    var activeElementsInCurrentLayer = $(this).find('li[data-layer-item-active]');

                    if (typeof prevLayer[0] !== 'undefined') {
                        if (activeElementsInCurrentLayer.length > 0) {
                            var mainElement = prevLayer;
                            var mainElementOffset = mainElement.offset();
                            var mainElementHeight = mainElement.height();

                            var currentOffset = activeElementsInCurrentLayer.offset();
                            if (prevLayer.parent('#mainSearchItems').length) {
                                var currentHeight = currentOffset.top - mainElementOffset.top - mainElementHeight - 10;
                            } else {
                                var currentHeight = currentOffset.top - mainElementOffset.top - mainElementHeight;
                            }

                            var currentTopLine = topLine;
                            currentTopLine.css('height', currentHeight);
                            activeElementsInCurrentLayer.append(currentTopLine);

                            var prevLayerElements = prevLayer.find('li[data-layer-item-active]');

                            var allPrevLayerElements = mainElement.find('li');
                            var allPrevLayerElementsActive = mainElement.find('li');
                            var maxBottom = 0;
                            var minBottom = 100000;
                            $.each(allPrevLayerElements, function() {
                                var prevElem = $(this);
                                if (prevElem.offset().top > maxBottom)
                                maxBottom = prevElem.offset().top;
                                if (prevElem.offset().top < minBottom)
                                    minBottom = prevElem.offset().top + prevElem.height() + 2;
                            });
                            if (minBottom < maxBottom) {
                                var newBottomHeight = maxBottom - minBottom;
                                console.log(newBottomHeight);
                                bottomLine.css('height', newBottomHeight);
                            }


                            prevLayerElements.append(bottomLine);

                            if (prevLayerElements.length > 0) {
                                var prevLeft = prevLayerElements.parents('ul').find('.bottom:first');
                                var prevRight = prevLayerElements.parents('ul').find('.bottom:last');
                                var allElementsPrev = prevLayerElements.parents('ul').find('.bottom');

                                $.each(allElementsPrev, function() {
                                    var _el = $(this);

                                    if (_el.offset().left < prevLeft.offset().left) {
                                        prevLeft = _el;
                                    }
                                    if (_el.offset().left > prevRight.offset().left) {
                                        prevRight = _el;
                                    }

                                });

                                if (activeElementsInCurrentLayer.length > 0) {
                                    var allElements = $(this).find('.top');
                                    var currentLeft = $(this).find('.top:first');
                                    var currentRight = $(this).find('.top:last');

                                        $.each(allElements, function() {
                                            var el = $(this);
                                            if (el.offset().top > (prevLeft.offset().top + 10)) {
                                                if (prevLayer.parent('#mainSearchItems').length) {
                                                    var newHeight = el.offset().top - prevLeft.offset().top;
                                                } else {
                                                    var newHeight = el.offset().top - prevLeft.offset().top + 2;
                                                }

                                                if (newHeight > el.height()) {
                                                    el.css('height', newHeight);

                                                    if (el.offset().top > (prevLeft.offset().top + 10)) {
                                                        while ( el.offset().top > (prevLeft.offset().top + 10) ) {
                                                            el.css('height', (el.height() + 1));
                                                        }
                                                    }
                                                } else {
                                                    while (el.offset().top > (prevLeft.offset().top + 10)) {
                                                        el.css('height', (el.height() + 1));
                                                    }
                                                }
                                            }

                                            if (el.offset().left < currentLeft.offset().left) {
                                                currentLeft = el;
                                            }
                                            if (el.offset().left > currentRight.offset().left) {
                                                currentRight = el;
                                            }

                                        });


                                    var currentLeftPosX = currentLeft.offset().left;
                                    var currentRightPosX = currentRight.offset().left;

                                    var prevLeftPosX = prevLeft.offset().left;
                                    var prevRightPosX = prevRight.offset().left;


                                    var hLineWidth, pLeft, cLeft, hLine;

                                    if ((pLeft = Math.min(prevLeftPosX, prevRightPosX)) <= (cLeft = Math.max(currentLeftPosX, currentRightPosX))) {
                                        hLineWidth = (cLeft - pLeft) + 2;
                                        hLine = $('<div>', {class:'h-line', style:'width:'+hLineWidth+'px'});
                                        prevLeft.append(hLine);
                                    } else {
                                        hLineWidth = (pLeft - currentLeftPosX) + 2;
                                        hLine = $('<div>', {class:'h-line', style:'width:'+hLineWidth+'px; right:0'});
                                        prevLeft.append(hLine);
                                    }

                                    hLineWidth = Math.abs(currentLeftPosX - currentRightPosX);
                                    hLine = $('<div>', {class:'h-line', style:'width:' + hLineWidth + 'px; top:-2px'});
                                    currentLeft.append(hLine);

                                    hLineWidth = Math.abs(prevLeftPosX - prevRightPosX);
                                    hLine = $('<div>', {class:'h-line', style:'width:' + hLineWidth + 'px; top:6px'});
                                    prevLeft.append(hLine);
                                }
                            }
                        }
                    }

                    if ( $('#fourthSearchItems').find('li[data-layer-item-active]').length > 0) {
                        if ( $('#fourthSearchItems').find('li[data-layer-item-active][data-layer-item="3"]').length == 0) {
                            var hLineNew = $('<div>', {class:'h-line', style:'width:' + 350 + 'px; top:6px;margin-left:-350px'});
                            $('#thirdSearchItems li[data-layer-item="2"] .bottom').append(hLineNew);
                        }
                    }
                    if ( $('#thirdSearchItems').find('li[data-layer-item="3"][data-layer-item-active]').length > 0) {
                        if ($('#thirdSearchItems').find('li[data-layer-item-active]').length > 1) {
                            if ($('#thirdSearchItems').find('li[data-layer-item-active]').length == 2) {
                                if ( $('#thirdSearchItems').find('li[data-layer-item="2"][data-layer-item-active]').length > 0) {
                                    $('#thirdSearchItems li[data-layer-item="2"] .bottom').css('height', '50px');
                                    $('#thirdSearchItems li[data-layer-item="2"] .bottom .h-line').css('display', 'none');
                                } else {
                                    $('#thirdSearchItems li[data-layer-item="3"] .bottom').hide();
                                }
                            } else {
                                $('#thirdSearchItems li[data-layer-item="3"] .bottom').hide();
                            }
                        }
                    }
                    if (newBottomHeight) {
                        $.each(allElements, function() {
                            var _el = $(this);
                            _el.css('height', (_el.height() - newBottomHeight + 10 ));
                        });
                    }
                });
            }
        });
    }
};
vj_tree.init();