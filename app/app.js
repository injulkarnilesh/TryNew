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
  
    this.searchBooks = function(querySearch) {
      var url = 'https://www.goodreads.com/search/index.xml?key=mvIa4J4YnsVxPvwQN45UzA&q=' + querySearch;

      return $http.get(url, {
        transformResponse : xmlToJson
      });    
    };
}])
.service('StorageService', [ function() {
  var book_key = 'TryNewBooks';
  
  this.getBooks = function(callBack) {
    chrome.storage.sync.get(book_key, function(data) {
      console.log('LOADED', data);
      callBack(data[book_key]);
    });
  };
  
  this.setBooks = function(books, callBack) {
    var bookList = {};
    bookList[book_key] = books;
    chrome.storage.sync.set(bookList, function() {
      callBack();
    });
  }
  
}])
.controller('TryNewBookController', ['$q', '$timeout', 'BookAPIService', 'StorageService', '$mdToast',
                                     function($q, $timeout, BookAPIService, StorageService, $mdToast) {
    var vm = this;
    vm.selectedBook;                                   
    vm.newSelectedBook;
    vm.searchText = '';
    vm.myBooks = [];
    vm.lastDeletedBook;
            
    StorageService.getBooks(function(books) {
      console.log(books);
      vm.myBooks = (books && books.length) ? books : [];
      console.log(vm.myBooks);
    });

    vm.querySearch = function (query) {
      var deferred = $q.defer();
      BookAPIService.searchBooks(query).then(function(resp) { 
        deferred.resolve(resp.data);  
      }, function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };
    
    vm.bookSelected = function(book) {
      vm.selectedBook = book;
    };
                                       
    vm.addNewBook = function() {
      addBook(vm.newSelectedBook)
    };

    function addBook(bookToAdd) {
      vm.myBooks.unshift(bookToAdd);
      StorageService.setBooks(vm.myBooks, function() {
        vm.newSelectedBook = undefined;
      });
    }                                       
           
    vm.deleteBook = function(bookToDelete) {
      vm.lastDeletedBook = bookToDelete;
      vm.myBooks = vm.myBooks.filter(function(book) { return book.id !== bookToDelete.id; });
      StorageService.setBooks(vm.myBooks, function() {
        showDeletedMessage();
      });
    };
                                       
    function showDeletedMessage() {
      var toast = $mdToast.simple()
        .textContent('Removed')
        .action('UNDO')
        .highlightAction(true)
        .position('bottom right');

      $mdToast.show(toast).then(function(response) {
        if ( response == 'ok' ) {
          addBook(vm.lastDeletedBook);
        }
      });
    };
                                       
}])
.config(function($mdIconProvider) {
  $mdIconProvider
    .icon('magnify', 'images/icons/magnify.svg', 24)
    .icon('dots-vertical', 'images/icons/dots-vertical.svg', 24)
    .icon('dots-horizontal', 'images/icons/dots-horizontal.svg', 24)
    .icon('book', 'images/icons/book-open-page-variant.svg', 24)
    .icon('movie-tv', 'images/icons/message-video.svg', 24)
    .icon('music', 'images/icons/music.svg', 24)
    .icon('star', 'images/icons/star.svg', 24)
    .icon('close', 'images/icons/close.svg', 24)
    .icon('goodreads', 'images/icons/goodreads.svg', 12)
    .icon('delete', 'images/icons/delete.svg', 12)
    .icon('open', 'images/icons/open-in-new.svg', 12)
    .icon('add', 'images/icons/plus.svg', 24);
});