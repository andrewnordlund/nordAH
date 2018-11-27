if (typeof (nordAHResults) == "undefined") {
	var nordAHResults = {};
}

nordAHResults = {
	dbug : nordAH.dbug,
	settings : {
		"counterColSpan" : "1",
		"orderColSpan" : "1",
		"urlColSpan" :	"3",
		"titleColSpan" : "4"
	},
	sortOrder : {"col":"order", "reverse" :false},
	urlList : [],
	orderedUrlList : [],
	stringBundle : {
		notRecording : "Not Recording",
		recording : "Recording",
		beenHereBefore : "Been Here Before",
		youMustView : "You must view %x out of %y",
		totalTime : "Total time of this assessment is",
		title : "Title",
		order : "Order",
		genList : "Generate List",
		okay : "Okay",
		saveAs : "Save As",
		load : "Load",
		note : "NOTE: This add-on always uses urlList.xml to keep track of URLs. Saving saves a snapshot in time that can be loaded (into urlList.xml) later. This is used in case you need to stop one assessment, do another, then return to the first.",
		remove : "Remove",
		undo : "Undo",
		resultsTitle : "Results Window",
		sortBy : "Sort By",
		saved : "Backed up",
	},
	undoTime: 2500,
	init : function (savedObj) {
		document.title = browser.i18n.getMessage("assessmentResultsH1");
		document.language = browser.i18n.getMessage("lang");
		document.getElementsByTagName("html")[0].setAttribute("lang", document.language);
		if (savedObj.hasOwnProperty("thisSite")) {
			savedObj = savedObj["thisSite"];
			if (nordAHResults.dbug) console.log ("All keys: " + nordburg.seeAllKeys(savedObj) + ".");
			if (savedObj.hasOwnProperty("urlList")) nordAHResults.urlList = savedObj["urlList"];
		} else {
			if (nordAHResults.dbug) console.log ("Nothing in siteInfo");
			nordburg.createHTMLElement(document, "p", {"parentNode":resultsTableHolderDiv, "textNode":browser.i18n.getMessage("problemGettingSiteInfo")});
		}

		var header = document.getElementsByTagName("header")[0];
		var h1 = nordburg.createHTMLElement(document, "h1", {"parentNode" :  header, "textNode":browser.i18n.getMessage("assessmentResultsH1")});

		var resultsTableHolderDiv = document.getElementById("resultsTableHolderDiv");
		var closeBtn = document.getElementById("closeBtn");
		if (closeBtn) {
			closeBtn.innerHTML = browser.i18n.getMessage("close");
			closeBtn.addEventListener("click", function () {
				browser.runtime.sendMessage({"task" : "close", "msg":"Closing results window."});
			}, false);
		} else {
			if (nordAHResults.dbug) console.log ("Couldn't get close button.");
		}
		if (nordAHResults.urlList.length == 0) {
			if (nordAHResults.dbug) console.log ("Nothing in siteInfo");
			nordburg.createHTMLElement(document, "p", {"parentNode":resultsTableHolderDiv, "textNode":browser.i18n.getMessage("noPagesInAssessment")});
		} else {
			if (nordAHResults.dbug) console.log ("About to create a table because there are " + nordAHResults.urlList.length + " urls saved.");
			
			nordAHResults.generateTable();
			

		}
	},
	generateTable : function () {
		var resWin = document;
		var resultsTableHolderDiv = resWin.getElementById("resultsTableHolderDiv");
		if (resultsTableHolderDiv) {
			nordburg.removeChildren(resultsTableHolderDiv);

			var displayTable = nordburg.createHTMLElement(resWin, "table", {"id":"resultTable", "parentNode":resultsTableHolderDiv});
			nordburg.removeChildren(displayTable);

			var topRow = resWin.createElement("tr");
			topRow.setAttribute("id", "urlRow");
			var cols = {"url" : "URL", "title" : browser.i18n.getMessage("title"), "order" : browser.i18n.getMessage("order")};
				
			nordburg.createHTMLElement(resWin, "td", {"scope":"col", "parentNode":topRow, "colspan" : nordAHResults["settings"]["counterColSpan"]});
			for (var i in cols) {
				if (nordAHResults.dbug) console.log ("Trying to get colspan: extensions.nordAHResults." + i + "ColSpan.");

				var th = nordburg.createHTMLElement(resWin, "th", {"scope":"col", "parentNode":topRow, "colspan" : nordAHResults["settings"][i +"ColSpan"]});
				var sortA = nordburg.createHTMLElement(resWin, "a", {"href":"#sort", "id":"sort"+i, "textNode":cols[i],"title":browser.i18n.getMessage("sortBy"), "parentNode":th});
				sortA.addEventListener("click", nordAHResults.reOrder, false);
				topRow.appendChild(th);
				if (nordAHResults.sortOrder["col"] == i) {
					sortA.setAttribute("class", (nordAHResults.sortOrder["reverse"] ? "nordburg-sorted-asc" : "nordburg-sorted-desc"));
				}
			}
			var emptyHeader = nordburg.createHTMLElement(resWin, "td", {"parentNode":topRow});
					
			displayTable.appendChild(topRow);

			nordAHResults.orderedUrlList = (nordAHResults.sortOrder["col"] == "order" ? nordburg.sort(nordAHResults.urlList, nordAHResults.sortOrder["col"], nordAHResults.sortOrder["reverse"], parseInt) : nordburg.sort(nordAHResults.urlList, nordAHResults.sortOrder["col"], nordAHResults.sortOrder["reverse"]));

			for (var k = 0; k < nordAHResults.orderedUrlList.length; k++) {
				var newRow = nordburg.createHTMLElement(resWin, "tr", {"parentNode":displayTable});
				nordburg.createHTMLElement(resWin, "td", {"scope":"col", "parentNode":newRow, "textNode" : (k+1), "colspan" : nordAHResults["settings"]["counterColSpan"]});
				for (var i in cols) {
					var td = nordburg.createHTMLElement(resWin, "td", {"parentNode":newRow, "textNode":nordAHResults.orderedUrlList[k][i], "colspan" : nordAHResults["settings"][i +"ColSpan"]});
				}
				var removeBtnCell = nordburg.createHTMLElement(resWin, "td", {"parentNode":newRow});
				var delBtn = nordburg.createHTMLElement(resWin, "input", {"type":"button", "value":browser.i18n.getMessage("remove"), "id":"delBtn" + k, "parentNode":removeBtnCell});
				delBtn.addEventListener ("click", nordAHResults.getReadyToRemoveURL, false);
			}					
			if (resWin.getElementById("displayList")) nordAHResults.generateList();
			var clearBtn = nordburg.createHTMLElement(document, "button", {"parentNode":resultsTableHolderDiv, "textNode":browser.i18n.getMessage("clear")});

			clearBtn.addEventListener("click", function () {
				nordAHResults.urlList = [];
				nordAHResults.orderedUrlList = [];
				browser.runtime.sendMessage({"msg":"Clear URLs", "task":"clear"}).then(function() {
					browser.tabs.reload({bypassCache: true});
				}, nordAH.errorFun);
			}, false);
		} else { 
			return false;
		}
		return true;
	},
	getReadyToRemoveURL : function () {
		var delBtn = document.getElementById(arguments[0].currentTarget.getAttribute("id"));
		delBtn.setAttribute("value", browser.i18n.getMessage("undo"));
		delBtn.removeEventListener("click", nordAHResults.getReadyToRemoveURL);
		var toRemoveID = setTimeout(function () {
			nordAHResults.removeURL(delBtn);
		}, nordAHResults.undoTime);
		var fn = function () {
			delBtn.removeEventListener("click", fn);
			nordAHResults.dontDelete(delBtn, toRemoveID);

		};
		delBtn.addEventListener("click", fn, false);
		
	},
	dontDelete : function (b, i) {
		var delBtn = b;
		clearTimeout(i);
		delBtn.setAttribute("value", browser.i18n.getMessage("remove"));
		delBtn.addEventListener ("click", nordAHResults.getReadyToRemoveURL, false);
	},
	removeURL : function (delBtn) {
		var delBtnID = delBtn.getAttribute("id").replace(/^delBtn/, "");
		var tr = delBtn.parentNode.parentNode;
		var url = nordAHResults.orderedUrlList[delBtnID]["url"];
		var order = nordAHResults.orderedUrlList[delBtnID]["order"];
		//var output = "";

		var urlI = nordburg.firstInstanceOf(nordAHResults.urlList, "order", order); //Order should be unique
		if (nordAHResults.urlList[urlI]["url"] == url) {
			//output += "size: " + nordAHResults.urlList.length + ".\ndelBtnID: " + delBtnID + ".\nurl: " + url + ".\nDeleting item at index " + urlI + ".\n";
			if (urlI != -1) {
				nordAHResults.urlList.splice(urlI, 1);
				tr.parentNode.removeChild(tr);
				nordAHResults.saveList();
				//nordAHResults.saved = false;
				//nordAHResults.setRecordingLblValue();
			}
			//output += "Size: " + nordAHResults.urlList.length + ".";
		} else {
			//output += "Hmmm, or order and the url don't match.";
		}
	}, // End of removeURL
	saveList : function () {
		browser.runtime.sendMessage({"msg":"Save the list","task":"saveList", "urlList":nordAHResults.urlList}).then(function() {
			// Do something?
			if (nordAHResults.dbug) console.log ("Saved.");
		}, nordAH.errorFun);
	},
	reOrder : function () {
		var thisButton = arguments[0].currentTarget.getAttribute("id");
		if (nordAHResults.sortOrder["col"] == thisButton.replace(/^sort/, "")) {
			nordAHResults.sortOrder["reverse"] = !nordAHResults.sortOrder["reverse"];
		} else {
			nordAHResults.sortOrder["col"]=thisButton.replace(/^sort/, "");
			nordAHResults.sortOrder["reverse"] = false;
		}
		nordAHResults.generateTable();
		document.getElementById(thisButton).focus();
	},

}

document.addEventListener("DOMContentLoaded", function () {
	console.log ("results page is loaded.");
	var getting = browser.storage.local.get("thisSite");
	getting.then(nordAHResults.init, nordAH.errorFun);
}, false);

if (nordAHResults.dbug) console.log ("nordAHResults.js loaded.");
