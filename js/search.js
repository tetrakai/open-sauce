// Simple Jekyll Searching - https://alexpearce.me/2012/04/simple-jekyll-searching/

// Retrieves the value of a GET parameter with a given key
// Accepts:
//  param: string
// Returns:
//  string or null
var getParam = function(param) {
  var queryString = window.location.search.substring(1), queries = queryString.split('&');
  for (var i in queries) {
    var pair = queries[i].split('=');
    if (pair[0] === param) {
      // Decode the parameter value, replacing %20 with a space etc.
      return decodeURI(pair[1]);
    }
  }
  return null;
};

  // Filters posts with the condition `post['property'] == value`
  // Accepts:
  //  posts - array of post objects and a string
  //  property - string of post object property to compare
  //  value - filter value of property
  // Returns:
  //  array of post objects
var filterPostsByPropertyValue = function(posts, property, value) {
  var filteredPosts = [];
  // The last element is a null terminator
  posts.pop();
  for (var i in posts) {
    var post = posts[i];
    var prop = post[property];

    // Last element of tags is null
    post.tags.pop();

    // The property could be a string, such as a post's category,
    // or an array, such as a post's tags
    if (prop.constructor === String) {
      if (prop.toLowerCase() === value.toLowerCase()) {
        filteredPosts.push(post);
      }
    } else if (prop.constructor === Array) {
      for (var j in prop) {
        if (prop[j].toLowerCase() === value.toLowerCase()) {
          filteredPosts.push(post);
        }
      }
    }
  }
  return filteredPosts;
};

// Formats search results and appends them to the DOM
// Accepts:
//  property: string of object type we're displaying
//  value: string of name of object we're displaying
//  posts: array of post objects
// Returns:
//  undefined
var layoutResultsPage = function(property, value, posts) {
  var dict = {};
  dict["posts"] = posts;
  dict["baseurl"] = "";
  $('#results').html("");
  $('#results').css('visibility', 'visible');
  getTemplateAjax("search_results_list.html", "#results", dict, displayTemplate);
};

function getTemplateAjax(path, element, dict, callback) {
  $.ajax({
    url: path,
    success: function(data) {
      //Get the Template and compile it
      var template  = Handlebars.compile(data);
      if (callback) {
        callback(template, element, dict);
      }
    }
  });
}

var displayTemplate = function(template, element, data) {
  //Replace the body section with the new code.
  $(element).append(template(data));
}

// Formats the search results page for no results
// Accepts:
//  property: string of object type we're displaying
//  value: string of name of object we're displaying
// Returns:
//  undefined
var noResultsPage = function(property, value) {
  $('#results').css('visibility', 'visible');
  $('#results .value').text(value);
};

$(document).ready(function() {
  var map = {
    'category' : getParam('category'),
    'tags'       : getParam('tags')
  };

  $.each(map, function(type, value) {
    if (value !== null) {
      $.getJSON('/search.json', function(data) {
        posts = filterPostsByPropertyValue(data, type, value);
        if (posts.length === 0) {
          noResultsPage(type, value);
        } else {
          layoutResultsPage(type, value, posts);
        }
      });
    }
  });
});