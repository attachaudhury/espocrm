/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM - Open Source CRM application.
 * Copyright (C) 2014-2020 Yuri Kuznetsov, Taras Machyshyn, Oleksiy Avramenko
 * Website: https://www.espocrm.com
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
 *
 * The interactive user interfaces in modified source and object code versions
 * of this program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU General Public License version 3.
 *
 * In accordance with Section 7(b) of the GNU General Public License version 3,
 * these Appropriate Legal Notices must retain the display of the "EspoCRM" word.
 ************************************************************************/

define('views/email/modals/insert-field', ['views/modal', 'field-language'], function (Dep, FieldLanguage) {

    return Dep.extend({

        backdrop: true,

        templateContent: `

        `,

        events: {
            'click [data-action="insert"]': function (e) {
                var value = $(e.currentTarget).data('value');
                this.trigger(value);
            },
        },

        setup: function () {
            Dep.prototype.setup.call(this);

            this.buttonList.push({
                'name': 'cancel',
                'label': 'Cancel'
            });

            this.headerHtml = this.translate('Insert Field', 'labels', 'Email');

            this.fieldLanguage = new FieldLanguage(this.getMetadata(), this.getLanguage());

            this.wait(
                Espo.Ajax.getRequest('Email/action/getInsertFieldData', {
                    parentId: this.options.parentId,
                    parentType: this.options.parentType,
                    to: this.options.to,
                }).then(
                    function (fetchedData) {
                        this.fetchedData = fetchedData;
                        this.prepareData();
                    }.bind(this)
                )
            );
        },

        prepareData: function () {
            var data = {};

            var fetchedData = this.fetchedData;

            if (fetchedData.to) {
                data.to = {
                    entityType: fetchedData.to.entityType,
                    dataList: this.prepareDisplayValueList(fetchedData.to.entityType, fetchedData.to.values),
                };
            }

            if (fetchedData.parent) {

                if (
                    fetchedData.parent.entityType !== fetchedData.to.entityType ||
                    fetchedData.parent.id !== fetchedData.to.id
                ) {
                    data.parent = {
                        entityType: fetchedData.parent.entityType,
                        dataList: this.prepareDisplayValueList(fetchedData.parent.entityType, fetchedData.parent.values),
                    };
                }
            }

            this.displayData = data;

            console.log(data);
        },

        prepareDisplayValueList: function (scope, values) {
            var list = [];

            var attributeList = Object.keys(values);
            var labels = {};

            attributeList.forEach(function (item) {
                labels[item] = this.fieldLanguage.translateAttribute(scope, item);
            }, this);

            attributeList = attributeList.sort(function (v1, v2) {
                return labels[v1].localeCompare(labels[v2]);
            }.bind(this));

            attributeList.forEach(function (item) {
                if (item === 'id') return;
                var value = values[item];
                if (value === null || value === '') return;
                if (typeof value == 'boolean') return;
                if (Array.isArray(value)) {
                    for (let v in value) {
                        if (typeof v  !== 'string') return;
                    }
                    value = value.split(', ');
                };

                list.push({
                    name: item,
                    label: labels[item],
                    value: value,
                });
            }, this);

            return list;
        },

    });
});
