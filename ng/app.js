var smcaApp = angular.module('daApp',['nvd3', 'ui.bootstrap', 'ngSanitize']);

//Change the bracket settings for ng so that there is no conflict with handlebars
smcaApp.config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('{[{');
        $interpolateProvider.endSymbol('}]}');
});
smcaApp.controller('daController', function smcaController($scope, $http, $sce, $sanitize) {
	
	$scope.sanitize = function(value) {
	
		return $sce.trustAsHtml($sanitize(value));
	}
	
});
