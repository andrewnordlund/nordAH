if (typeof (nordAH) == "undefined") {
	var nordAH = {};
}

/*
 * Working on:
 *
 * To-do:
 *
 * Working on:
 *
 */
nordAHbg = {
	dbug : nordAH.dbug,
	tabid : null,
	urlList : [],
	nextOrderNum : 0,
	running : false,
	saved : true,
	randomSampleSize : 0,
	sizeOfSite : 0,
	initTab : function () {
		var newTab = browser.tabs.create({url: "content_scripts/cmx.html"});
		newTab.then(function setTabID(tab) { 
			if (nordAHbg.dbug) console.log ("tab: " + tab + ".");
			if (nordAHbg.dbug) {
				var keys = nordburg.getKeys(tab);
				console.log ("Keys: " + keys.join(", "));
			}
			if (nordAHbg.dbug) console.log ("tab: " + nordburg.objToString(tab) + ".");
			nordAHbg.tabid = tab.id;
			if (nordAHbg.dbug) console.log ("tabid: " + nordAHbg.tabid + ".");
		}, nordAH.errorFun);
	},
	updateBadge : function () {
		var badgeStr = "";
		if (nordAHbg.dbug) console.log ("urlList.length: " + nordAHbg.urlList.length + ", randomSampleSize: " + nordAHbg.randomSampleSize + ".");
		
		//if (nordAHbg.urlList.length > 0) { // || nordAHbg.randomSampleSize > 0) {
			badgeStr = nordAHbg.urlList.length.toString(); // +"/"+ nordAHbg.randomSampleSize + (nordAHbg.randomSampleSize > 0 ? " (" + nordAHbg.urlList.length / nordAHbg.randomSampleSize + "%)" : "");
		//}
		if (nordAHbg.dbug) console.log ("Therefore setting the badge text to " + badgeStr + ".");
		if (badgeStr != "") {
			// Not sure why this is only showing the first 3 (instead of 4) characters
			browser.browserAction.setBadgeText({"text":badgeStr});
		}
	}, // End of UpdateBadge

	notify : function (message, sender, sendResponse) {
		if (nordAHbg.dbug) console.log ("nordAH-bg::Got a message: " + message["msg"] + " with task: " + message["task"] + " with sender " + sender + ".");// and sendResponse " + sendResponse + ".");
		if (message["task"] == "startRecording") {
			if (nordAH.dbug) console.log ("Got a message to start recording.");
			browser.tabs.query({active: true, currentWindow: true}).then(nordAHbg.startRecording, nordAH.errorFun);
			
			/*var frameid = null;
			if (nordAHbg.dbug) console.log ("nordAH-bg::Gonna find a comic on " + message["pageURL"] + ".");
			// But first, inject the content script
			//
			// Try this:  get the frames:
			function logFrameInfo (frames) {
				if (nordAHbg.dbug) console.log ("Got: " + frames.length + " frames.");
				if (nordAHbg.dbug) console.log ("nordAH-bg::Tracing sendResponse: " + sendResponse);
				for (var i=0; i<frames.length && ! frameid; i++) {
					if (nordAHbg.dbug) console.log (i + ": frameId:" + frames[i].frameId + ", parentFrameId: " + frames[i].parentFrameId + ", url: " + frames[i].url);
					if (frames[i].url == message["pageURL"]) {
						frameid = frames[i].frameId;
						if (nordAHbg.dbug) console.log ("Because\n" + frames[i].url + " == \n" + message["pageURL"] + " Imma set frameid to " + frameid + ".");
					}
				}
				if (nordAHbg.dbug) console.log ("nordAH-bg::Aboot to send message to tabid: " + nordAHbg.tabid + " and frameid : " + frameid + ".");
				if (nordAHbg.dbug) console.log ("nordAH-bg::Tracing sendResponse: " + sendResponse);
				
				browser.tabs.executeScript(nordAHbg.tabid, {file : "/libs/nordburg.js", frameId : frameid}).then(function () {
					if (nordAHbg.dbug) console.log ("nordAH-bg::Now that nordburg is loaded, now inject the seattlepi-cs.js file to tab " + nordAHbg.tabid + " and frame " + frameid + ".");
					if (nordAHbg.dbug) console.log ("nordAH-bg::Tracing sendResponse: " + sendResponse);
					browser.tabs.executeScript(nordAHbg.tabid, {allFrames: false, frameId: frameid, file : "/content_scripts/seattlepi-cs.js"}).then(function () {
						if (nordAHbg.dbug) console.log ("nordAH-bg::Now that seattlepi-cs.js is loaded, time to send a message to " + message["task"] + " to tab " + nordAHbg.tabid + " and frame " + frameid + "." );
						if (nordAHbg.dbug) console.log ("nordAH-bg::Tracing sendResponse: " + sendResponse);
						browser.tabs.sendMessage(nordAHbg.tabid, message, {frameId: frameid}).then(function (msg) {
							if (nordAHbg.dbug) console.log ("nordAH-bg::Got a response " + msg["msg"] + " with url for image " + msg["imageSrc"] + ".");
							if (nordAHbg.dbug) console.log ("nordAH-bg::Tracing sendResponse: " + sendResponse);
							//sendResponse(msg);
							browser.tabs.sendMessage(nordAHbg.tabid, {"msg": "Found image.  Setting.", "task": "setImage", "imageSrc" : msg["imageSrc"], "alt" : message["alt"], "id":message["id"], "u":message["u"]}, {frameId:0});
							if (nordAHbg.dbug) console.log ("nordAH-bg::Tracing sendResponse: " + sendResponse);
						}, nordAH.errorFun);
					}, nordAH.errorFun);
				}, nordAH.errorFun);
			}
			if (nordAHbg.dbug) console.log ("nordAH-bg::About to get all frames in tabid: " + nordAHbg.tabid + ".");
			if (nordAHbg.dbug) console.log ("nordAH-bg::Tracing sendResponse: " + sendResponse);
			var gettingAllFrames = browser.webNavigation.getAllFrames({tabId: nordAHbg.tabid});
			if (nordAHbg.dbug) console.log ("nordAH-bg::Got all frames.");
			gettingAllFrames.then(logFrameInfo, nordAH.errorFun);
			*/
		} else if (message["task"] == "stopRecording") {
			if (nordAHbg.dbug) console.log ("Got a message to start recording.");
			browser.tabs.query({active: true, currentWindow: true}).then(nordAHbg.stopRecording, nordAH.errorFun);
		} else if (message["task"] == "getRecordingStatus") {
			if (nordAHbg.dbug) console.log ("Sending back message to sender (prolly popup) running: " + nordAHbg.running + ".");
			sendResponse({"msg" : nordAHbg.running});
		} else if (message["task"] == "setNewValues") {
			nordAHbg.sizeOfSite = message["sizeOfSite"];
			nordAHbg.randomSampleSize = message["randomSampleSize"];
			if (nordAHbg.dbug) console.log ("Got randomSampleSize of " + nordAHbg.randomSampleSize + ".");
			if (nordAHbg.running) {
				nordAHbg.saveList();
			}
			nordAHbg.updateBadge();
		} else if (message["task"] == "close") {
			var q = browser.tabs.query({title : browser.i18n.getMessage("assessmentResultsH1")});
			q.then(function (tabs) {
				if (nordAHbg.dbug) console.log ("tabs: " + tabs.length + ".");
				//browser.tabs.remove(tabs);
				
				for (var t = 0; t < tabs.length; t++) {
					if (nordAHbg.dbug) console.log ("Closing " + tabs[t].url + " which has " + nordburg.seeAllKeys(tabs[t]) + ".");
					
					browser.tabs.remove(tabs[t].id);
				}
				
			}, nordAH.errorFun);
		} else if (message["task"] == "clear") {
			if (nordAHbg.dbug) console.log ("nordAH-bg::Clearning url list");
			nordAHbg.urlList = [];
			nordAHbg.updateBadge();
			nordAHbg.saveList().then(function() {
				sendResponse({"msg":"Finished clearning"});
			}, nordAH.errorFun);
			//browser.tabs.sendMessage(nordAHbg.tabid, message);
		} else if (message["task"] == "saveList") {
			nordAHbg.urlList = message["urlList"];
			nordAHbg.saveList().then(function() {
				sendResponse({"msg":"Finished clearning"});
			}, nordAH.errorFun);
		} else {
			if (nordAHbg.dbug) console.log ("Didn't initiate find comic becase " + message["task"] + ".");
			if (message["msg"].match(/asdfadf/)) {
				if (nordAHbg.dbug) console.log ("nordAH-bg::Got a message: " + message["msg"] + " of " + message["imageSrc"] + " from " + message["pageURL"] + ".");
				if (nordAHbg.dbug) console.log("nordAH-bg::Trying to send message to cmx.js.");
				browser.runtime.sendMessage({"msg": "You got this message.", "imageSrc" : message["imageSrc"], "pageURL" : message["pageURL"]});
			}
		}
	}, // End of notify
	startRecording : function (tabs) {
		if (nordAHbg.dbug) console.log ("Start recording....");
		if (tabs[0]) {
			nordAHbg.running = true;
			nordAHbg.tabid = tabs[0].id;
			if (nordAHbg.dbug) console.log ("Add the current tab: " + tabs[0].id + ": " + tabs[0].url + "/" + tabs[0].title + ".");
			nordAHbg.addUrl(tabs[0].url, tabs[0].title);
			if (nordAHbg.dbug) console.log ("Now add an event listener for onUpdated.");
			//browser.tabs.onActivated.addListener(nordAHbg.getTabInfo);
			browser.tabs.onUpdated.addListener(nordAHbg.getTabInfo);
		} else {
			console.error ("Couldn't get active tab.");
		}
	}, // End of startRecording
	stopRecording : function (tabs) {
		if (nordAHbg.dbug) console.log ("Stop recording....");
		browser.tabs.onUpdated.removeListener(nordAHbg.getTabInfo);
		nordAHbg.running=false;
		nordAHbg.tabid = null;
	}, // End of stopRecording
	getTabInfo : function (tabId, changeInfo, tabInfo) {
		if (nordAHbg.dbug) console.log ("Getting tab info for tabid " + tabId + ": " + tabInfo.url + "(" + tabInfo.title + ").");
		if (tabId == nordAHbg.tabid && tabInfo.status == "complete") {
			if (nordAHbg.dbug) console.log ("Saving " + tabInfo.url + "(" + tabInfo.title + ").");
			nordAHbg.addUrl(tabInfo.url, tabInfo.title);
			browser.tabs.executeScript(tabId, {file : "libs/nordAH.js"}).then (
				function () {
					browser.tabs.executeScript(tabId, {file : "libs/nordburg.js"}).then (function () {
						browser.tabs.executeScript(tabId, {file : "content_scripts/nordAH-cs.js"});
					}, nordAH.errorFun);
				}, nordAH.errorFun);
		}
	}, // End of getTabInfo
	addUrl : function (url, title) {
		if (nordAHbg.dbug) console.log ("addUrl:: seeing if I should add.");
		var output = ["addUrl::"];
		var toAdd = true;
		var i = nordburg.allInstancesOf(nordAHbg.urlList, "url", url, nordAHbg.dbug);

		if (nordAHbg.dbug) console.log("Number of instances of " + url + ": " + i.length + ".");
		if (i.length > 0) {
			//output += "The url is in the list at place " + i.join() + ".\n";
			// A-HA!!!!  This only checks the _first_ instance of the URL.  So if I URL is the same
			// for both languages, then every pageload the second language generates will compare
			// the french title with the first instance of the url, which will point to the english
			// title.  Mkay....so, now; how do we fix this?
			// Solution:  compare titles.
			//
			// Other possibility:  compare hashes, cuz I wonder about SPAs.
			for (var j = 0; j < i.length && toAdd; j++) {
				if (j == 0) if (nordAHbg.dbug) console.log(nordburg.objToString(i[j], ", \n"));
				if (i[j]["title"] == title) {
					if (nordAHbg.dbug) console.log("But the title is the same so don't add.");
					toAdd = false;
				} else {
					if (nordAHbg.dbug) console.log("Title (old): " + i[j]["title"] + ".\nTitle (new): " + title + ".");
				}
			}
		} else {
			if (nordAHbg.dbug) console.log ("Not in the list.  Leave toAdd as true.");
		}
		if (toAdd) {
			if (nordAHbg.dbug) console.log("toAdd: " + toAdd + ".  So adding.");
			nordAHbg.urlList.push({"url" : url, "title" : title, "order" : nordAHbg.nextOrderNum});
			nordAHbg.nextOrderNum++;
			nordAHbg.saved = false;
			//nordAHbg.setRecordingLblValue("recording");
			// Should probably update the Show and Clear commands.
			//if (nordAHbg.urlList.length > 0 ) {
			//	nordAHbg.showCmd.setAttribute("disabled", false);
			//	nordAHbg.clearCmd.setAttribute("disabled", false);
			//}
			nordAHbg.saveList();
			nordAHbg.updateBadge();
		} else {
			if (nordAHbg.dbug) console.log("toAdd: " + toAdd + ".  So not adding.");
			//nordAHbg.setRecordingLblValue("beenHereBefore");
		}
		var tmpVal = nordAHbg.dbug;
		//nordURLTracker.dbug =true;
		if (nordAHbg.dbug) console.log (output.join("\n"));
	}, // End of addUrl
	saveList : function () {
		var saving = browser.storage.local.set({"thisSite" : {"randomSampleSize" : nordAHbg.randomSampleSize, "sizeOfSite" : nordAHbg.sizeOfSite, "urlList":nordAHbg.urlList}});
		nordAHbg.saved = true;
		return saving;
	}, // End of saveList
}
browser.browserAction.onClicked.addListener(nordAHbg.initTab);
browser.runtime.onMessage.addListener(nordAHbg.notify);
console.log ("nordAH-bg.js loaded: " + nordAHbg.dbug + ".");
