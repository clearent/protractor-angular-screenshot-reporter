angular.module('reportingApp', [])
    .directive('onFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$eval(attr.onFinishRender);
                    });
                }
            }
        }
    })
    .controller('ScreenshotReportController', ["$http" , function($http) {
        var vm = this;
        this.getParent = function(str) {
            var arr = str.split('|');
            str = "";
            for(var i=arr.length-1; i>0; i--) {
                str += arr[i] + " > ";
            }
            return str.slice(0, -3);
        };
        this.getShortDescription = function(str) {
            if(!str || str.length===0){
                //return "";
            }
            return str.split('|')[0];
        };
        this.nToBr = function(str) {
            return str.replace(/(?:\r\n|\r|\n)/g, '<br />');
        };
        this.getFilename = function(str) {
            return str.replace(/^.*[\\\/]/, '');
        };
        this.view = 'all';
        this.setView = function(_view){
            this.view = _view;
        };
        this.showRow = function(result){
            return this.view === 'all'||
                (this.view === 'passed' && result.passed)||
                (this.view === 'pending' && result.pending)||
                (this.view === 'failed' && !result.passed && !result.pending);
        };
        this.totalCount = function(){
            var totalCount = 0;
            for(var i in this.results) {
                totalCount++;
            }
            return totalCount;
        };
        this.passCount = function() {
            var passCount = 0;
            for(var i in this.results) {
                var result = this.results[i];
                if(result.passed) passCount++;
            }
            return passCount;
        };
        this.pendingCount = function() {
            var pendingCount = 0;
            for(var i in this.results) {
                var result = this.results[i];
                if(result.pending) pendingCount++;
            }
            return pendingCount;
        };
        this.failCount = function() {
            var failCount = 0;
            for(var i in this.results) {
                var result = this.results[i];
                if(!result.passed && !result.pending) failCount++;
            }
            return failCount;
        };
        this.getCombinedJsonRequest = function () {
            return {
                method: "GET",
                url: "combined.json",
                headers: {
                    "Content-Type": "application/json",
                    "accept": "application/json"
                }
            };

        };
        this.renderComplete = function(){
            vm.renderingData = false;
        };
        this.results = "";
        this.loadingErrorMsg = "";
        this.errorLoading = false;
        this.loadingData = false;
        this.renderingData = false;

        function getTestResults() {
            var req = vm.getCombinedJsonRequest();
            vm.loadingData = true;
            vm.errorLoading = false;
            vm.loadingErrorMsg = "";
            $http(req)
                .then(
                function (result) {
                    vm.loadingData = false;
                    vm.renderingData = true;
                    vm.errorLoading = false;
                    vm.results = result.data;
                },
                function (reason) {
                    // show reason;
                    vm.loadingData = false;
                    vm.errorLoading = true;
                    vm.loadingErrorMsg = reason.status + "  [" + reason.config.url + "] " + reason.statusText;
                    console.log(reason);
                }
            );
        }

        getTestResults();

    }]);