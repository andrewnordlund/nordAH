if (typeof (nordcmxOpts) == "undefined") {
	var nordcmxOpts = {};
}

nordcmxOpts = {
	dbug : false,
	cmx : {
		lastUpdated : "",
		lastRead : "",
		cmxList : []
	},
	origCmxList : [],
	init : function () {
		var saveBtn, cancelBtn, restoreDefaultsBtn = null;
		saveBtn = document.getElementById("saveBtn");
		cancelBtn = document.getElementById("cancelBtn");
		restoreDefaultsBtn = document.getElementById("restoreDefaultsBtn");

		if (restoreDefaultsBtn) {
			restoreDefaultsBtn.addEventListener("click", nordcmxOpts.restoreDefaults,false);
		} else {
			console.error("Couldn't get Restore Defaults button.");
		}
		if (saveBtn) {
			saveBtn.addEventListener("click", nordcmxOpts.save,false);
		} else {
			console.error("Couldn't get Save button.");
		}
		if (cancelBtn) {
			cancelBtn.addEventListener("click", nordcmxOpts.cancel,false);
		} else {
			console.error("Couldn't get Cancel button.");
		}
		
		nordcmx.getSaved(function (savedObj) {
			if (nordcmxOpts.dbug) console.log ("Got stored stuff.");
			if (nordburg.countObjs(savedObj) == 0) {
				if (nordcmxOpts.dbug) console.log ("There ain't nothing there.");
			} else {
				nordcmxOpts.cmx = savedObj["nordcmx"];
				if (nordcmxOpts.dbug) console.log ("Got " + nordburg.seeAllKeys(savedObj) + ".");
				nordcmxOpts.origCmxList = savedObj["nordcmx"]["cmxList"];
				if (nordcmxOpts.dbug) console.log ("Setting origCmxList to " + nordcmxOpts.origCmxList.length + " items.");
			}
			nordcmxOpts.createComicList();
		}, nordcmxOpts.errorFun);

		nordburg.amILoggedIn(function (cfids) {
			if (cfids) {
				var doc = document;
				var buttonsHolder = doc.getElementById("buttonsHolder");
				var syncButton = nordburg.createOptionsHTMLElement(doc, "input", {"type":"button","value":"Sync","parentNode":buttonsHolder});
				/* What should happen here is the following:
				 * 1) Download the cloudified payFile.xml
				 * 2) Merge the two files into a new file.
				 * 3) Save the new file locally.
				 * 4) Upload the new file.
				 *
				 * If this is the case, maybe you don't need the File upload, but rather a big textarea?
				 * Or maybe a small/invisible textbox so It's not seen.  That might actually be best.
				 */
				var syncformURL = "https://www.nordburg.ca/misc/cloudSync.php"; //nordburg.getCharPref("extensions.nordburg", "syncFormURL");
				var cftID = "3";
				var cloud_files_ID = cfids[cftID]; //nordburg.getCharPref("extensions.nordcmxOpts", "cloudFilesID");
				syncformURL = syncformURL.replace(/\.php?.*$/, ".php?cloud_files_ID=" + cloud_files_ID + "&cftID=" + cftID +"&task=download&hijax=true");
				if (nordcmxOpts.dbug) console.log ("Cloud file: " + syncformURL);
				
				syncButton.addEventListener("click", function () {
					nordburg.getRemoteFile(syncformURL, nordcmxOpts.downloadCloudFile, true, nordburg.uploadSyncFile, cloud_files_ID, cftID);
				}, false);

				var dbugButtonsDiv = nordburg.createOptionsHTMLElement(doc, "div", {"parentNode":buttonsHolder});
				var uploadButton = nordburg.createOptionsHTMLElement(doc, "input", {"type":"button","value":"Upload","parentNode":dbugButtonsDiv});
				uploadButton.addEventListener("click", function () {
					nordburg.uploadSyncFile(cloud_files_ID, cftID, JSON.stringify(nordcmxOpts.cmx));
				}, false);
				var downloadButton = nordburg.createOptionsHTMLElement(doc, "input", {"type":"button","value":"Download and Overwrite","parentNode":dbugButtonsDiv});
				downloadButton.addEventListener("click", function () {
					nordburg.getRemoteFile(syncformURL, function (responseText) {
						var cloudFile = responseText.replace("/\\n/g", "");
						if (cloudFile.match(/\<\?xml .*version="1\.0".*\?\>/)) {
							cloudFile = nordcmxOpts.XMLtoJSON(cloudFile);
						} else {
							if (typeof(cloudFile) == "string") cloudFile = JSON.parse(cloudFile);
							if (nordcmxOpts.dbug) {
								console.log("Got cloudFile...");
								console.log(cloudFile);
								console.log("Of type " + typeof(cloudFile) + ".");
							}
							if (typeof(cloudFile) == "string") cloudFile = JSON.parse(cloudFile);
							nordcmxOpts.cmx = cloudFile;
							nordcmx.save(nordcmxOpts.cmx, nordcmxOpts.createComicList);
						}
					}, true);
				}, false);
				/*
				 * syncButton.addEventListener("click", function () {nordburg.openSyncwin(function() {
					console.log("Got here!");
					var mainContent = null;
					//var innards = JSON.parse(result);
					
					mainContent = document.getElementById("theFormDiv");
					if (mainContent) {
						console.log("Got mainContent.");
						var cftID = null;
						cftID = document.getElementById("cftID");
						var cfts = cftID.getElementsByTagName("option");
						var foundPayTracker = false;
						for (var i = 0; i < cfts.length && !foundPayTracker; i++) {
							if (nordburg.getNodeText(cfts[i]) == "Pay Tracker") {
								cfts[i].setAttribute("SELECTED", "selected");
								foundPayTracker = true;
							}
						}
						var xmlFile = null;
						xmlFile = document.getElementById("xmlFile");
						var cfID = null;
						cfID = document.getElementById("cfID");
						var name = null;
						name = document.getElementById("name");
						nordcmxOpts.syncIdent = "Pay Tracker";
						nordcmxOpts.syncID = "2";
		
						if (xmlFile && cfID && name) {
							xmlFile.setAttribute("value", nordcmxOpts.payFile);
							if (nordcmxOpts.syncIdent) name.setAttribute("value", nordcmxOpts.syncIdent);
							if (nordcmxOpts.syncID) cfID.setAttribute("value", nordcmxOpts.syncID);
						} else {
							console.log ("Didn't get xmlFile.");
						}
					} else {
						console.log ("Didn't get mainContent.");
					}
					
				});}, false);
				*/
				}
			});
	},
	save : function () {
		var comicsListUl = null;
		comicsListUl = document.getElementById("comicsListUl");
		if (comicsListUl) {
			var lis = comicsListUl.getElementsByTagName("li");
			if (lis && lis.length > 0) {
				var cmxList = [];
				for (var i = 0; i < lis.length; i++) {
					var inputs = null;
					inputs = lis[i].getElementsByTagName("input");
					if (inputs && inputs.length > 0) {
						var name = inputs[0].value;
						var url = inputs[1].value;
						if (nordcmxOpts.dbug) console.log (name + ": Checked: " + inputs[2].checked + ".");
						var active = (inputs[2].checked ? true : false);
						if (name.match(/\S/) && url.match(/https?:\/\/.*/i)) {
							if (nordcmxOpts.dbug) console.log ("Saving: name: " + name + ", url: " + url + ", active: " + active + ".");
							cmxList.push({"name":name, "purl":url, "curl":"", "active":active});
						}
						
					} else {
						if (nordcmxOpts.dbug) console.log ("Couldn't find any inputs.");
					}
				}
				// Do actual saving thing here:
				nordcmxOpts.cmx.cmxList = cmxList;
				nordcmxOpts.cmx.lastUpdated = nordburg.getToday();
				nordcmx.save(nordcmxOpts.cmx, nordcmxOpts.createComicList);
			} else {
				if (nordcmxOpts.dbug) console.log ("Couldn't find any lis.");
			}
		} else {
			console.error ("Couldn't get list.");
		}
	},
	restoreDefaults : function () {
		nordcmxOpts.cmx.cmxList = [];
		nordcmxOpts.cmx.cmxList = nordcmx.getDefaultComicList();
		if (nordcmxOpts.dbug) console.log ("Restoring defaults to " + nordcmxOpts.cmx.cmxList.length + " comics.");
		nordcmxOpts.createComicList();
	},
	cancel : function () {
		nordcmxOpts.cmx.cmxList = nordcmxOpts.origCmxList;
		if (nordcmxOpts.dbug) console.log ("Cancelling and setting cmxList back to " + nordcmxOpts.origCmxList.length + " items.");
		nordcmxOpts.createComicList();
	},
	clearComicsList : function () {
		var comicsListDiv = null;
		comicsListDiv = document.getElementById("comicsListDiv");
		if (comicsListDiv) {
			nordburg.removeChildren(comicsListDiv);
		} else {
			if (nordcmxOpts.dbug) console.log ("Couldn't get list to remove.");
		}
	},
	createComicList : function () {
		var comicsListDiv = null;
		var doc = document;
		comicsListDiv = doc.getElementById("comicsListDiv");
		if (comicsListDiv) {
			/*
			var comicsListUl = doc.createElement("ul");
			comicsListUl.setAttribute("id", "comicsListUl");
			comicsListDiv.appendChild(comicsListUl);
			var newComicLi = doc.createElement("li");
			newComicLi.setAttribute("id", nordcmxOpts.cmx.cmxList.length);
			newComicLi.appendChild(doc.createTextNode("New comic will go here."));
			comicsListUl.appendChild(newComicLi);
			*/
			nordcmxOpts.clearComicsList();
			if (nordcmxOpts.dbug) console.log ("About to create " + nordcmxOpts.cmx.cmxList.length + " comics list.");
			var comicsListUl = nordburg.createOptionsHTMLElement(doc, "ul", {"parentNode":comicsListDiv, "id":"comicsListUl"});
			for (var i = 0; i < nordcmxOpts.cmx.cmxList.length; i++) {
				if (nordcmxOpts.dbug) console.log ("About to create " + i + " of " + nordcmxOpts.cmx.cmxList.length + " comics list.");
				nordcmxOpts.createComicInstance(doc, i, nordcmxOpts.cmx.cmxList[i], comicsListUl);
			}
			nordcmxOpts.createComicInstance(doc, nordcmxOpts.cmx.cmxList.length, {"name":"","purl":"","active":false}, comicsListUl);
		} else {
			nordcmxOpts.errorFun("Couldn't get comicListUl.");
		}
	}, // End of init
	createComicInstance : function (doc, i, cmc, parentNode) {
		var newLi = nordburg.createOptionsHTMLElement(doc, "li", {"parentNode": parentNode});
		var nameLbl = nordburg.createOptionsHTMLElement(doc, "label", {"parentNode":newLi, "textNode":"Name:", "for":"cmc" + i});
		var nameTxt = nordburg.createOptionsHTMLElement(doc, "input", {"parentNode":newLi, "id":"cmc" + i, "name":"cmc" + i, "value" : cmc["name"]});
		var urlLbl = nordburg.createOptionsHTMLElement(doc, "label", {"parentNode":newLi, "textNode":"URL:", "for":"cmcURL" + i});
		var urlTxt = nordburg.createOptionsHTMLElement(doc, "input", {"parentNode":newLi, "id":"cmcURL" + i, "name":"cmcURL" + i, "value" : cmc["purl"], "size":"100"});
		var activeChk = nordburg.createOptionsHTMLElement(doc, "input", {"parentNode":newLi, "id":"cmcActive" + i, "name":"cmcActive" + i, "type":"checkbox"});
		if (cmc["active"]) activeChk.setAttribute("checked", "checked");
		var activeLbl = nordburg.createOptionsHTMLElement(doc, "label", {"parentNode":newLi, "textNode":"Active", "for":"cmcActive" + i});
	}, // End of createComicInstance
	errorFun : function (e) {
		console.error ("Error! " + e);
	}, // End of errorFun
}

nordcmxOpts.init();
console.log ("nordcmxOpts-options.js loaded.");
