if (typeof (nordAH) == "undefined") {
	var nordAH = {};
}

nordAH = {
	dbug : false,
	today : null,
	defaultDate : null,
	loaded : false,
	urlList : [],
	randomSampleSize : 0,
	sizeOfSite : 0,
	postLoad : [],
	options : {
		"dbug" : nordAH.dbug,
		"tabCount" : false,
		"tabs" : true
	},
	init : function () {
		nordAH.randomSampleSize = 0;
		nordAH.sizeOfSite = 0;
		nordAH.urlList = [];
	},
	saveSite : function (data, callback) {
		var callback = null;
		if (arguments.length > 0) callback = arguments[0];

		var blah = browser.storage.local.set({"thisSite" : nordAH.composeJSONFile()});
		//nordAH.updateBadge();
		if (callback && typeof callback != "undefined") blah.then(callback(), nordAH.errorFun);
	},	
	composeJSONFile : function () {
		var saveObj = {};
		saveObj["randomSampleSize"] = nordAH.randomSampleSize;
		saveObj["sizeOfSite"] = nordAH.sizeOfSite;
		saveObj["urlList"] = nordAH.urlList;
		if (nordAH.dbug) console.log ("composeJSONFile::Saving: sampleSize: " + saveObj["randomSampleSize"] + ", sizeOfSite: " + saveObj["sizeOfSite"] + ", urlList: " + saveObj["urlList"].length + ".");
		return saveObj;
	}, // End of composeJSONFile
	updateBadge : function () {
		if (nordAH.dbug) console.log ("Sending updating badgetext.");
		/*
		if (nordAH.options["badge"] === true) {
			browser.browserAction.setBadgeText({"text" : nordAH.activeFriendsList.length.toString()});
		} else {
			browser.browserAction.setBadgeText({"text" : ""});
		}
		*/
	}, // End of updateBadge
	loadOptions : function (success, failure) {
		if (nordAH.dbug) console.log ("Loading Options.");
		var getting = browser.storage.local.get("options");
		getting.then(function (savedObj) {
			if (nordAH.dbug) console.log ("Got stored options.");

			if (nordburg.countObjs(savedObj) == 0) {
				if (nordAH.dbug) console.log ("There ain't no options there.");
			} else {
				if (nordAH.dbug) console.log ("Got saved options.");
				if (savedObj.hasOwnProperty("options")) savedObj = savedObj["options"];
				if (nordAH.dbug) {
					console.log ("Something there.");
					console.log ("typeof(savedObj): " + typeof(savedObj) + ".");
					console.log ("savedObj: " + savedObj + ".");
					//for (var k in savedObj) {
					//	console.log (k);
					//}
				}
				for (let opt in nordAH.options) {
					if (savedObj.hasOwnProperty(opt)) {
						nordAH.options[opt] = savedObj[opt];
						if (opt == "dbug") {
							nordAH.dbug = nordAH.options[opt];
							//nordburg.dbug = nordAH.dbug;
							//console.log ("Setting nord(burg|FBTracker).dbug to " + nordAH.dbug + " because opt[dbug] = " + savedObj[opt] + ".");
						} else if (opt == "tabCount") {
							if (nordAH.dbug) console.log (`loadOptions::Setting tabCount to ${nordAH.options.tabCount}.`);
						}
					}
				}

			}
			nordAH.setLoaded();
			if (success) success();
		}, failure);

	}, // End of loadOptions
	setLoaded : function () {
		nordAH.loaded = true;
		nordAH.afterLoad();
	}, // End of setLoaded
	afterLoad : function () {
		if (nordAH.dbug) console.log (`afterLoad::postLoad functions ${nordAH.postLoad.length}: ${nordAH.postLoad}.`);
		for (let i = 0; i < nordAH.postLoad.length; i++) {
			if (nordAH.dbug) console.log (`afterLoad::Executing postLoad function ${i}.`);
			nordAH.postLoad[i]();
		}
	}, // End of afterLoad
	addToPostLoad : function (funcs) {
		nordAH.postLoad = Object.assign(nordAH.postLoad, funcs);
		if (nordAH.loaded) {
			nordAH.afterLoad();
		}
	}, // End of afterLoad
	getSaved : function (success, failure) {
		var getting = browser.storage.local.get("thisSite");
		//if (nordAH.dbug) console.log ("getSaved::Just got ran.  Now dealing with promises.");
		getting.then (function (savedObj) {
			if (nordAH.dbug) console.log ("getSaved::Got stored stuff from thisSite");
			if (savedObj.hasOwnProperty("thisSite")) savedObj = savedObj["thisSite"];

			
			if (nordburg.countObjs(savedObj) == 0) {
				if (nordAH.dbug) console.log ("getSaved::There ain't nothing there.");
				nordAH.init();
			} else {
				if (nordAH.dbug) console.log ("getSaved::Got savedstuff.");
				nordAH.getSavedFromJSON(savedObj);
			}
			// Why is this being called twice?  I'll comment out in friends.js
			
			if (success && typeof success != "undefined") success();

		}, failure);
		//if (nordAH.dbug) console.log ("Promises being dealt with.");
	}, // End of getSaved
	getSavedFromJSON : function (saveObj) {
		var callback = null;
		if (arguments.length > 1) callback = arguments[1];

		if (saveObj.hasOwnProperty("randomSampleSize")) nordAH.randomSampleSize = saveObj["randomSampleSize"];
		if (saveObj.hasOwnProperty("sizeOfSite")) nordAH.sizeOfSite = saveObj["sizeOfSite"];
		if (saveObj.hasOwnProperty("urlList")) nordAH.urlList = saveObj["urlList"];
		
		if (nordAH.dbug) console.log ("getSavedFromJSON::got sampleSize: " + nordAH["randomSampleSize"] + ", siteSize: " + nordAH["sizeOfSite"] + ", urlList: " + nordAH["urlList"].length + ".");
		
		if (callback && typeof callback != "undefined") callback();
	}, // End of getSavedFromJSON
	errorFun : function (e) {
		console.error ("Error! " + e);
	}, // End of errorFun
}

if (nordAH.dbug) console.log ("lib::nordAH loaded.");
nordAH.loadOptions(nordAH.init, nordAH.errorFun);
