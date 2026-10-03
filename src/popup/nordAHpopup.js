if (typeof (nordAHpopup) == "undefined") {
	var nordAHpopup = {};
}

nordAHpopup = {
	dbug : nordAH.dbug,
	running : false,
	tabId : null,
	tabURL : null,
	htmlEls : {"numOfPagesTxt" : null, "numOfPagesBtn" : null, "randomSampleSizeOutput" : null, "numOfPagesResultsP" : null, "assessmentToggleBtn" : null, "showResultsBtn" : null, "clearBtn" : null, "titlesSection":null, "languagesSection":null, "interopSection" : null, "doctypeSection":null, "encodingSection":null, "feedSection":null, "wriSection" : null},
	init : function (savedObj) {
		/*
		var sizeOfSite =0, randomSampleSize = "0";
		if (savedObj && nordburg.countObjs(savedObj) > 0) {
			if (nordAHpopup.dbug) console.log ("Got savedObj with " + nordburg.countObjs(savedObj) + " properties.");
			//savedObj = savedObj["thisSite"];
			if (nordAHpopup.dbug) console.log ("Got savedObj with " + nordburg.countObjs(savedObj) + " properties.");
			sizeOfSite = savedObj["thisSite"]["sizeOfSite"];
			randomSampleSize = savedObj["thisSite"]["randomSampleSize"];
			if (nordAHpopup.dbug) console.log ("Got " + sizeOfSite + " -> " + randomSampleSize + ".");
		} else {
			if (nordAHpopup.dbug) console.log ("Didn't get savedObj.");
		}
		*/
		nordAHpopup.prepPage();
	
		
		if (nordAHpopup.htmlEls["titlesSection"] || nordAHpopup.htmlEls["languagesSection"] || nordAHpopup.htmlEls["doctypeSection"] || nordAHpopup.htmlEls["encodingSection"] || nordAHpopup.htmlEls["feedSection"]) {
			if (nordAHpopup.dbug) console.log ("Sending message getInfo to tabId: " + nordAHpopup.tabId + ".");
			var worked = true;
			var presentData = function (msg) {
				nordAHpopup.presentTitles(msg["titles"]);
				nordAHpopup.presentLangs(msg["langs"]);
				nordAHpopup.presentDoctype(msg["doctype"]);
				nordAHpopup.presentEncoding(msg["encoding"]);
				nordAHpopup.presentFeeds(msg["feeds"]);
			}

			if (nordAHpopup.dbug) console.log ("About to call the content script.");
			var sndMsg = browser.tabs.sendMessage(nordAHpopup.tabId, {"msg":"Get Info.", "task":"getInfo"}).catch(function (x) {
				worked = false;
				if (nordAHpopup.dbug) console.log ("Caught something: " + x.toString());
				if (x.toString() == "Error: Could not establish connection. Receiving end does not exist.") {
					browser.tabs.executeScript(nordAHpopup.tabId, {file : "/libs/nordburg.js"}).then (function () {
						browser.tabs.executeScript(nordAHpopup.tabId, {file : "/libs/nordAH.js"}).then(function () {
							browser.tabs.executeScript(nordAHpopup.tabId, {file : "/content_scripts/nordAH-cs.js"}).then(function () {
								if (nordAHpopup.dbug) console.log ("Okay, all content scripts should be loaded now.  Gonna try sending message again.");
								var sndMsg2 = browser.tabs.sendMessage(nordAHpopup.tabId, {"msg":"Get Info.", "task":"getInfo"});
								sndMsg2.then(presentData, nordAH.errorFun);
							}, nordAH.errorFun);
						}, nordAH.errorFun);
					}, nordAH.errorFun);
				}
			});
			sndMsg.then(function (msg) {
				if (worked) presentData(msg)}
				, nordAH.errorFun);

		}
		browser.runtime.sendMessage({"msg" : "Get recording status", "task" : "getRecordingStatus"}).then(function (msg) {
			if (msg.msg) {
				if (nordAHpopup.dbug) console.log ("Setting running to " + msg.msg + ".");
				nordAHpopup.running = true;
				nordAHpopup.toggleRecordingButtons();
			}
		}, null);
		
	}, // End of init
	prepPage : function () {
		// Title/Heading
		document.title = browser.i18n.getMessage("extensionName");
		var heading = document.getElementsByTagName("heading")[0];
		var h1 = nordburg.createOptionsHTMLElement(document, "h1", {"parentNode":heading, "nodeText":document.title});

		var assessmentSection = document.getElementById("assessmentSection");
		var assessmentSectionH2 = nordburg.createOptionsHTMLElement(document, "h2", {"parentNode":assessmentSection, "nodeText":browser.i18n.getMessage("Assessment"), "insertBefore":"randomSampleSection"});
		// Random Sample Section
		var randSampleSection = document.getElementById("randomSampleSection");
		var randomSampleSectionH2 = nordburg.createOptionsHTMLElement(document, "h3", {"parentNode":randomSampleSection, "nodeText":browser.i18n.getMessage("randomSample")});

		var pgsDiv1 = nordburg.createOptionsHTMLElement(document, "div", {"parentNode":randomSampleSection, "class":"fieldHolder"});
		var pgsLbl = nordburg.createOptionsHTMLElement(document, "label", {"parentNode":pgsDiv1, "for":"numOfPagesTxt", "textNode":browser.i18n.getMessage("pagesInSite") + ":"});
		nordAHpopup.htmlEls["numOfPagesTxt"] = nordburg.createOptionsHTMLElement(document, "input", {"parentNode":pgsDiv1, "id":"numOfPagesTxt", "value":nordAH.sizeOfSite});

		var pgsDiv2 = nordburg.createOptionsHTMLElement(document, "div", {"parentNode":randomSampleSection, "class":"fieldHolder"});
		nordAHpopup.htmlEls["numOfPagesBtn"] = nordburg.createOptionsHTMLElement(document, "button", {"parentNode":pgsDiv2, "nodeText":browser.i18n.getMessage("calculate")});
		nordAHpopup.htmlEls["numOfPagesBtn"].addEventListener("click", nordAHpopup.calcRndmSample, false);


		nordAHpopup.htmlEls["numOfPagesResultsP"] = nordburg.createOptionsHTMLElement(document, "div", {"parentNode":randomSampleSection, "id":"numOfPagesResultsP", "aria-live":"polite", "tabindex":"0", "textNode":browser.i18n.getMessage("numOfPagesResultsP") + " "});
		nordAHpopup.htmlEls["randomSampleSizeOutput"] = nordburg.createOptionsHTMLElement(document, "output", {"parentNode":nordAHpopup.htmlEls["numOfPagesResultsP"], "for":"numOfPagesTxt", "textNode":nordAH.randomSampleSize});
		

		// Assessment Process Section
		var assessmentProcessSection = document.getElementById("assessmentProcessSection");
		var assessmentProcessSectionH2 = nordburg.createOptionsHTMLElement(document, "h3", {"parentNode":assessmentProcessSection, "nodeText":browser.i18n.getMessage("assessmentProcess")});

		var toggleBtnDiv = nordburg.createOptionsHTMLElement(document, "div", {"parentNode":assessmentProcessSection, "class":"fieldHolder"});
		nordAHpopup.htmlEls["assessmentToggleBtn"] = nordburg.createOptionsHTMLElement(document, "button", {"parentNode":toggleBtnDiv, "nodeText":browser.i18n.getMessage("startRecording")});
		nordAHpopup.htmlEls["assessmentToggleBtn"].addEventListener("click", nordAHpopup.startRecording, false);

		var showResultsBtnDiv = nordburg.createOptionsHTMLElement(document, "div", {"parentNode":assessmentProcessSection, "class":"fieldHolder"});
		nordAHpopup.htmlEls["showResultsBtn"] = nordburg.createOptionsHTMLElement(document, "button", {"parentNode":showResultsBtnDiv, "nodeText":browser.i18n.getMessage("showResults")});
		nordAHpopup.htmlEls["showResultsBtn"].addEventListener("click", nordAHpopup.showResults, false);

		var clearBtnDiv = nordburg.createOptionsHTMLElement(document, "div", {"parentNode":assessmentProcessSection, "class":"fieldHolder"});
		nordAHpopup.htmlEls["clearBtn"] = nordburg.createOptionsHTMLElement(document, "button", {"parentNode":clearBtnDiv, "nodeText":browser.i18n.getMessage("clear")});
		nordAHpopup.htmlEls["clearBtn"].addEventListener("click", nordAHpopup.showResults, false);

		// Page section
		var pageSection = document.getElementById("pageSection");
		var pageSectionH2 = nordburg.createOptionsHTMLElement(document, "h2", {"parentNode":pageSection, "nodeText":"Page", "insertBefore":"titlesSection"});

		var urlAndTitleP = nordburg.createOptionsHTMLElement(document, "p", {"id":"urlAndTitle", "parentNode":pageSection, "nodeText": "", "class":"selectable", "insertAfter":pageSectionH2});

		// Titles section
		nordAHpopup.htmlEls["titlesSection"] = document.getElementById("titlesSection");
		var titlesSectionH2 = nordburg.createOptionsHTMLElement(document, "h3", {"parentNode":nordAHpopup.htmlEls["titlesSection"], "nodeText":browser.i18n.getMessage("titles")});

		// Languages section
		nordAHpopup.htmlEls["languagesSection"] = document.getElementById("languagesSection");
		var languagesSectionH2 = nordburg.createOptionsHTMLElement(document, "h3", {"parentNode":nordAHpopup.htmlEls["languagesSection"], "nodeText":browser.i18n.getMessage("languages")});

		// Interoperability Section
		nordAHpopup.htmlEls["interopSection"] = document.getElementById("interopSection");
		//var interopSectionH2 = nordburg.createOptionsHTMLElement(document, "h3", {"parentNode":nordAHpopup.htmlEls["interopSection"], "nodeText":browser.i18n.getMessage("interoperability")});


		// Doctype section
		nordAHpopup.htmlEls["doctypeSection"] = document.getElementById("doctypeSection");
		var doctypeSectionH2 = nordburg.createOptionsHTMLElement(document, "h3", {"parentNode":nordAHpopup.htmlEls["doctypeSection"], "nodeText":"Doctype"});

		//nordAHpopup.htmlEls["interopSection"].insertBefore(interopSectionH2, nordAHpopup.htmlEls["doctypeSection"]);

		// Encoding section
		nordAHpopup.htmlEls["encodingSection"] = document.getElementById("encodingSection");
		var encodingSectionH2 = nordburg.createOptionsHTMLElement(document, "h3", {"parentNode":nordAHpopup.htmlEls["encodingSection"], "nodeText":browser.i18n.getMessage("encoding")});

		// Feed section
		nordAHpopup.htmlEls["feedSection"] = document.getElementById("feedSection");
		var feedSectionH2 = nordburg.createOptionsHTMLElement(document, "h3", {"parentNode":nordAHpopup.htmlEls["feedSection"], "nodeText":browser.i18n.getMessage("feeds")});
	},
	startRecording : function () {
		if (nordAHpopup.dbug) console.log ("Start recording....");
		browser.runtime.sendMessage({"msg" : "Start recording, yo", "task" : "startRecording", "randomSampleSize" : nordAH.randomSampleSize, "sizeOfSite" : nordAH.sizeOfSite});
		nordAHpopup.running = true;
		nordAHpopup.toggleRecordingButtons();
	}, // End of startRecording
	stopRecording : function () {
		if (nordAHpopup.dbug) console.log ("Stop recording...");
		browser.runtime.sendMessage({"msg" : "Stop recording, yo", "task" : "stopRecording"});
		nordAHpopup.running = false;
		nordAHpopup.toggleRecordingButtons();
	}, // End of stopRecording
	toggleRecordingButtons : function () {
		if (nordAHpopup.running) {
			nordAHpopup.htmlEls["assessmentToggleBtn"].innerHTML = browser.i18n.getMessage("stopRecording");
			nordAHpopup.htmlEls["assessmentToggleBtn"].removeEventListener("click", nordAHpopup.startRecording);
			nordAHpopup.htmlEls["assessmentToggleBtn"].addEventListener("click", nordAHpopup.stopRecording, false);
		} else {
			nordAHpopup.htmlEls["assessmentToggleBtn"].innerHTML = browser.i18n.getMessage("startRecording");
			nordAHpopup.htmlEls["assessmentToggleBtn"].removeEventListener("click", nordAHpopup.stopRecording);
			nordAHpopup.htmlEls["assessmentToggleBtn"].addEventListener("click", nordAHpopup.startRecording, false);
		}
	}, // End of toggleRecordingButtons
	showResults : function () {
		// Somehow show results
		if (nordAHpopup.dbug) console.log ("Gonna somehow show results.");
		browser.tabs.create({url: "/results/nordAHResults.html"});
	}, // End of showResults
	clear : function () {
		if (nordAHpopup.dbug) console.log ("Clearning....");
		browser.runtime.sendMessage({"msg" : "Clear the list", "task" : "clear"});
	}, //
	calcRndmSample : function (e) {
		if (nordAHpopup.dbug) console.log ("Calculating.");
		var siteSizeTxt = nordAHpopup.htmlEls["numOfPagesTxt"].value;
		if (nordAHpopup.dbug) console.log ("Got siteSizeTxt: " + siteSizeTxt + ".");
		var rv = 0;
		if ((siteSizeTxt.match(/mr\./i) || siteSizeTxt.match(/mister/i)) && siteSizeTxt.match(/f(alcon)?/i)) {
			if (nordAHpopup.dbug) console.log ("Hello Mr. Falcon.  Trying an easter egg.");
			nordAHpopup.easterEgg();
		} else {
			if (nordAHpopup.dbug) console.log ("Not Mr. Falcon.  Not gona do an easter egg yet.");
		}
		var numOfPages = siteSizeTxt.replace(/\D/g, "");

		if (numOfPages.match(/\d/)) {
			if (numOfPages <= 32) {
				rv = numOfPages;
			} else if (numOfPages > 32 && numOfPages <= 60) {
				rv = 32;
			} else if (numOfPages > 60 && numOfPages <= 80) {
				rv = 37;
			} else if (numOfPages > 80 && numOfPages <= 100) {
				rv = 41;
			} else if (numOfPages > 100 && numOfPages <= 150) {
				rv = 47;
			} else if (numOfPages > 150 && numOfPages <= 200) {
				rv = 51;
			} else if (numOfPages > 200 && numOfPages <= 300) {
				rv = 56;	
			} else if (numOfPages > 300 && numOfPages <= 500) {
				rv = 60;
			} else if (numOfPages > 500 && numOfPages <= 750) {
				rv = 63;
			} else if (numOfPages > 750 && numOfPages <= 1000) {
				rv = 64;
			} else if (numOfPages > 1000 && numOfPages <= 2500) {
				rv = 66;
			} else if (numOfPages > 2500 && numOfPages <= 5000) {
				rv = 67;
			} else if (numOfPages > 5000) {
				rv = 68;
			}
			if (numOfPages % 17 == 1) {
				if (nordAHpopup.dbug) console.log ("Gonna do an easter egg.");
				nordAHpopup.easterEgg();
			}
			nordAHpopup.htmlEls["randomSampleSizeOutput"].innerHTML = rv;
			nordAHpopup.htmlEls["numOfPagesResultsP"].focus();
			nordAH.randomSampleSize = rv;
			nordAH.sizeOfSite = numOfPages;
			//var thisSiteInfo = {"randomSampleSize" : nordAHpopup.randomSampleSize, "sizeOfSite" : nordAHpopup.sizeOfSite};
			//var setting = browser.storage.local.set({"thisSite" : thisSiteInfo});
			//setting.then(null, nordAH.errorFun);
			nordAH.saveSite()
			if (nordAHpopup.dbug) console.log ("Sending message to background: setNewValues, randomSampleSize: "  + nordAH.randomSampleSize +  ", sizeOfSite:" + nordAH.sizeOfSite + ".");
			browser.runtime.sendMessage({"msg":"Reset size of site details.", 
				"task":"setNewValues", 
				"randomSampleSize" : nordAH.randomSampleSize, 
				"sizeOfSite" : nordAH.sizeOfSite}).then(null, nordAH.errorFun);
		}
	}, // End of calcRndmSample
	presentTitles : function (titles) {
		if (nordAHpopup.dbug) console.log ("Presenting titles.");
		var titlesDL = nordburg.createHTMLElement(document, "dl", {"parentNode":nordAHpopup.htmlEls["titlesSection"], "id":"titlesList"});
		var titleTypes = {"titleTag" : browser.i18n.getMessage("titleTag"),
			       "metaTitle" : browser.i18n.getMessage("metadata"),
			       "h1s" : browser.i18n.getMessage("h1s"),
			       "Breadcrumbs" : browser.i18n.getMessage("breadcrumbs")};
		for (var k in titles) {
			var newItem = nordburg.createHTMLElement(document, "dt", {"textNode": titleTypes[k] + ":", "parentNode":titlesDL});
			if (k.match(/titleTag|readcrumbs/i)) {
				var style = (k == "titleTag" && titles[k] == browser.i18n.getMessage("noTitleTag") ? "border: thick solid #AA0000;" : "");
				var newValueDD = nordburg.createHTMLElement(document, "dd", {"parentNode":titlesDL});
				var newValueSpan = nordburg.createHTMLElement(document, "span", {"textNode":titles[k], "parentNode":newValueDD, "style" : style, "class":"selectable"});
			} else if (k.match(/h1s/i)) {
				var newValue = nordburg.createHTMLElement(document, "dd", {"parentNode":titlesDL});
				var newOL = nordburg.createHTMLElement(document, "ol", {"parentNode":newValue, "id":k+"List"});
				//for (var i = 0; i  < titles[k].length; i++) {
				for (var h1 in titles[k]) {
					var newLI = nordburg.createHTMLElement(document, "li", {"parentNode":newOL});
					var titleText = nordburg.createHTMLElement(document, "span", {"parentNode":newLI, "textNode":h1, "class":"selectable"});
					if (titles[k][h1]) property = nordburg.createHTMLElement(document, "span", {"parentNode":newLI, "textNode" : "(property=\"" + titles[k][h1] + "\")", "class":"unselectable", "style":"margin-left: 1.13em;"});
				}
			} else {
				var newValue = nordburg.createHTMLElement(document, "dd", {"parentNode":titlesDL});
				var newOL = nordburg.createHTMLElement(document, "ol", {"parentNode":newValue, "id":k+"List"});
				for (var i = 0; i  < titles[k].length; i++) {
					var newLI = nordburg.createHTMLElement(document, "li", {"parentNode":newOL, "textNode":titles[k][i], "class":"selectable"});
				}
			}
		}
		var urlAndTitleP = null;
		urlAndTitleP = document.getElementById("urlAndTitle");
		if (urlAndTitleP) {
			urlAndTitleP.innerHTML = "[" + titles["titleTag"] + "](" + nordAHpopup.tabURL +")";
		}
	},
	presentLangs : function (langs) {
		if (nordAHpopup.dbug) console.log ("Presenting Languages.");
		var displayList = nordburg.createHTMLElement(document, "table", {"id":"resultList", "border":"1", "parentNode" : nordAHpopup.htmlEls["languagesSection"]});

		var hRow = nordburg.createHTMLElement(document, "tr", {"parentNode":displayList});

		var idHCol = nordburg.createHTMLElement(document, "th", {"scope":"col", "textNode": browser.i18n.getMessage("elementID"), "parentNode":hRow});
		var langHCol = nordburg.createHTMLElement(document, "th", {"scope":"col", "textNode":"lang", "parentNode":hRow});
		var xmlLangHCol = nordburg.createHTMLElement(document, "th", {"scope":"col", "textNode":"xml:lang", "parentNode":hRow});
		var dirHCol = nordburg.createHTMLElement(document, "th", {"scope":"col", "textNode":"dir", "parentNode":hRow});
		var textHCol = nordburg.createHTMLElement(document, "th", {"scope":"col", "textNode":browser.i18n.getMessage("text"), "parentNode":hRow});

		if (displayList != null) {
			for (var n in langs) {
				var newRow = nordburg.createHTMLElement(document, "tr", {"parentNode":displayList});
				var idCol = nordburg.createHTMLElement(document, "th", {"scope":"row", "textNode":langs[n]["id"], "parentNode":newRow});
				var langCol = nordburg.createHTMLElement(document, "td", {"textNode":langs[n]["lang"], "parentNode":newRow});
				var xmlLlangCol = nordburg.createHTMLElement(document, "td", {"textNode":langs[n]["xmllang"], "parentNode":newRow});
				var dirCol = nordburg.createHTMLElement(document, "td", {"textNode":langs[n]["dir"], "parentNode":newRow});
				var textCol = nordburg.createHTMLElement(document, "td", {"textNode":langs[n]["text"], "parentNode":newRow});
			}
		}
	},
	presentDoctype : function (doctype) {
		if (nordAHpopup.dbug) console.log ("Presenting Doctypes.");
		var doctypesDL = nordburg.createHTMLElement(document, "dl", {"parentNode":nordAHpopup.htmlEls["doctypeSection"], "id":"doctypeList"});
		for (var k in doctype) {
			var dt = nordburg.createHTMLElement(document, "dt", {"parentNode":doctypesDL, "textNode":k});
			var dd = nordburg.createHTMLElement(document, "dd", {"parentNode":doctypesDL, "textNode":doctype[k]});
		}
	}, // End of presentDoctype
	presentEncoding : function (encoding) {
		if (nordAHpopup.dbug) console.log ("Presenting Encoding.");
		var encodingDL = nordburg.createHTMLElement(document, "dl", {"parentNode":nordAHpopup.htmlEls["encodingSection"], "id":"encodingList"});
		for (var k in encoding) {
			var dt = nordburg.createHTMLElement(document, "dt", {"parentNode":encodingDL, "textNode":encoding[k]["title"]});
			if (nordAHpopup.dbug) console.log ("About to to do " + k + ": " + encoding[k] + ".");
			var dd = nordburg.createHTMLElement(document, "dd", {"parentNode":encodingDL, "textNode":encoding[k]["value"]});
		}
		

	}, // End of presentEncoding
	presentFeeds : function (feeds) {
		if (nordAHpopup.dbug) console.log ("Presenting Feeds.  First: type:");
		var feedDL = nordburg.createHTMLElement(document, "dl", {"parentNode":nordAHpopup.htmlEls["feedSection"], "id":"feedTypeDL"});
		if (nordAHpopup.dbug) console.log ("DL created.  Now for the dt:");
		var dt = nordburg.createHTMLElement(document, "dt", {"parentNode":feedDL, "textNode":browser.i18n.getMessage("feedType")});
		if (nordAHpopup.dbug) console.log ("dt created.  Now for the dd:");
		var dd = nordburg.createHTMLElement(document, "dd", {"parentNode":feedDL, "textNode":feeds["feedType"]});

		if (nordAHpopup.dbug) console.log ("Now list:: with " + nordburg.countObjs(feeds["feedslist"]) + " feeds.");
		var feedsOL = nordburg.createHTMLElement(document, "ol", {"parentNode":nordAHpopup.htmlEls["feedSection"], "id":"feedsList"});
		//for (var i = 0; i < feeds["feedslist"].length; i++) {
		for (var feed in feeds["feedslist"]) {
			var li = nordburg.createHTMLElement(document, "li", {"parentNode":feedsOL, "textNode":"Feed: " + feed});
			if (feeds["feedslist"][feed]) var link = nordburg.createHTMLElement(document, "span", {"parentNode":li, "textNode": feeds["feedslist"][feed], "class":"selectable parenthesised", "style":"margin-left:1.13em;"});
		}
	}, // End of presentFeeds


	easterEgg : function () {
		// ugh.
		if (nordAHpopup.dbug) console.log ("Gonna do an easter egg.");
		if (nordAHpopup.dbug) console.log ("About to call the content script.");
		browser.tabs.sendMessage(nordAHpopup.tabId, {"msg":"Gonna do easter egg", "task":"easterEgg"}).catch(function (x) {
			if (nordAHpopup.dbug) console.log ("Caught something: " + x.toString());
			if (x.toString() == "Error: Could not establish connection. Receiving end does not exist.") {
				browser.tabs.executeScript(nordAHpopup.tabId, {file : "/libs/nordburg.js"}).then (function () {
					browser.tabs.executeScript(nordAHpopup.tabId, {file : "/libs/nordAH.js"}).then(function () {
						browser.tabs.executeScript(nordAHpopup.tabId, {file : "/content_scripts/nordAH-cs.js"}).then(function () {
							browser.tabs.sendMessage(nordAHpopup.tabId, {"msg":"Gonna do easter egg", "task":"easterEgg"});
						}, nordAH.errorFun);
					}, nordAH.errorFun);
				}, nordAH.errorFun);
			}
		});
		//browser.runtime.sendMessage({"msg":"Gonna do easter egg", "task":"easterEgg"});
	},
}

browser.tabs.query({active: true, currentWindow: true}).then(function(tabs) {
	if (nordAHpopup.dbug) console.log ("Setting tabId to " + tabs[0].id + ".");
	nordAHpopup.tabId = tabs[0].id;
	nordAHpopup.tabURL = tabs[0].url;
	if (nordAHpopup.dbug) console.log ("tabId is now " + nordAHpopup.tabId + ".");
	if (nordAHpopup.dbug) console.log ("tabURL is now " + nordAHpopup.tabURL + ".");

	//var getting = browser.storage.local.get("thisSite");
	//getting.then(nordAHpopup.init, nordAH.errorFun);

	nordAH.getSaved(function () {
		if (nordAHpopup.dbug) {
			console.log ("sampleSize: " + nordAH.randomSampleSize);	
			console.log ("sizeOfSite: " + nordAH.sizeOfSite);	
			console.log ("About to initPopup.");
		}
		nordAHpopup.init();
	}, nordAH.errorFun);

}, nordAH.errorFun);


if (nordAHpopup.dbug) console.log ("nordAHpopup.js loaded.");
