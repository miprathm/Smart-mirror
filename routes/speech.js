var request = require("request");
var settings = require('./settings');
var url = "http://localhost:3000/";
module.exports = {
	user_name : "Smarty",

	greet : function () {

		//console.log(" In the greet function ");
		var self = this;
		var greeting_words = [
			"Hi",
			"Hey",
			"Hello"
		];
		var goofy_greetings = [
			"what's up?",
			"howdy",
			"what's crackin'?",
			"top of the morning to ya"
		];
		var choice = self.random_choice(4);
		var ret_phrase = "";

		if ((choice == 0) || (choice == 3)) {
			ret_phrase = "Good " + self.time_of_day(new Date())
				if (self.random_choice(2) == 0) {
					ret_phrase = ret_phrase + " " + self.user_name;
				}
		} else if ((choice == 1) || (choice == 4)) {
			ret_phrase = greeting_words[self.random_choice(4)];

			if (self.random_choice(2) == 0) {
				ret_phrase = ret_phrase + " " + self.user_name;
			}
		} else if (choice == 2) {
			ret_phrase = goofy_greetings[self.random_choice(goofy_greetings.length)];
		}
		//console.log(" In the greet function "+choice);

		return ret_phrase

	},
	time_of_day : function (date, with_adjective) {
		ret_phrase = "";
		if (date.getHours() < 10) {
			ret_phrase = "morning";
			if (with_adjective) {
				ret_phrase = "this " + ret_phrase;
			}
		} else if ((date.getHours() >= 10) &&
			(date.getHours() < 18)) {
			ret_phrase = "afternoon";
			if (with_adjective) {
				ret_phrase = "this " + ret_phrase;
			} else if (date.getHours() >= 18) {
				ret_phrase = "evening"
			}
			if (with_adjective) {
				ret_phrase = "this " + ret_phrase;
			}
		}
		return ret_phrase

	},
	random_choice : function (length, startIndex) {
		return Math.floor(Math.random() * length) + (startIndex ? startIndex : 0);
	},
	snow_white : function () {
		var phrases = [
			"You are",
			"You",
			"You are, of course"
		];

		return phrases[self.random_choice(phrases.length)];
	},
	weather : function (callback) {
		var generatedText = '';
		request.get(settings.weather.url + "weather?units=" +
			settings.weather.unitType + "&q=" + settings.weather.city + "," + settings.weather.countryCode + settings.weather.token, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var info = JSON.parse(body);
				generatedText = 'The Weather of ' + settings.weather.city + " is " + info.main.temp + " degree celcius and wind speed " + info.wind.speed + " kilometer per hours.";

				//console.log("From Wit" + JSON.stringify(info));
			}
			if (callback) {
				callback(generatedText);
			}
		});

	},
	news : function (callback) {
		var generatedText = '';
		var arrNews = [];
		request.get(settings.feed.newsurl, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var info = JSON.parse(response.body);
				//console.log('response '+ JSON.stringify(response));
				generatedText = "Here are the some news from the hindu. ";

				info.articles.forEach(function (news, index) {
					if (index < 5) {
						arrNews.push(String(news.title));
						generatedText += " " + news.title + "."
					} else
						return;
				});
				//console.log("From Wit" + JSON.stringify(arrNews));
			}
			if (callback) {
				callback(generatedText, arrNews || []);
			}
		});
	},
	map_action : function (entity, callback) {
		var location = '';
		var map_type = '';
		if (entity) {
			if (entity.location) {
				location = entity.location[0].value;
			}
			if (entity.Map_Type) {
				map_type = entity.Map_Type[0].value;
			}
		}
		var map_url = "";
		if (map_type == "satellite")
			map_url = "http://maps.googleapis.com/maps/api/staticmap?center=" + location + "&zoom=13&scale=false&size=1200x600&maptype=satellite&format=png";
		else if (map_type == "terrain")
			map_url = "http://maps.googleapis.com/maps/api/staticmap?center=" + location + "&zoom=13&scale=false&size=1200x600&maptype=terrain&format=png";
		else if (map_type == "hybrid")
			map_url = "http://maps.googleapis.com/maps/api/staticmap?center=" + location + "&zoom=13&scale=false&size=1200x600&maptype=hybrid&format=png";
		else
			map_url = "http://maps.googleapis.com/maps/api/staticmap?center=" + location + "&zoom=13&scale=false&size=1200x600&maptype=roadmap&format=png";

		request({
			method : 'post',
			body : {
				"mapurl" : map_url
			},
			json : true,
			url : url+"image"
		});
		if (callback) {
			callback(location ? "Sure. Here's a map of " + location : "I'm sorry, I couldn't understand what location you wanted.");
		}
	},
	user_status : function (type) {
		var self = this;
		type = "positive";
		var ret_phrase = "";

		var positive_complements = [
			"good",
			"nice",
			"great",
			"perfect",
			"Beautiful"
		];

		var negative_complements = [
			"bad",
			"terrible"
		];

		var moderate_complements = [
			"alright",
			"okay"
		];

		var complement_choice = positive_complements;
		if (type == 'negative')
			complement_choice = negative_complements;
		else if (type == 'moderate')
			complement_choice = moderate_complements;

		ret_phrase = "You look " + complement_choice[self.random_choice(complement_choice.length)];
		request.get(url + "/statement?text=" + ret_phrase);

		return ret_phrase;

	}

};
