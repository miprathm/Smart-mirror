var fs = require('fs'); 
module.exports = {	
	deviceStatus : {
		'fan' : 'off',
		'light' :'off'
	},
	getDeviceStatus : function(callback){
		var that = this;
		fs.readFile('device.json','utf8',function(err,data){
			if(err){
				console.log(JSON.stringify(err));
				that.saveDeviceStatus(that.deviceStatus);
				data = that.deviceStatus;
			}
			//console.log(" In Devicejs  "+JSON.stringify(data));
			if(callback){
				callback(data);
			}
		});
	},	
	saveDeviceStatus : function(json,callback){
		fs.writeFile('device.json',JSON.stringify(json),'utf8',callback);
	}		
};