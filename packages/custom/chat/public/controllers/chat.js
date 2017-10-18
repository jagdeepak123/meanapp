'use strict';
/* jshint latedef:nofunc */
var mediaConstraints = {
     optional: [],
     mandatory: {
         OfferToReceiveAudio: true,
         OfferToReceiveVideo: true
     }
 };

 var offerer, answerer;

 window.RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
 window.RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
 window.RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
 window.URL = window.webkitURL || window.URL;

 window.iceServers = {
     iceServers: [{url:'stun:stun01.sipphone.com'},
                  {url:'stun:stun.ekiga.net'},
                  {url:'stun:stun.fwdnet.net'},
                  {url:'stun:stun.ideasip.com'},
                  {url:'stun:stun.iptel.org'},
                  {url:'stun:stun.rixtelecom.se'},
                  {url:'stun:stun.schlund.de'},
                  {url:'stun:stun.l.google.com:19302'},
                  {url:'stun:stun1.l.google.com:19302'},
                  {url:'stun:stun2.l.google.com:19302'},
                  {url:'stun:stun3.l.google.com:19302'},
                  {url:'stun:stun4.l.google.com:19302'},
                  {url:'stun:stunserver.org'},
                  {url:'stun:stun.softjoys.com'},
                  {url:'stun:stun.voiparound.com'},
                  {url:'stun:stun.voipbuster.com'},
                  {url:'stun:stun.voipstunt.com'},
                  {url:'stun:stun.voxgratia.org'},
                  {url:'stun:stun.xten.com'},
                  {url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' },
                  {url: 'turn:192.158.29.39:3478?transport=udp', credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',username: '28224511:1379330808' },
                  {url: 'turn:192.158.29.39:3478?transport=tcp', credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',username: '28224511:1379330808'}]
 };

 /* offerer */
 
 function offererPeer(userName,ws,stream) {
     offerer = new window.RTCPeerConnection(window.iceServers);
     offerer.addStream(stream);
     offerer.localStream = stream;
     offerer.onaddstream = function (event) {
    	 var offererToAnswerer = document.getElementById('peer1-to-peer2');
         offererToAnswerer.src = URL.createObjectURL(event.stream);
         offererToAnswerer.play();
     };

     offerer.onicecandidate = function (event) {
         if (!event || !event.candidate) return;
         ws.send(JSON.stringify({
        	 'event':'ice',
        	 'from':userName,
        	 'data':{
        		 'sdp':event
        	 }
         }));
         //answerer.addIceCandidate(event.candidate);
     };

     offerer.createOffer(function (offer) {
    	 offerer.lds = offer;
         //offerer.setLocalDescription(offer);
         ws.send(JSON.stringify({
        	 'event':'offer',
        	 'from':userName,
        	 'data':{
        		 'sdp':offer
        	 }
         }));
         //answererPeer(offer, stream);
     }, onSdpError, mediaConstraints);
 }


 /* answerer */

 function answererPeer(userName, ws, offer, stream) {
     answerer = new window.RTCPeerConnection(window.iceServers);
     answerer.addStream(stream);
     answerer.localStream = stream;
     answerer.onaddstream = function (event) {
    	 var answererToOfferer = document.getElementById('peer2-to-peer1');
         answererToOfferer.src = URL.createObjectURL(event.stream);
         answererToOfferer.play();
     };

     answerer.onicecandidate = function (event) {
         if (!event || !event.candidate) return;
         ws.send(JSON.stringify({
        	 'event':'ice',
        	 'from':userName,
        	 'data':{
        		 'sdp':event
        	 }
         }));
         //offerer.addIceCandidate(event.candidate);
     };

     answerer.setRemoteDescription(new window.RTCSessionDescription(offer), function(){}, onSdpError);
     answerer.createAnswer(function (answer) {
         answerer.setLocalDescription(answer);
         ws.send(JSON.stringify({
        	 'event':'answer',
        	 'from':userName,
        	 'data':{
        		 'sdp':answer
        	 }
         }));
         //offerer.setRemoteDescription(answer, onSdpSucces, onSdpError);
     }, onSdpError, mediaConstraints);
 }



 function getUserMedia(callback) {
     navigator.getUserMedia({
         audio: true,
         video: true
     }, callback, function onerror(e) {
         console.error(e);
     });

     
 }

 function onSdpError(e) {
     console.error(e);
 }

 function randomName() {
	 return 'user'+Math.floor(Math.random()*101);
 }
 
 
angular.module('mean.chat').controller('ChatController', ['$scope', 'Global', 'Chat',
  function($scope, Global, Chat) {
    $scope.global = Global;
    $scope.package = {
      name: 'chat'
    };
    $scope.userName = $scope.global.user.name || randomName();
    var wsUri = 'ws://'+window.location.host.replace('3000','3001');
    var ws = new WebSocket(wsUri);
    if (ws!==null) {
		ws.onopen = function() {
			ws.send(JSON.stringify({
	        	 'event':'open',
	        	 'from':$scope.userName,
	        	 'data':{
	        		 'username':$scope.userName
	        	 }
	         }));
		};
		ws.onmessage = function(message) {
			var data = JSON.parse(message.data);
			if (data.event==='open') {
				$scope.connected += 1;
				$scope.addAlert(data.data.username+' joins chat room !!');
			} else if (data.event==='close') {
				$scope.connected -= 1;
				$scope.addAlert(data.data.username+' leaves chat room !!');
			} else if (data.event==='hangup') {
				$scope.endbroadcast(true);
				$scope.addAlert(data.data.username+' hang up the call !!');
			} else if (data.event==='connected') {
				$scope.connected = data.data.count;
				$scope.addAlert(data.owner+' is the owner of the chat room !!');
			} else if (data.event==='offer') {
				$scope.callInProgress = true;
				$scope.$apply();
		    	getUserMedia(function (stream) {
			       	var offererToAnswerer = document.getElementById('peer1-to-peer2');
			       	offererToAnswerer.style.width = '20%';
			       	offererToAnswerer.muted = true;
			        offererToAnswerer.src = URL.createObjectURL(stream);
			        offererToAnswerer.play();
					answererPeer($scope.userName, ws, data.data.sdp, stream);
		    	 });
			} else if (data.event==='ice') {
				if (offerer) offerer.addIceCandidate(new window.RTCIceCandidate(data.data.sdp.candidate));
				if (answerer) answerer.addIceCandidate(new window.RTCIceCandidate(data.data.sdp.candidate));
			} else if (data.event==='answer') {
				offerer.setLocalDescription(offerer.lds);
				offerer.setRemoteDescription(new window.RTCSessionDescription(data.data.sdp), function(){}, onSdpError);
			} else {
				$scope.find();
			}
		};
    }
    
    $scope.addAlert = function(msg) {
    	$scope.alertMessage = msg;
		$scope.$apply();
		setTimeout(function(){
			$scope.alertMessage = '';
			$scope.$apply();
		},5000);
    };
    
    $scope.find = function() {
        Chat.query(function(chat) {
        	$scope.chat = chat;
        });
    };
    
    $scope.sendMessage = function () {
    	var chat = new Chat({content:$scope.content,userName:$scope.userName});
    	chat.$save(function(response) {
    		$scope.content = '';
    		$scope.find();
    		ws.send(JSON.stringify({
	        	 'event':'new',
	        	 'from':$scope.userName,
	        	 'data': {}
	         }));
        });
    };
    
    $scope.broadcast = function() {
    	$scope.callInProgress = true;
    	getUserMedia(function (stream) {
	       	 var answererToOfferer = document.getElementById('peer2-to-peer1');
	       	 answererToOfferer.style.width = '20%';
	       	 answererToOfferer.muted = true; // Avoid audio loopback
	         answererToOfferer.src = URL.createObjectURL(stream);
	         answererToOfferer.play();
    	     offererPeer($scope.userName,ws,stream);
    	 });
    };

    $scope.endbroadcast = function(response) {
    	$scope.callInProgress = false;
		if (offerer) {
	       	var answererToOfferer = document.getElementById('peer2-to-peer1');
	        answererToOfferer.pause();
	        answererToOfferer.src = '';
	        offerer.localStream.stop();
			if (!response) {
				offerer.close();
				ws.send(JSON.stringify({
		        	 'event':'hangup',
		        	 'data':{
		        		 'username':$scope.userName
		        	 }
		         }));
			}
		} else {
	       	var offererToAnswerer = document.getElementById('peer1-to-peer2');
	        offererToAnswerer.pause();
	        offererToAnswerer.src = '';
	        answerer.localStream.stop();
			if (!response) {
				answerer.close();
				ws.send(JSON.stringify({
		        	 'event':'hangup',
		        	 'data':{
		        		 'username':$scope.userName
		        	 }
		         }));
			}
		}
    };

  }
]);
