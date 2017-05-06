var express = require('express');
var router = express.Router();
var request = require('request');
var wit = require('./wit');
var speech = require('./speech');
var onoff = require('onoff');
var Gpio = onoff.Gpio;
var device = require("./device")
	const exec = require('child_process').exec;

/* GET home page. */
router.get('/', function (req, res, next) {      
	res.render('index', {
		title : 'Express'
	});
});

router.post('/',function(req,res,next){
	var cmd = "";
        if (req.body.value == "on") {
                cmd = "/opt/vc/bin/tvservice -p";
        } else if (req.body.value == "off") {
                cmd = "/opt/vc/bin/tvservice -o";
        }
       // console.log(" $$$$$$ "+cmd);
        if (cmd) {
                exec(cmd, function (error, stdout, stderr) {
                                if (error) {
                                       // console.log(JSON.stringify(error) );
                                        return;
                                }
                               // console.log(JSON.stringify(stdout));
                               //console.log(JSON.stringify(stderr));
                        });
        }
	res.sendStatus(200);

});

router.post('/device', function (req, res) {

	var deviceName = req.body.device;
	var state = (req.body.action === "on") ? 0 : 1;
	var preLightStatus;
	var preFanStatus;
	// Pins available are 2,3,4,17


	device.getDeviceStatus(function (deviceStatus) {
		//console.log(typeof deviceStatus);

		try {
			var json = JSON.parse(deviceStatus);
		} catch (e) {
			console.log(JSON.stringify(e));
		}
		//console.log("Pre Light Status "+JSON.stringify(json));

		if (json) {
			if (json.light) {
				preLightStatus = (json.light === "on") ? 0 : 1;
			}
			if (json.fan) {
				preFanStatus = (json.fan === "on") ? 0 : 1;
			}
		}
		//console.log("Pre Light Status "+preLightStatus);
		//console.log("Pre Fan Status "+preFanStatus);
		//console.log(" request For "+deviceName +" "+state);
		var light;
		var fan;
		switch (deviceName) {
		case "light":
			if (preLightStatus != state) {
				light = new Gpio(2, 'out');
				//console.log("36");
				light.writeSync(state);
				preLightStatus = state;
			}
			break;
		case "fan":
			if (preFanStatus != state) {
				fan = new Gpio(3, 'out');
				//console.log("43");
				fan.writeSync(state);
				preFanStatus = state;
			}
			break;
		case "all":
			if (preLightStatus != state) {
				//console.log("50");
				light = new Gpio(2, 'out');
				light.writeSync(state);

			}
			if (preFanStatus != state) {
				fan = new Gpio(3, 'out');
				//console.log("55");
				fan.writeSync(state);
			}
			preFanStatus = state;
			preLightStatus = state;
			break;
		}
		device.saveDeviceStatus({
			light : (preLightStatus === 0 ? "on" : "off"),
			fan : (preFanStatus === 0 ? "on" : "off")
		});
		light = null;
		fan = null;
		res.sendStatus(200);
	});

});

router.get('/statement', function (req, res) {
	text = req.query.text;
	//console.log("Statement On Console "+text);
	req.io.emit("STATEMENT", {
		"text" : text
	})
	res.sendStatus(200);
});

router.post('/image', function (req, res) {
	var mapurl = req.body.mapurl;
	console.log('Image ' + JSON.stringify(req.body));
	req.io.emit("IMAGE", {
		"imageurl" : mapurl
	});
	res.sendStatus(200);

});

router.post('/weather', function (req, res) {
	var data = "";
	req.on('data', function (chunk) {
		data += chunk
	})
	req.on('end', function () {
		req.rawBody = data;
		req.jsonBody = JSON.parse(data);
		req.io.emit("WEATHER", req.jsonBody)
		res.sendStatus(200);
	})
});

router.get('/face', function (req, res) {
	req.io.emit("FACE", {})
	res.sendStatus(200);
});

router.post('/holidays', function (req, res) {
	var data = "";
	req.on('data', function (chunk) {
		data += chunk
	})
	req.on('end', function () {
		req.rawBody = data;
		req.jsonBody = JSON.parse(data);
		holiday = req.jsonBody.holiday
			req.io.emit("HOLIDAYS", {
				"holiday" : holiday
			})
			res.sendStatus(200);
	})
});

router.post('/news', function (req, res) {
	//console.log(" News api hit "+JSON.stringify(req.body));
	var articles = req.body.articles;
	req.io.emit("NEWS", {
		"articles" : articles
	});
	res.sendStatus(200);

});

router.get('/clear', function (req, res) {
	text = req.query.text
		req.io.emit("CLEAR", {});
	res.sendStatus(200);
});

router.post('/wit', function (req, res) {
	//console.log(JSON.stringify(req.body));
	setTimeout(function () {
		req.io.emit("CLEAR", {});
	}, 3000);

	var options = {
		url : 'https://api.wit.ai/message?v=24/04/2017&q=' + req.body.text,
		headers : {
			"Authorization" : 'Bearer XF2WT2BRYGA2UD2FTX73BTF6IQT7CVJX'
		}
	};

	function callback(error, response, body) {
		//console.log("From Wit error" + JSON.stringify(response));

		if (!error && response.statusCode == 200) {
			var info = JSON.parse(body);
			var generatedText = '';

			//console.log("\n\n\n\n\n******\nFrom Wit" + JSON.stringify(info));
			generatedText = "I'm sorry, I don't know about that yet.";
			if (info.entities.Intent) {
				if (info.entities.Intent[0].value) {
					//console.log("\n\n\n******\n " + info.entities.Intent[0].value);
					switch (info.entities.Intent[0].value) {
					case 'greeting':
						generatedText = speech.greet();
						wit.text_action(generatedText);
						return res.json({
							text : generatedText
						});
						break;
					case 'snow white':
						generatedText = speech.snow_white();
						wit.text_action(speech.snow_white());
						return res.json({
							text : generatedText
						});
						break;
					case 'weather':
						speech.weather(function (text, weather) {
							generatedText = text;
							wit.text_action(generatedText);
							res.json({
								text : generatedText
							});
						});

						//generatedText = "I'm sorry, I don't know about that yet."

						break;
					case 'news':
						speech.news(
							function (text, news) {
							generatedText = text;
							wit.display_news(news);
							res.json({
								text : generatedText
							});
						});
						break;
					case 'maps':
						speech.map_action(info.entities, function (text) {

							res.json({
								text : text
							});
						});
						break;
					case 'appearance':
						wit.appearance();
						res.json({
							text : generatedText
						});
						break;
					case 'user status':

						return res.json({
							text : speech.user_status()
						});
						break;
					case 'user name':
						wit.text_action(speech.user_name);
						return res.json({
							text : speech.user_name
						});
						break;
					case 'personal status':
						wit.text_action("Great, thanks for asking");
						return res.json({
							text : "Great, thanks for asking"
						});

						break;
					case 'joke':
						var jokes = [
							"Artificial intelligence is no match for natural stupidity.",
							"This morning I made a mistake and poured milk over my breakfast instead of oil, and it rusted before I could eat it.",
							"An Englishman, an Irishman and a Scotsman walk into a bar. The bartender turns to them, takes one look, and says, \"What is this - some kind of joke?\"",
							"What's an onomatopoeia? Just what it sounds like!",
							"Why did the elephant cross the road? Because the chicken retired.",
							"Today a man knocked on my door and asked for a small donation towards the local swimming pool. I gave him a glass of water.",
							"A recent study has found that women who carry a little extra weight live longer than the men who mention it.",
							"I can totally keep secrets. It's the people I tell them to that can't.",
							"My therapist says I have a preoccupation with vengeance. We'll see about that.",
							"Money talks ...but all mine ever says is good-bye.",
							"I started out with nothing, and I still have most of it.",
							"I used to think I was indecisive, but now I'm not too sure.",
							"I named my hard drive dat ass so once a month my computer asks if I want to 'back dat ass up'.",
							"A clean house is the sign of a broken computer.",
							"My favorite mythical creature? The honest politician.",
							"Regular naps prevent old age, especially if you take them while driving.",
							"For maximum attention, nothing beats a good mistake.",
							"Take my advice. I'm not using it."
						];

						generatedText = jokes[speech.random_choice(jokes.length)];

						wit.text_action(generatedText);
						return res.json({
							text : generatedText
						});

						break;
					case 'insult':
						generatedText = "That's not very nice. Talk to me again when you have fixed your attitude";
						wit.text_action(generatedText);
						return res.json({
							text : generatedText
						});
						break;
					case 'appreciation':
						var phrases = [
							"No problem!",
							"Any time",
							"You are welcome",
							"You're welcome",
							"Sure, no problem",
							"Of course",
							"Don't mention it",
							"Don't worry about it"
						];
						generatedText = phrases[speech.random_choice(phrases.length)];

						wit.text_action(generatedText);
						return res.json({
							text : generatedText
						});

						break;
					case 'device':
						//var type = "light"; // light /fan / all
						//var value = 'on'; // '' true > on ,false > off
						var type = info.entities.device ? info.entities.device[0].value : "";
						var value = info.entities.on_off ? info.entities.on_off[0].value : "";
						var location = info.entities.location ? info.entities.location[0].value : "";
						// Check wether light is turned or not if on

						var info = {
							device : type,
							action : value
						};

						//console.log( "***** "+JSON.stringify(info) );
						request({
							method : 'post',
							body : info,
							json : true,
							url : "http://localhost:3000/" + "device"
						});

						generatedText = "Yeah smarty I will turn " + value + (type === " all " ? "" : " the ") + type + (location ? "  of " + location : "") + " In seconds. ";
						return res.json({
							text : generatedText
						});
						break;
					case 'Mirror':
						//console.log(" ## " + info.entities.action.value);
						var mirrorCmd = {};
						if (info.entities.action) {
							if (info.entities.action[0].value === "on") {
								mirrorCmd  = { "value" : "on" };
								generatedText = "It's good to see you. what can i do for you?";
							}

							if (info.entities.action[0].value === "off") {
								mirrorCmd  = { "value" : "off" };
								generatedText = "Going to sleep";

							}
							if(mirrorCmd ){
								request({
									method : 'post',
									body : mirrorCmd,
									json : true,
									url : "http://localhost:3000"
								});
							}
	

						}
						return res.json({
							text : generatedText
						});
						break;
					default:
						generatedText = "I'm sorry, I don't know about that yet."
							wit.text_action(generatedText);
						return res.json({
							text : generatedText
						});
						break;

					}

				}

			} else {
				res.json({
					text : generatedText
				});
			}

		}
	}

	request(options, callback);

});

module.exports = router;
