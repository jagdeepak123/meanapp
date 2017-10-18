'use strict';

// Requires meanio
var mean = require('meanio');
var online = {
	data:[],
	connected:0,
	add:function(obj) {
		obj.id = this.connected;
		this.connected += 1;
		this.data.push({id:obj.id,value:obj});
	},
	remove:function(id) {
		for (var x=0; x<this.data.length; x+=1) {
			if(this.data[x].id===id) {
				var usr = this.data[x].value.user;
				this.data.splice(x,1);
				return usr;
			}
		}
		return null;
	},
	foreach:function(callback) {
		for (var x=0; x<this.data.length; x+=1) {
			callback(this.data[x].value);
		}
	},
	getOwner:function(){
		var owner;
		for (var x=0; x<this.data.length; x+=1) {
			if (!owner) owner = this.data[x].value.user;
		}
		return owner;
	}
};

// Creates and serves mean application
mean.serve({ /*options placeholder*/ }, function(app, config) {
	var port = config.https && config.https.port ? config.https.port : config.http.port;
	console.log('Mean app started on port ' + port + ' (' + process.env.NODE_ENV + ')');
	var WebSocketServer = require('ws').Server;
	//var wss = new WebSocketServer({server: app});
	var wss = new WebSocketServer({port: (port-0)+1});
	wss.on('connection', function(ws) {
		online.add(ws);
		ws.on('message', function(message) {
			online.foreach(function(current){
				if (current.id !== ws.id) {
					current.send(message);
				} else {
					var data = JSON.parse(message);
					if (data.event==='open') {
						current.user = data.from;
					}
				}
			});
		});
		ws.on('close', function(){
			var usr = online.remove(ws.id);
			online.foreach(function(current){
				current.send(JSON.stringify({
		        	 'event':'close',
		        	 'from':usr,
		        	 'data':{
		        		 'username':usr
		        	 }
		         }));
			});
		});
		ws.send(JSON.stringify({
       	 'event':'connected',
       	 'owner':online.getOwner(),
    	 'data':{
    		 'count':online.data.length
    	 }
     }));
	});
});

