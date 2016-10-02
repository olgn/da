var daApp = angular.module('daApp',['nvd3', 'ui.bootstrap']);

//Change the bracket settings for ng so that there is no conflict with handlebars
daApp.config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('{[{');
        $interpolateProvider.endSymbol('}]}');
});

daApp.controller('daController', function daController($scope, $http, $sce) {


});

daApp.controller('nameBotController', function nameBotController($scope, $http, $sce) {
	//nameBot
	$scope.fn = {};
	$scope.wordList = [];
	$scope.fn.getWordList = function() {
		$http({
			method: 'GET',
			url: '/wordBag'
		}).then(function successCallback(response) {
				$scope.wordList = [];
				for (i=0; i< response.data.length; i++) {
					$scope.wordList.push(response.data[i].word);
				};
				console.log($scope.wordList);
		}, function errorCallback(response) {
				console.log('getWordList failed: ');
				console.log(response);
		})
	}
	
	$scope.fn.getWordList();

});
