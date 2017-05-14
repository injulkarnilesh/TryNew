'use strict';

angular.module('chrome.plugin.trynew', ['ngMaterial', 'ngMdIcons'])
.controller('TryNewRootController', function() {
    var vm = this;  
    vm.flags = {
      'showTitle' : true
    }
    vm.localSearch = {
      searchText : 'ST',
      localTrys : []
    };
  
    vm.tabs = {
      selectedIndex : 0
    };
    
    vm.toggleLocalSearch = function() {
        vm.flags.showTitle = !vm.flags.showTitle;
    }
    
})
.service('BookAPIService', ['$http', function($http) {
  
  this.searchBooks = function(querySearch) {
    function successCallBack(resp) {
      console.log(resp)
    }
    
    function errorCallBack(err) {
      console.error(err);
    }
    
    function mapGoodReadsJsonToSimpleJson(book) {
        var matchingBook = book.best_book;
        return {
          id: matchingBook.id.__text,
          title : matchingBook.title,
          author : matchingBook.author.name,
          imageUrl : matchingBook.small_image_url
        };
    }
    
    function hasResult(jsonResp) {
      return jsonResp.GoodreadsResponse.search && 
              jsonResp.GoodreadsResponse.search.results &&
              jsonResp.GoodreadsResponse.search.results.work &&
              jsonResp.GoodreadsResponse.search.results.work.length;
    }
    
    function xmlToJson(xmlResp) {
      var jsonResp = new X2JS().xml_str2json(xmlResp);
      if(hasResult(jsonResp)) {
        var result = jsonResp.GoodreadsResponse.search.results.work.map(mapGoodReadsJsonToSimpleJson);
        return result;
      }
      return [];
    }
    
    var url = 'https://www.goodreads.com/search/index.xml?key=mvIa4J4YnsVxPvwQN45UzA&q=' + querySearch;
    
    return $http.get(url, {
      transformResponse : xmlToJson
    });    
  };
}])
.controller('TryNewBookController', ['$q', '$timeout', 'BookAPIService', 
                                     function($q, $timeout, BookAPIService) {
  var vm = this;
  
  vm.books =  [ 
    { 'title' : 'Cosmos', 'author' : 'Carl Sagan'},
    { 'title' :  'The brothers karamzov', 'author' : 'Dastovesky'},
    { 'title' :  'Sapiens', 'author' : 'Harari'}
  ];
  
  vm.newSelectedBook;
  vm.searchText = '';
  
  vm.querySearch = function (query) {
      var deferred = $q.defer();
      BookAPIService.searchBooks(query).then(function(resp) { 
        deferred.resolve(resp.data);  
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    }
  
  function createFilterFor(query) {
    var lowercaseQuery = angular.lowercase(query);

    return function(book) {
      return (book.title.toLowerCase().indexOf(lowercaseQuery) !== -1);
    };

  }
  
}])
.config(function($mdIconProvider) {
  $mdIconProvider
    .icon('magnify', 'images/icons/magnify.svg', 24)
    .icon('dots-vertical', 'images/icons/dots-vertical.svg', 24)
    .icon('book', 'images/icons/book-open-page-variant.svg', 24)
    .icon('movie-tv', 'images/icons/message-video.svg', 24)
    .icon('music', 'images/icons/music.svg', 24)
    .icon('star', 'images/icons/star.svg', 24)
    .icon('add', 'images/icons/plus.svg', 24);
});