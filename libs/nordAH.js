if (typeof (nordAH) == "undefined") {
	var nordAH = {};
}

nordAH = {
	dbug : false,
	today : null,
	defaultDate : null,
	init : function () {
		
	},
	save : function (cmxList, callback) {

	},
	getSaved : function (callback) {
		
	},
	errorFun : function (e) {
		console.error ("Error! " + e);
	}, // End of errorFun
}

if (nordAH.dbug) console.log ("lib::nordAH loaded.");
