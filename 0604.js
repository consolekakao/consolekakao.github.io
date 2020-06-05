var cheerio = require('cheerio');
var request = require('request');
var url = "https://consolekakao.github.io/"

request(url, function(error, response, html){
    if (error) {throw error};

    var $ = cheerio.load(html);
    const $title = $('.card-title');
    let a = {};
    let list = new Array();
    a = $title.text().split('.');
    console.log(Object.keys(a).length);
    let i;
    for(i=0;i<Object.keys(a).length-1;i++){
    let jlist = new Object();
    jlist.number = i;
    jlist.value = a[i];
    list.push(jlist);
    }
    console.log(list);
   
});