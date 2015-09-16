var _ = require('lodash');
var async = require('async');
var cheerio = require('cheerio');
var request = require('request');

var results = [];

var START_YEAR = 1970;
var END_YEAR = 2015;
var BASE_URL = 'http://www.bikez.com/year/index.php?year=';

var tasks = [];
for (var i = START_YEAR; i <= END_YEAR; i++) {
  tasks.push(scrapeBikesForEachYear.bind(null, i));
}

async.parallel(tasks, function(error, results) {
  if (error) {
    console.log(error);
    return;
  }
  console.log(JSON.stringify(_.flatten(results), null, 2));
});

function scrapeBikesForEachYear(year, callback) {
  request.get(BASE_URL + year, function(error, res, body) {
    if (error) {
      return callback(error);
    }

    var $ = cheerio.load(body);
    var data = $('#menuandpage table.zebra tr > td > a');

    var items = data
      .map(function(idx, item) {
        // get the inner text of each anchor element
        return $(item).text();
      })
      .filter(function(idx, item) {
        // reject texts that are emtpy (this is a link to more information about
        // the motorcycle)
        return item !== '' && item !== '\r\n';
      });

      var results = [];
      items.each(function(idx, item) {
        if (idx % 2 === 0) {
          results.push({year: year, model: item})
        } else {
          results[results.length - 1].make = item;
        }
      });

      callback(null, results);
  });
}
