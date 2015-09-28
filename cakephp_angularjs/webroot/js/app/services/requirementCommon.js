/**
 * Created by kostya on 22.07.14.
 */
angular.module('app').factory('requirementCommon', ['editableSections', function (editableSections) {

    var data = {
        'FinancialRequirement': [],
        'ServiceRequirement':   [],
        'PartnerRequirement':   []
    }
    return {
        'addRequirement':       function (requirementName, requirement) {
            data[requirementName].push(
                this._setAdditionalModels(requirementName, requirement)
            );
        },
        'saveRequirement':      function (requirementName, requirement, indx) {
            data[requirementName][indx] = this._setAdditionalModels(requirementName, requirement);
        },
        'removeRequirement':    function (requirementName, requirement) {
            var indx = data[requirementName].indexOf(requirement);
            data[requirementName].splice(indx, 1);
        },
        'setRequirements':      function (requirementName, requirements) {
            data[requirementName] = requirements;
        },
        'getRequirements':      function (requirementName) {
            return data[requirementName];
        },
        'getCount':             function () {
            var count = 0;
            angular.forEach(data, function (value) {
                count += value.length;
            })
            return count;
        },
        'getLighthouseCount':   function () {
            var count = 0;
            angular.forEach(data, function (requirements) {
                angular.forEach(requirements, function (requirement) {
                    if (requirement['lighthouse_enabled'])
                        count++;
                })
            })
            return count;
        },
        '_setAdditionalModels': function (requirementName, object) {
            var additionalModels = ['EquityType', 'Subrole', 'AssetStrategy', 'InvestorType'];

            additionalModels.map(function (modelName) {
                if (typeof object[modelName] !== 'undefined') {
                    object[requirementName][modelName] = object[modelName];
                }
            });
            return object[requirementName];
        }
    };
}]);
