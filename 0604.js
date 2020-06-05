var cheerio = require('cheerio');
var request = require('request');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;

var url = "https://consolekakao.github.io/"

request(url, function(error, response, html){
    if (error) {throw error};

    var $ = cheerio.load(html);
    const $title = $('.card-title');
    console.log($title.text());
    let arr = new Array();
    arr = $title.text().split();
    console.log(arr);
    /*
    let i;
    for(i=0;i<6;i++){
    let ob = new Object();
    ob.number = i;
    ob.title = arr
    
    }
*/
});