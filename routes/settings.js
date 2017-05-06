module.exports = {
	common: {
		daysOfWeek: ["sun", "mon", "tue", "wed", "thu", "fri", "sat", "sun"]
	},
	calendar: {
		firstDayOfWeek: 1, // Sunday = 0, Monday = 1
		monthsOfYear: ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"]
	},
	weather: {
		city: "Mumbai",
		countryCode: "IN",
		unitType: "metric", // "metric" or "imperial"
		forecastDays: 5, // max 5
		refreshInterval: 5, // measured in minutes
		token: "&appid=4bc02fc3d411776d3fb99ac64d5e6bbb",
		url: "http://api.openweathermap.org/data/2.5/"
	},
	feed: {
		//url: "http://q.crowdynews.com/v1/content/Loksatta?q=loksatta&count=20&since=0&sort=time&callback=",//
		url:"https://newsapi.org/v1/articles?source=techcrunch&sortBy=top&apiKey=73abffd4e0454658b2ad5ad877e7369d",
		title: "",
		entryCount: 30,
		timeout: 10,
		newsurl :"https://newsapi.org/v1/articles?source=the-hindu&sortBy=top&apiKey=73abffd4e0454658b2ad5ad877e7369d&country=in"
	}
};
