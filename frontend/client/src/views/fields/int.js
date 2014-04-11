/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM - Open Source CRM application.
 * Copyright (C) 2014  Yuri Kuznetsov, Taras Machyshyn, Oleksiy Avramenko
 * Website: http://www.espocrm.com
 *
 * EspoCRM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * EspoCRM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EspoCRM. If not, see http://www.gnu.org/licenses/.
 ************************************************************************/ 

Espo.define('Views.Fields.Int', 'Views.Fields.Base', function (Dep) {

	return Dep.extend({

		type: 'int',
		
		editTemplate: 'fields.int.edit',
		
		searchTemplate: 'fields.int.search',
		
		validations: ['required', 'int', 'range'],
	
		setup: function () {
			Dep.prototype.setup.call(this);
			this.defineMaxLength();
		},
		
		setupSearch: function () {
			this.searchParams.typeOptions = ['equals', 'notEquals', 'greaterThan', 'lessThan', 'greaterThanOrEquals', 'lessThanOrEquals', 'between'];
			this.events = _.extend({
				'change select.search-type': function (e) {
					var additional = this.$el.find('input.additional');
					if ($(e.currentTarget).val() == 'between') {
						additional.removeClass('hide');
					} else {
						additional.addClass('hide');
					}
				},
			}, this.events || {});
		},
	
		defineMaxLength: function () {
			var maxValue = this.model.getFieldParam(this.name, 'max');			
			if (maxValue) {
				this.params.maxLength = maxValue.toString().length;	
			}	
		},		
	
		validateInt: function () {
			var value = this.model.get(this.name);
			if (isNaN(value)) {
				this.showValidationMessage(this.name + " should be an integer");
				return true;
			}
		},
	
		validateRange: function () {
			var value = this.model.get(this.name);
		
			if (value === null) {
				return false;
			}
				
			var minValue = this.model.getFieldParam(this.name, 'min');
			var maxValue = this.model.getFieldParam(this.name, 'max');
		
			if (minValue !== null && maxValue !== null) {
				if (value < minValue || value > maxValue ) {
					this.showValidationMessage(this.getLanguage().translate(this.name, 'fields', this.model.name) + " " + this.getLanguage().translate("should be between") + " " + minValue  + " " + this.getLanguage().translate("and")  + " " + maxValue + "");
					return true;
				}
			} else {
				if (minValue !== null) {
					if (value < minValue) {
						this.showValidationMessage(this.getLanguage().translate(this.name, 'fields', this.model.name) + " " + this.getLanguage().translate("should not be less than") + " " + minValue);
						return true;
					}
				} else if (maxValue !== null) {
					if (value > maxValue) {
						this.showValidationMessage(this.getLanguage().translate(this.name, 'fields', this.model.name) + " " + this.getLanguage().translate("should not be greater than") + " " + maxValue);
						return true;
					}
				}
			}
		},
	
		validateRequired: function () {
			if (this.params.required || this.model.isRequired(this.name)) {
				var value = this.model.get(this.name);
				if (value === null || value === false) {
					this.showValidationMessage(this.getLanguage().translate(this.name, 'fields', this.model.name) + " " + this.getLanguage().translate("is required"));
					return true;
				}
			}
		},
		
		parse: function (value) {
			value = (value !== '') ? value : null;
			if (value !== null) {
				 if (value.indexOf('.') !== -1 || value.indexOf(',') !== -1) {
				 	value = NaN;
				 } else {
				 	value = parseInt(value);
				 }
			}
			return value;
		},
	
		fetch: function () {
			var value = this.$el.find('[name="'+this.name+'"]').val();
			value = this.parse(value);			
			var data = {};
			data[this.name] = value;
			return data; 
		},		
		
		fetchSearch: function () {
			var value = this.parse(this.$element.val());
			var type = this.$el.find('[name="'+this.name+'-type"]').val();
			var data;
			
			if (!value) {
				return false;
			}
			
			if (type != 'between') {
				data = {
					type: type,
					value: value,
					value1: value									
				};
			} else {
				var valueTo = this.parse(this.$el.find('[name="' + this.name + '-additional"]').val());
				if (!valueTo) {
					return false;
				}
				data = {
					type: type,
					value: [value, valueTo],
					value1: value,
					value2: valueTo								
				};
			}
			return data;				
		},
		
	});
});

