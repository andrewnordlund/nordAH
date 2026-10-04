if (typeof (nordAHOpts) == "undefined") {
	var nordAHOpts = {};
}

nordAHOpts = {
	dbug : nordAH.dbug,
	downkeys : {
		"d" : null,
		"m" : null
	},
	els : {
		"devSection": null,
		"dbugChk" : null,
		"placeholderText" : null,
		"optionsSection" : null,
		"tabCountLbl" : null,
		"tabCountChk" : null,
		"tabRB" : null,
		"winRB" : null,
		"saveBtn" : null,
		"cancelBtn" : null
	},
	init : function () {
		for (let el in nordAHOpts.els) {
			nordAHOpts.els[el] = document.getElementById(el);
			
			if (el == "saveBtn") {
				nordAHOpts.els[el].addEventListener("click", nordAHOpts.saveOptions,false);
			} else if (el == "cancelBtn") {
				nordAHOpts.els[el].addEventListener("click", nordAHOpts.fillValues,false);
			}
		}
		nordAH.addToPostLoad([nordAHOpts.fillValues]);
		document.addEventListener("keydown", nordAHOpts.checkKeys, false);
				
	}, // End of init
	fillValues : function () {
		if (nordAHOpts.dbug) console.log ("Filling form values");
		if (nordAH.options["tabs"] === true) {
			nordAHOpts.els["tabRB"].setAttribute("checked", "checked");
		} else {
			nordAHOpts.els["winRB"].setAttribute("checked", "checked");
		}

		nordAHOpts.dbug = nordAH.options.dbug;
		if (nordAH.options.dbug === true || nordAH.options.tabCount == true) {
			if (nordAH.options.dbug === true) nordAHOpts.els["dbugChk"].setAttribute("checked", "checked");
			if (nordAH.options.tabCount === true) nordAHOpts.els["tabCountChk"].setAttribute("checked", "checked");
			nordAHOpts.showDevSection();
		}
	}, // End of fillValues
	checkKeys : function (e) {
		if (nordAHOpts.dbug) console.log ("Key down: " + e.keyCode + ".");
		if (e.keyCode == 68) {
			document.removeEventListener("keydown", nordAHOpts.checkKeys);
			document.addEventListener("keyup", nordAHOpts.checkUpKey, false);

			if (e.keyCode == 68) {
				if (!nordAHOpts.downkeys["d"]) {
					nordAHOpts.downkeys["d"] = (new Date()).getTime();
				}
			}
		}
	}, // End of checkKeys
	checkUpKey : function (e) {
		if (nordAHOpts.dbug) console.log ("Key up: " + e.keyCode + ".");
		if (e.keyCode == 68) {
			document.removeEventListener("keyup", nordAHOpts.checkUpKey);
			document.addEventListener("keydown", nordAHOpts.checkKeys, false);
			
			var keyUpTime = (new Date()).getTime();
			if (e.keyCode == 68) {
				var eTime = keyUpTime - nordAHOpts.downkeys["d"];
				if (eTime > 900) {
					// toggle devSection
					nordAHOpts.showDevSection();
				}
				nordAHOpts.downkeys["d"] = null;
			}
		}
	}, // End of checkUpKey
	showDevSection : function () {
		nordAHOpts.els["devSection"].style.display = "block";
	}, // End of showDevSection

	saveOptions : function () {
		nordAH.options["tabs"] = nordAHOpts.els["tabRB"].checked;
		
		if (nordAHOpts.els["tabRB"].checked === true) {
			nordAH.options["tabs"] = true;
		}
		
		nordAH.options["tabCount"] = nordAHOpts.els["tabCountChk"].checked;
		nordAH.options["dbug"] = nordAHOpts.els["dbugChk"].checked;
		browser.storage.local.set({"options": nordAH.options}).then(function () { if (nordAH.options["dbug"]) console.log ("Options Saved!");}, nordAH.errorFun);

		browser.runtime.sendMessage({"task" : "updateOptions", "options" : nordAH.options});
	}, // End of saveOptions
	errorFun : function (e) {
		console.error ("Error! " + e);
	}, // End of errorFun
}

nordAHOpts.init();
