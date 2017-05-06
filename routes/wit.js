var request = require('request');
var settings = require('./settings');
var url = "http://localhost:3000/";
module.exports = {

	text_action : function (text) {
		request.get(url + "statement?text=" + text);
	},
	display_news : function (news) {
		var info ={ articles : news };
		
		//console.log( "***** "+JSON.stringify(info) );
		request({
			method : 'post',
			body : info,
			json : true,
			url : url + "news"
		});

	},
	appearance :function (){
		request.get(url + "face");
	}

};
