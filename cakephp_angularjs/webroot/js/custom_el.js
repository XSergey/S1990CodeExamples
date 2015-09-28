// custom forms plugin
(function(jQuery){
	// custom checkboxes module
	jQuery.fn.customCheckbox = function(_options){
		var _options = jQuery.extend({
			checkboxStructure: '<div></div>',
			checkboxDisabled: 'disabled',
			checkboxDefault: 'checkboxArea',
			checkboxChecked: 'checkboxAreaChecked',
			filterClass:'default'
		}, _options);
		return this.each(function(){
			var checkbox = jQuery(this);
			if(!checkbox.hasClass('outtaHere') && checkbox.is(':checkbox') && !checkbox.hasClass(_options.filterClass)){
				var replaced = jQuery(_options.checkboxStructure);
				this._replaced = replaced;
				if(checkbox.is(':disabled')) replaced.addClass(_options.checkboxDisabled);
				else if(checkbox.is(':checked')) replaced.addClass(_options.checkboxChecked);
				else replaced.addClass(_options.checkboxDefault);

				replaced.click(function(){
					if(checkbox.is(':checked')) checkbox.removeAttr('checked');
					else checkbox.attr('checked', 'checked');
					changeCheckbox(checkbox);
				});
				checkbox.click(function(){
                    changeCheckbox(checkbox);
                    if(!checkbox.is(':checked')) checkbox.removeAttr('checked');
					else checkbox.attr('checked', 'checked');
				});
				checkbox.click(function(){
					changeCheckbox(checkbox);
				});
				replaced.insertBefore(checkbox);
				checkbox.addClass('outtaHere');
			}
		});
		function changeCheckbox(_this){
			_this.change();
			if(_this.is(':checked')) _this.get(0)._replaced.removeClass().addClass(_options.checkboxChecked);
			else _this.get(0)._replaced.removeClass().addClass(_options.checkboxDefault);
		}
	}

	// custom radios module
	jQuery.fn.customRadio = function(_options){
		var _options = jQuery.extend({
			radioStructure: '<div></div>',
			radioDisabled: 'disabled',
			radioDefault: 'radioArea',
			radioChecked: 'radioAreaChecked',
			filterClass:'default'
		}, _options);
		return this.each(function(){
			var radio = jQuery(this);
			if(!radio.hasClass('outtaHere') && radio.is(':radio') && !radio.hasClass(_options.filterClass)){
				var replaced = jQuery(_options.radioStructure);
				this._replaced = replaced;
				if(radio.is(':disabled')) replaced.addClass(_options.radioDisabled);
				else if(radio.is(':checked')) replaced.addClass(_options.radioChecked);
				else replaced.addClass(_options.radioDefault);
				replaced.click(function(){
					if(jQuery(this).hasClass(_options.radioDefault)){
						radio.attr('checked', 'checked');
						changeRadio(radio.get(0));
					}
				});
				radio.click(function(){
					if(!jQuery(this).hasClass(_options.radioDefault)){
						radio.attr('checked', 'checked');
						changeRadio(radio.get(0));
					}
				});
				radio.click(function(){
					changeRadio(this);
				});
				replaced.insertBefore(radio);
				radio.addClass('outtaHere');
			}
		});
		function changeRadio(_this){
			jQuery(_this).change();
			jQuery('input:radio[name="'+jQuery(_this).attr("name")+'"]').not(_this).each(function(){
				if(this._replaced && !jQuery(this).is(':disabled')) this._replaced.removeClass().addClass(_options.radioDefault);
                $(this).removeAttr('checked');
			});
			_this._replaced.removeClass().addClass(_options.radioChecked);
		}
	}

	// event handler on DOM ready
	var _activeDrop;
	jQuery(function(){
		jQuery('body').click(hideOptionsClick)
		jQuery(window).resize(hideOptions)
	});
	function hideOptions() {
		if(_activeDrop && _activeDrop.length) {
			_activeDrop.hide();
			_activeDrop = null;
		}
	}
	function hideOptionsClick(e) {
		if(_activeDrop && _activeDrop.length) {
			var f = false;
			jQuery(e.target).parents().each(function(){
				if(this == _activeDrop) f=true;
			});
			if(!f) {
				_activeDrop.hide();
				_activeDrop = null;
			}
		}
	}
})(jQuery);