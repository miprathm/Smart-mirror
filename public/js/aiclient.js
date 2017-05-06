//aiclient.js

var aiclient = {

	// Default module config.
	config : {
		animationSpeed : 0.5 * 1000,
		iconTable : {
			"clear-day" : "wi-day-sunny",
			"partly-cloudy-day" : "wi-day-cloudy",
			"cloudy" : "wi-cloudy",
			"wind" : "wi-cloudy-windy",
			"rain" : "wi-rain",
			"thunderstorm" : "wi-thunderstorm",
			"snow" : "wi-snow",
			"fog" : "wi-fog",
			"clear-night" : "wi-night-clear",
			"partly-cloudy-night" : "wi-night-cloudy",
			"hail" : "wi-rain",
			"tornado" : "wi-rain"
		}
	},
	start : function () {
		console.log("Starting module: " + this.config);
		var that = this;

		socket.on('STATEMENT', function (socket) {
			that.getDom('STATEMENT', socket);
			//console.log(' Refresh Content ');
		});
		socket.on('IMAGE', function (socket) {
			that.getDom('IMAGE', socket);
			//console.log(' Refresh Content ');
		});
		socket.on('WEATHER', function (socket) {
			that.getDom('WEATHER', socket);
			//console.log(' Refresh Content ');
		});
		socket.on('FACE', function (socket) {
			that.getDom('FACE', socket);
			//console.log(' Refresh Content ');
		});
		socket.on('HOLIDAYS', function (socket) {
			that.getDom('HOLIDAYS', socket);
			//console.log(' Refresh Content ');
		});

		socket.on('NEWS', function (socket) {
			that.getDom('NEWS', socket);
		});
	},
	// Override dom generator.
	getDom : function (current_selection, info) {
		var that = this;
		console.log(" *** " + current_selection + " " + info);
		var wrapper = document.getElementById("center-panel");
		while (wrapper.childNodes.length >= 1) {
			wrapper.removeChild(wrapper.firstChild);
		}

		//var wrapper = document.createElement("div");
		switch (current_selection) {
		case "STATEMENT":
			//console.log("%%%%%%%%%%5 "+JSON.stringify(info));
			wrapper.innerHTML = info.text;
			wrapper.className = "medium bright";
			break
		case "IMAGE":
			wrapper.innerHTML = "<img src=\"" + info.imageurl + "\" style=\"border:1px solid black;max-width:100%;\">"
				break
			case "WEATHER":
				var small = document.createElement("div");
			small.className = "normal medium";
			small.style.margin = "10px 0px"

				var windIcon = document.createElement("span");
			windIcon.className = "wi wi-strong-wind dimmed";
			small.appendChild(windIcon);

			var windSpeed = document.createElement("span");
			windSpeed.innerHTML = " " + info.weather.windSpeed + " mph" //this.windSpeed
				small.appendChild(windSpeed);

			var spacer = document.createElement("span");
			spacer.innerHTML = "&nbsp;";
			small.appendChild(spacer);

			var sunriseSunsetIcon = document.createElement("span");
			if (info.weather.hour >= 4 && info.weather.hour < 10) {
				sunriseSunsetIcon.className = "wi dimmed " + "wi-sunrise"; //this.sunriseSunsetIcon
			} else if (info.weather.hour >= 10 && info.weather.hour < 18) {
				sunriseSunsetIcon.className = "wi dimmed " + "wi-day-sunny"; //this.sunriseSunsetIcon
			} else if (info.weather.hour >= 18 && info.weather.hour < 22) {
				sunriseSunsetIcon.className = "wi dimmed " + "wi-sunset"; //this.sunriseSunsetIcon
			} else {
				sunriseSunsetIcon.className = "wi dimmed " + "wi-night-clear"; //this.sunriseSunsetIcon
			}
			small.appendChild(sunriseSunsetIcon);

			var sunriseSunsetTime = document.createElement("span");
			sunriseSunsetTime.innerHTML = " " + "Now" //this.sunriseSunsetTime;
				small.appendChild(sunriseSunsetTime);

			var large = document.createElement("div");
			large.className = "xlarge light";

			var weatherIcon = document.createElement("span");
			weatherIcon.className = "wi weathericon " + this.config.iconTable[info.weather.icon]//this.weatherType;
				large.appendChild(weatherIcon);

			var temperature = document.createElement("span");
			temperature.className = "bright";
			temperature.innerHTML = " " + info.weather.temperature + "&deg;"; //this.temperature
			large.appendChild(temperature);

			large.style.margin = "20px 0px"

				wrapper.appendChild(small);
			wrapper.appendChild(large);
			break;
		case "FACE":
			wrapper.innerHTML = "<img src='./img/face.gif'" + "\" style=\"border:1px solid black;max-width:50%;\">"
				break
			case "HOLIDAYS":
				var title = document.createElement('div')
				title.innerHTML = info.holiday.localName
				title.className = "large bright";
			title.style.margin = "10px"

				var date = new Date(info.holiday.date.year, info.holiday.date.month - 1, info.holiday.date.month)

				var subtitle = document.createElement('div')
				subtitle.innerHTML = date.toDateString()
				subtitle.className = "medium bright";
			subtitle.style.margin = "10px"

				wrapper.appendChild(title)
				wrapper.appendChild(subtitle)
				break
			case "NEWS":
				var title = document.createElement('div')
				title.innerHTML = "News"
				title.className = "medium bright";
			title.style.margin = "20px"

				wrapper.appendChild(title)

				var table = document.createElement("table");
			table.className = "large";

			for (var a in info.articles) {
				var article = info.articles[a];

				var row = document.createElement("tr");
				table.appendChild(row);

				var iconCell = document.createElement("td");
				iconCell.className = "bright weather-icon";
				row.appendChild(iconCell);

				var icon = document.createElement("span");
				icon.innerHTML = "<img src='./img/newspaper_icon.png'" + "\" style=\"width:45px;height:45px;\">"
					icon.style.margin = "10px 10px"
					iconCell.appendChild(icon);

				var title = document.createElement("span");
				title.className = "day";
				title.innerHTML = article;
				iconCell.appendChild(title);
			}

			wrapper.appendChild(table)
			break
		default:
			break
		}
		//document.getElementsByTagName('body')[0].appendChild(wrapper);
		//return wrapper
	},

	// Override socket notification handler.
	socketNotificationReceived : function (notification, payload) {

		console.log("module received: " + notification + " $ " + JSON.stringify(this.config));
		//var wrapper = document.createElement("div");

		var self = this

			if (notification == "STATEMENT") {
				this.current_selection = "STATEMENT"
					this.text = payload.text
					this.updateDom(this.config.animationSpeed);
			} else if (notification == "IMAGE") {
				this.imageURL = payload.imageurl
					this.current_selection = "IMAGE"
					this.updateDom(this.config.animationSpeed);
			} else if (notification == "WEATHER") {
				this.current_selection = "WEATHER"
					this.weather = payload
					this.updateDom(this.config.animationSpeed);
			} else if (notification == "CLEAR") {
				this.current_selection = ""
					this.updateDom(this.config.animationSpeed);
			} else if (notification == "FACE") {
				this.current_selection = "FACE"
					this.updateDom(this.config.animationSpeed);
			} else if (notification == "NEWS") {
				this.current_selection = "NEWS"
					this.articles = payload.articles
					this.updateDom(this.config.animationSpeed);
			} else if (notification == "HOLIDAYS") {
				this.current_selection = "HOLIDAYS"
					this.holiday = payload.holiday
					this.updateDom(this.config.animationSpeed);
			}
	}
};
