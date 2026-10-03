if (typeof(nordburg) == undefined) {
	var nordburg = {};
}
/*
 * To do:
 * 	- Generic Syncing functions
 * 		- Investigate some password functions to login to nordburg.ca when needed
 *
 * Working on:
 * 	- getting first, last, allInstancesOf working			- done
 * 	- Make sure getPages have a way of forcing fresh reloads	- Done
 * 	- Keeping browser console persistency		- prolly have to make a special add-on for this.
 * 							- oooohhhh I wonder if there's a greasemonkey script for this?
 *
 * 	- Generic syncing function
 * 		2 ways:
 * 			1) Each add-on has its own syncing function
 * 			2) Nordbar has its own syncwindow for any and all add-ons
 */
nordburg = {
	version : "4.0.23",
	eventList : {},
	dbug : false,
	syncWindow : null,
	loginURL : "https://www.nordburg.ca/users/login.php",
	cloudSyncURL : "https://www.nordburg.ca/misc/cloudSync.php",
	getRemotePage : function (url, callback) {
		var source = null;
		var getFresh = true;
		var args = [];
		var mn = 3;
		if (arguments.length >=mn) {
			getFresh = arguments[2];
			if (arguments.length > mn) {
				args = Array.prototype.slice.call(arguments);
				args = args.slice(mn);	
			}
		}
		if (source) {
			callback(source, args);
		} else {
			var xmlhttp=new XMLHttpRequest();

			if (url.match(/^c:/i)) {
				url = url.replace(/\\/g, "/");
				url = "file:///" + url;
			}
			if (getFresh && !url.match(/[?&]rnd=/i)) {
				if (url.match(/\?/)) { 
					url += "&";
				} else {
					url += "?";
				}
				url += "rnd=" + Math.random()
			}
	
			xmlhttp.open("GET",url,true);
			xmlhttp.onreadystatechange=function () {
				if (xmlhttp.readyState == 4) {
					if (xmlhttp.status == 404) {
						callback("404", args);
					}
					if (xmlhttp.status == 0 || xmlhttp.status == 200) {
						var doc = document.implementation.createHTMLDocument("blah");
						doc.documentElement.innerHTML = xmlhttp.responseText;
						if (nordburg.dbug) {
							console.log ("About to send back " + xmlhttp.responseText + ".");
							var props = [];
							for (var k in xmlhttp) {
								props.push(k + ": " + xmlhttp[k]);
							}
							console.log (props.join("\n"));
						}
						callback(doc, args);
					}
				}
			}
			xmlhttp.send();
		}
		
	},
	getRemoteFile : function (url, callback) {
		var source = null;
		var getFresh = true;
		var args = [];
		var mn = 3;
		if (arguments.length >= mn) {
			getFresh = arguments[2];
			if (arguments.length > mn) {
				args = Array.prototype.slice.call(arguments);
				args = args.slice(mn);	
			}
		}
		if (source) {
			callback(source, args);
		} else {
			var xmlhttp=new XMLHttpRequest();

			if (url.match(/^c:/i)) {
				url = url.replace(/\\/g, "/");
				url = "file:///" + url;
			}
			if (getFresh && !url.match(/[?&]rnd=/i)) {
				if (url.match(/\?/)) { 
					url += "&";
				} else {
					url += "?";
				}
				url += "rnd=" + Math.random()
			}
			if (nordburg.dbug) console.log ("getRemoteFile::About to get " + url);
			xmlhttp.open("GET",url,true);
			xmlhttp.onreadystatechange=function () {
				//console.log ("getRemoteFile::readystate = " + xmlhttp.readyState + " and status is " + xmlhttp.status + ".");
				if (xmlhttp.readyState == 4) {	
					if (xmlhttp.status == 404) {
						callback("404", args);
					}
					if (xmlhttp.status == 0 || xmlhttp.status == 200) {
						if (nordburg.dbug) {
							console.log ("About to send back " + xmlhttp.responseText + ".");
							var props = [];
							for (var k in xmlhttp) {
								props.push(k + ": " + xmlhttp[k]);
							}
							console.log (props.join("\n"));
						}
						callback(xmlhttp.responseText, args);
					}
				}
			}
			xmlhttp.send();
		}
	}, // end of getRemoteFile
	getRemoteXML : function (file, callback) {
		var source = null;
		var getFresh = true;
		var args = [];
		var mn = 3;
		if (arguments.length >= mn) {
			getFresh = arguments[2];
			if (arguments.length > mn) {
				args = Array.prototype.slice.call(arguments);
				args = args.slice(mn);
			}
		}
		if (source) {
			callback(source);
		} else {
			var xmlhttp=new XMLHttpRequest();

			if (file.match(/^c:/i)) {
				file = file.replace(/\\/g, "/");
				file = "file:///" + file;
			}
			if (getFresh && !file.match(/[?&]rnd=/i)) {
				if (file.match(/\?/)) { 
					file += "&";
				} else {
					file += "?";
				}
				file += "rnd=" + Math.random()
			}
	
			xmlhttp.open("GET",file,true);

			xmlhttp.setRequestHeader("Pragma", "no-cache");
			xmlhttp.setRequestHeader("Expires", "-1");
			xmlhttp.setRequestHeader('Cache-Control', 'no-cache');
		
			xmlhttp.onreadystatechange=function () {
				if (xmlhttp.readyState == 4) {
					if (xmlhttp.status == 404) {
						callback("404", args);
					}
					if (xmlhttp.status == 0 || xmlhttp.status == 200) callback(xmlhttp.responseXML, args);
				}
			}
			xmlhttp.send();
		}
	}, // end of getRemoteXML
	getLocalFile : function (file) {
       		var getFresh = true;
		var source=null;
		if (arguments.length >=2) getFresh = arguments[1];
		if (source) {
			return source;
		} else {
			var xmlhttp=new XMLHttpRequest();
			if (file.match(/^[a-z]:/i)) {
				file = file.replace(/\\/g, "/");
				file = "file:///" + file;
			}
			if (!file.match(/^file/i)) file = "file:///" + file;
			try {
				xmlhttp.open("GET",file,false);
				xmlhttp.send();
				return xmlhttp.responseText;
			}
			catch (ex) {
				return null;
			}
		}	
	}, // end of getLocalFile

	// Date functions:
	getYear : function (d) {
		return d.getFullYear();
	},
	getMonth : function (d) {
		return ("0" + (d.getMonth() + 1)).substr(-2, 2);
	},
	getDay : function (d) {
		return ("0" + d.getDate()).substr(-2, 2);
	},
	dateToString(d) {
		return nordburg.getYear(d) + "-" + nordburg.getMonth(d) + "-" + nordburg.getDay(d);
	},
	getToday : function () {
		var today = new Date();
		today = nordburg.getYear(today) + "-" + nordburg.getMonth(today) + "-" + nordburg.getDay(today);
		return today;
	},
	getYesterday : function (td) {
		var output = "Getting yesterday from " + td;
		var d;
		if (td != "" && td != null) {
			d = new Date(td);
			output += "\ntd not null";

		} else {
			d = new Date();
			output += "\ntd was null";
		}
		d.setDate(d.getDate() - 1);
		output += "\nYesterday: " + d;

		return d;
	},
	getTomorrow : function (td) {
		var output = "Getting yesterday from " + td;
		var d;
		if (td != "" && td != null) {
			d = new Date(td);
			output += "\ntd not null";

		} else {
			d = new Date();
			output += "\ntd was null";
		}
		d.setDate(d.getDate() + 1);
		output += "\nYesterday: " + d;
		return d;
	},
	getEnglishMonth : function(m) {
		m = m.replace(/(?:\W|^)jan(vier)?(?:\W|$)?/i, "January");
		m = m.replace(/(?:\W|^)f[e\u00E9]v(rier)?(?:\W|$)?/i, "February");
		m = m.replace(/(?:\W|^)mars?(?:\W|$)?/i, "March");
		m = m.replace(/(?:\W|^)avr(il)?(?:\W|$)?/i,"April");
		m = m.replace(/(?:\W|^)mai(?:\W|$)?/i, "May");
		m = m.replace(/(?:\W|^)j(?:ui?)?n(?:\W|$)?/i, "June");
		m = m.replace(/(?:\W|^)ju(ill?(et)?|l)(?:\W|$)?/i, "July");
		m = m.replace(/(?:\W|^)ao[u\u00FB]t?(?:\W|$)?/i, "August");
		m = m.replace(/(?:\W|^)sep(t(embre)?)?(?:\W|$)?/i, "September");
		m = m.replace(/(?:\W|^)oct(obre)?(?:\W|$)?/i, "October");
		m = m.replace(/(?:\W|^)nov(embre)?(?:\W|$)?/i, "November");
		m = m.replace(/(?:\W|^)d[e\u00E9]c(embre)?(?:\W|$)?/i, "December");
		/*
		for (var m in fMois) {
			console.log ("Trying regex pattern: " + m + ".");
        		m = m.replace(new RegExp(m, 'ig'), fMois[m]);
		}*/
		return m;
	}, // End of getEnglishMonth
	getDateAsObject : function (d) {
		var dbug = false;
		var dbug = (arguments.length == 2 && arguments[1] != null && arguments[1] != false ? true : false);
		if (dbug) console.log ("Got date: " + d + " which is of type " + typeof(d) + ".");
		var rv = null;
		if (typeof(d) == "object" && d instanceof Date) {
			if (dbug) console.log ("Easy peasy leamon squeezy.  It's already a Date.");
			rv = d;
		} else if (typeof(d) == "string") {
			if (dbug) console.log ("It's a string.  Let's try to make a Date out of it.");
			d = nordburg.getEnglishMonth(d);
			if (dbug) console.log ("With an Egnlish month, it should be: " + d +".");
			
			var parts = null;
			if (parts = d.match(/(?:\D|^)(\d\d\d\d)[-\\\/](\d\d)[-\\\/](\d\d)(?:\D|$)/)) {
				rv = new Date(parts[1]+ "-" + parts[2] + "-" + parts[3] + "T00:00:00");
			} else {
				rv = new Date(d);
			}
			if (rv == "Invalid Date") {
				if (dbug) console.log ("Okay, now new Date(d) didn't work.  Gotta try to figure out what the date could be.");
				
				parts = d.match(/(\d\d\d\d)[-\\\/](\d\d)[-\\\/](\d\d)/);
				if (parts) {
					if (dbug) console.log ("That wasn't too hard.  It was in a predictable format.  Trying to create a date out of " + parts[1] + "-" + parts[2] + "-" + parts[3] + ".");
					rv = new Date(parts[1]+ "-" + parts[2] + "-" + parts[3] + "T00:00:00");
				} else {
					if (dbug) console.log ("Oh snap.  This stuff just got real.  If you see 4 digits, it must be the year.");
					var year, mo, day = null;
					if (year = d.match(/(\d\d\d\d)/)) {
						year = year[1];
						if (dbug) console.log ("And that year is " + year + ".  Now look for the month and day.");
						if (month = d.match(/(?:\D|^)(\d\d?)[-\\\/ \s\.](\d\d?)(?:$|\D)/)) {
							if (dbug) console.log ("Trying to figure out which is day and which is month from " + month[1] + " and " + month[2] +".");
							// Now which is which?
							if (month[1] > 12 && month[2] <= 12) {
								mo = month[2];
								day = month[1];
							} else if (month[1] <= 12 && month[2] > 12) {
								mo = month[1];
								day = month[2];
							} else if (month[1] <= 12 && month[2] <= 12) {
								// This is random right here.
								mo = month[1];
								day = month[2];
							} else {
								throw new Error("Could not determine month from " + d + ".");
							}
							rv = new Date(year, parseInt(mo) - 1, day);
						} else {
							if (dbug) console.log ("Didn't find just numbers.  Perhaps the month is written out?");
							var writtenMonth = d.match(/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i);
							if (writtenMonth) {
								mo = writtenMonth[1];
								if (dbug) console.log ("Found a written month: " + mo + ".");
								if (dbug) console.log ("Already had a year: " + year + ".");
								if (day = d.match(/(?:\D|^)(\d\d?)(?:$|\D)/)) {
									if (day[1] <= 31) day = day[1];
									rv = new Date(mo + " " +day+ ", " + year);
								} else {
									throw new Error("Got the month (" + mo + ") and year (" + year + "), but not the day.");
								}
								
								/*
								} else if (parts[3].match(/\d\d\d\d/)) {
									year = parts[3];
									if (parts[1] <= 31) day = parts[1];
								}
								rv = new Date(mo + " " + day + ", " + year);
								*/
								if (rv == "Invalid Date") throw new Error("Couldn't determine date from " + d + ".  Year: " + year + ", month: " + mo + ", day: " + day + ".");
							} else {
								throw new Error("Could not determine month from " + d + ".");
							}
						}
						// If you get here...I forget what I was gonna say.
					} else if (parts = d.match(/(\d\d?)[-\\\/](\d\d?)[-\\\/](\d\d?)/)) {
						if (dbug) console.log ("Couldn't find the year.  Must be in 2 digits.  Friggin' Y2K.");
						if (parts[1] > 31 && parts[2] <= 31 && parts[3] <= 31) {
							year = parts[1];
							if (dbug) console.log ("And that year is " + year + ".");
							if (parts[2] > 12 && parts[3] <= 12) {
								mo = parts[3];
								day = parts[2];
							} else if (parts[2] <=12 && parts[3] > 12) {
								mo = parts[2];
								day = parts[3];
							} else if (parts[2] <=12 && parts[3] <=12) {
								// This is random right here.
								mo = parts[2];
								day = parts[3];
							} else {
								throw new Error("Could not determine day or month from " + d + ".");
							}
						} else if (parts[1] <= 31 && parts[2] > 31 && parts[3] <= 31) {
							year = parts[2];
							if (dbug) console.log ("And that year is " + year + ".");
							if (parts[1] > 12 && parts[3] <= 12) {
								mo = parts[3];
								day = parts[1];
							} else if (parts[1] <=12 && parts[3] > 12) {
								mo = parts[1];
								day = parts[3];
							} else if (parts[1] <=12 && parts[3] <=12) {
								// This is random right here.
								mo = parts[1];
								day = parts[3];
							} else {
								throw new Error("Could not determine day or month from " + d + ".");
							}
						} else if (parts[1] <= 31 && parts[2] <= 31 && parts[3] > 31) {
							year = parts[3];
							if (dbug) console.log ("And that year is " + year + ".");
							if (parts[1] > 12 && parts[2] <= 12) {
								mo = parts[2];
								day = parts[1];
							} else if (parts[1] <=12 && parts[2] > 12) {
								mo = parts[1];
								day = parts[2];
							} else if (parts[1] <=12 && parts[2] <=12) {
								// This is random right here.
								mo = parts[1];
								day = parts[2];
							} else {
								throw new Error("Could not determine day or month from " + d + ".");
							}
						} else {
							throw new Error("Couldn't determine even the year from this mess.");
						}
						rv = new Date(year, parseInt(mo) - 1, day);
					} else {
						throw new Error("Couldn't find anything remotely related to a date in that string.");
					}
				}
			} else {
				if (dbug) console.log ("Yay!  That worked!");
				// Nothing to do here because the passed date string is a valid Date.
			}
		} else {
			// Date is neither a string nor a Date object
			throw "Couldn't determine type of date " + d + " (" + typeof(d) + ").";
		}
		return rv;
	}, // End of getDateAsObject
	getDateAsString : function (d) {
		var dbug = false;
		var dbug = (arguments.length == 2 && arguments[1] != null && arguments[1] != false ? true : false);
		return nordburg.dateToString(nordburg.getDateAsObject(d, dbug));
	}, // End of getDateAsString
	// End of date functions

	countObjs : function (obj) {
		var returnValue = 0;
		for (var i in obj) {
			returnValue++;
		}
		return returnValue;
	},
	getFile : function (url) {
  		var getFresh = true;
		var source = null;
		if (arguments.length >=2) getFresh = arguments[1];
		// If the source has not been loaded
		if(!source) {
			//console.log ("Source not loaded.  Trying AJAX.");
			// Try to load the URL
			if (!url.match(/[?&]rnd=/i)) {
				if (url.match(/\?/)) { 
					url += "&";
				} else {
					url += "?";
				}
				url += "rnd=" + Math.random()
			}
			try {
		                var request = new XMLHttpRequest();
				request.open("get", url, false);
				request.send(null);
				source = request.responseText;
			}
			catch(exception) {
				source = null;
			}
		}
		return source;
	},
	objToString : function (obj) {
		var sep = (arguments.length == 2 &&arguments[1] != null ? arguments[1] : ", ");
		var returnValue = [];
		for (var k in obj) {
			returnValue.push(k + ": " + obj[k]);
		}
		return returnValue.join(sep);
	},
	isEmpty : function (obj) {
		for (var i in obj) {
			return false;
		}
		return true;
	},
	seeAllKeys : function (obj, str) {
		var sep = (arguments.length == 3 &&arguments[2] != null ? arguments[2] : ", ");
		var output = [];
		for (var k in obj) {
			if (str) {
				if (k.match(str)) output.push(k);
			} else {
				output.push(k);
			}
		}
		return output.join(sep);
	},
	removeChildren : function (el) {
		var dbug = (arguments.length == 2 && arguments[1] != null && arguments[1] != false ? true : false);
		while (el.firstChild) {	
			el.removeChild(el.firstChild);
		}
	},
	getNodeText : function(n) {
		var keepSpaces = false;
		if (arguments.length == 2 && arguments[1] != null) keepSpaces = arguments[1];
		var returnValue = "";
		if (n == "undefined") {
			returnValue = "";
		} else {
			for (var i=0; i < n.childNodes.length; i++) {
				if (n.childNodes[i].nodeType == 3 || n.childNodes[i].nodeType == 4) {
					returnValue += n.childNodes[i].nodeValue;
					if (!keepSpaces) returnValue = nordburg.trim(returnValue);
				} else if (n.childNodes[i].nodeType == 1) {
					returnValue += nordburg.getNodeText(n.childNodes[i]);
					if (!keepSpaces) returnValue = nordburg.trim(returnValue);
				}
			}
		}
		return returnValue;
	},
	trim : function (t, l) {
		var returnValue = t.replace(/(\n|\s|\r|\f| )+/g, " ");
		returnValue = returnValue.trim();
		if (l != undefined) {
			if (returnValue.length > l) {
				returnValue = returnValue.substring(0, l) + "...";
			}
		}
		return returnValue;
	},
	getParentWithID : function (n) {
		var pn = n.parentNode;
		var returnValue = "";
		if (pn.hasAttribute("id")) {
			returnValue = pn.nodeName + "#" + pn.getAttribute("id") + " > " + n.nodeName;
		} else if (pn.hasAttribute("name")) {
			returnValue = pn.nodeName + ":name: " + pn.hasAttribute("name") + " > " + n.nodeName;
		} else if (n.nodeName.match(/body/i)) {
			returnValue = "body";
		} else if (pn.nodeName.match(/body/i)) {
			returnValue = "body" + " > " + n.nodeName;
		} else {
			returnValue = nordburg.getParentWithID(pn) + "> " + n.nodeName;
		}
		return returnValue;
	},
	// The next 4 functions are for arrays of objects.
	// I seems to have taken this code from:
	// http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
	sort : function (a, f) {
		var r = (arguments.length>=3 ? arguments[2] : false);
		var p = (arguments.length>=4 ? arguments[3] : null);
		var tarr = a.slice(0);
       		var key = function (x) {return p ? p(x[f]) : x[f]};

		tarr.sort(function (a, b) {
			var A = key(a), B = key(b);
			//console.out("nordURLTracker::sort::r: " + r + ".");
			return (A > B ? 1 : (A < B ? -1 : 0)) * [1, -1][+!!r];
		});
		return tarr;
	},
	firstInstanceOf : function (arr, f, v) {
		var dbug = (arguments.length == 4 && arguments[3] != null && arguments[3] != false ? true : false);
		var returnValue = -1;
		var output = "Looking for " + v + " in " + f + "."
		for (var i = 0; i<arr.length && returnValue == -1; i++) {
			if (arr[i][f] == v) returnValue = i;
		}
		output += "\nReturning " + returnValue + ".";
		if (dbug) console.log (output);
		return returnValue;
	},
	lastInstanceOf : function (arr, f, v) {
		var dbug = (arguments.length == 4 && arguments[3] != null && arguments[3] != false ? true : false);
		var returnValue = -1;
		var output = "Looking for " + v + " in " + f + "."
		for (var i = arr.length-1; i>-1 && returnValue == -1; i--) {
			if (arr[i][f] == v) returnValue = i;
		}
		output += "\nReturning " + returnValue + ".";
		if (dbug) console.log (output);
		return returnValue;
	},
	allInstancesOf : function (arr, f, v) {
		var dbug = (arguments.length == 4 && arguments[3] != null && arguments[3] != false ? true : false);
		var returnValue = [];
		var output = "Looking for " + v + " in " + f + "."
		for (var i = 0; i<arr.length; i++) {
			if (arr[i][f] == v) returnValue.push(arr[i]);
		}
		output += "\nReturning " + returnValue + ".";
		if (dbug) console.log (output);
		return returnValue;
	},
	getKeys : function (obj) {
		var keys = [];

		for(var key in obj) {
			if(obj.hasOwnProperty(key)) keys.push(key);
		}
		return keys;
	},
	createHTMLElement : function (creator, type, attribs) {
		var dbug = (((arguments.length == 4 &&arguments[3] != null && arguments[3] != undefined) || nordburg.dbug == true) ? true : false);
		if (dbug) console.log ("createHTMLElement::dbug: " + dbug + " because arguments.length: " + arguments.length + ", and argument[3]: " + arguments[3] + ".");
		if (dbug) console.log("nordburg::createHTMLElement " + type + (attribs.hasOwnProperty("id") ? "#" + attribs["id"] : "") + (attribs.hasOwnProperty("textNode") ? " containing " + attribs["textNode"] : "") + ".");
		// From: http://stackoverflow.com/questions/26248599/instanceof-htmlelement-in-iframe-is-not-element-or-object
		var iwin = window;
		// idiv instanceof iwin.HTMLElement; // true
		var newEl = creator.createElement(type);
		for (var k in attribs) {
			if (dbug) console.log ("Checking attrib " + k + ".");
			if (k == "parentNode") {
				if (dbug) console.log("createHTMLElement::Dealing with parentnode.");
				var parentNode = nordburg.getHTMLElement(creator, attribs[k], dbug);
				try {
					if (attribs.hasOwnProperty("insertBefore")) {
						var beforeEl = nordburg.getHTMLElement(creator, attribs["insertBefore"], dbug);
						parentNode.insertBefore(newEl, beforeEl);
					} else if (attribs.hasOwnProperty("insertAfter")) {
						var afterEl = nordburg.getHTMLElement(creator, attribs["insertAfter"], dbug);
						parentNode.insertBefore(newEl, afterEl.nextSibling);
					} else {
						parentNode.appendChild(newEl);
					}
				}
				catch (er) {
					console.error("Error appending newEl to parentNode: " + er.message + ".");
				}
			} else if (k == "textNode" || k == "nodeText") {
				if (typeof (attribs[k]) == "string") {
					newEl.appendChild(creator.createTextNode(attribs[k]));
				} else if (attribs[k] instanceof iwin.HTMLElement || attribs[k] instanceof HTMLElement) {
					newEl.appendChild(attribs[k]);
				} else {
					newEl.appendChild(creator.createTextNode(attribs[k].toString()));
				}
			} else if (k.match(/^insert(Before|After)$/)) {
				// Do nothing.
			} else {
				newEl.setAttribute(k, attribs[k]);
			}
		}
		return newEl;
	}, // End of createHTMLElement
	getHTMLElement : function (creator, el) {
		var rv = null;
		var dbug = (((arguments.length == 3 && arguments[2] != null && arguments[2] != undefined && arguments[2] !== false) || nordburg.dbug == true) ? true : false); 
		var iwin = window;
		if (el instanceof HTMLElement || el instanceof iwin.HTMLElement) {
			rv = el;
		} else if (el instanceof String || typeof(el) === "string") {
			try {
				if (dbug) console.log ("Trying to getHTMLElement " + el + ".");
				rv = creator.getElementById(el);
			} catch (er) {
				console.error("Error getting HTML Element #" + el + ".  Apparently that's not on this page.");
			}
		}
		return rv;
	}, // End of getHTMLElement
	createOptionsHTMLElement : function (creator, type, attribs) {
		var dbug = (((arguments.length == 4 &&arguments[3] != null && arguments[3] != undefined) || nordburg.dbug == true) ? true : false);
		//console.log ("createHTMLElement::dbug: " + dbug + " because arguments.length: " + arguments.length + ", and argument[3]: " + arguments[3] + ".");
		if (dbug) console.log("nordburg::createOptionsHTMLElement " + type + (attribs.hasOwnProperty("id") ? "#" + attribs["id"] : "") + (attribs.hasOwnProperty("textNode") ? " containing " + attribs["textNode"] : "") + ".");
		if (dbug) console.log("nordburg::createOptionsHTMLElement Creator is " + creator + ".");

		var newEl = creator.createElement(type);
		for (var k in attribs) {
			if (dbug) console.log ("Checking attrib " + k + ".");
			if (k == "parentNode") { // && attribs[k] instanceof HTMLElement) {
				if (dbug) console.log("Dealing with parentnode.");
				var parentNode = nordburg.getHTMLElement(creator, attribs[k], dbug);
				try {
					if (attribs.hasOwnProperty("insertBefore")) {
						var beforeEl = nordburg.getHTMLElement(creator, attribs["insertBefore"], dbug);
						parentNode.insertBefore(newEl, beforeEl);
					} else if (attribs.hasOwnProperty("insertAfter")) {
						var afterEl = nordburg.getHTMLElement(creator, attribs["insertAfter"], dbug);
						parentNode.insertBefore(newEl, afterEl.nextSibling);
					} else {
						parentNode.appendChild(newEl);
					}
				}
				catch (er) {
					console.error("Error appending newEl to parentNode: " + er.message + ".");
				}
			} else if (k == "textNode" || k == "nodeText") {
				if (typeof (attribs[k]) == "string") {
					newEl.appendChild(creator.createTextNode(attribs[k]));
				} else if (attribs[k] instanceof HTMLElement) {
					newEl.appendChild(attribs[k]);
				} else {
					newEl.appendChild(creator.createTextNode(attribs[k].toString()));
				}
			} else {
				newEl.setAttribute(k, attribs[k]);
			}
		}
		return newEl;
	}, // End of createOptionsHTMLElement
	openSyncwin : function (callback) {
		var maxHeight = window.innerHeight;
		var height = (maxHeight ? (maxHeight*0.8) : "700px");
		var maxWidth = window.innerWidth;
		var width = (maxWidth ? (.8*maxWidth) : "700px");
		var dbug = (arguments.length == 2 && arguments[1] != null && arguments[1] != false ? true : false);
		if (nordburg.syncWindow == null || nordburg.syncWindow.closed) {
			nordburg.syncWindow = window.open("chrome://nordbar/content/sync.html", "nordburgSyncWindow", "chrome,centerscreen,width=" + width + ",height=" + height + ",scrollbars=yes, resizable=yes,");
		} else {
			nordburg.syncWindow.focus();
		}
		nordburg.syncWindow.addEventListener("load", function () {
			var closeBtn = null;
			closeBtn = nordburg.syncWindow.document.getElementById("closeBtn");
			if (closeBtn) {
				closeBtn.addEventListener("click", function () {nordburg.syncWindow.close();}, false);
			}
			var mainContent = null;
			mainContent = nordburg.syncWindow.document.getElementById("syncMainContent");
			if (mainContent) {
				nordburg.amILoggedIn(function (aili) {
					if (aili) {
						nordburg.showSyncForm(callback);
					} else {
						var msg = nordburg.createHTMLElement(nordburg.syncWindow.document, "p", {"parentNode":mainContent, "textNode":"You must be logged in first."});
						nordburg.getLoginForm(mainContent, nordburg.showSyncForm, callback);
					}
				});
			}
		}, false);
	}, // End of openSyncwin
	showSyncForm : function (callback) {
		/* Syncing should happen like this:
		 * 1) Each add-on downloads the cloud XML file
		 * 2) It gets merged with the local one.
		 * 3) The new one gets saved locally.
		 * 4) The new one gets uploaded to the cloud.
		 */
		var syncformURL = nordburg.cloudSyncURL; //"https://www.nordburg.ca/misc/cloudSync.php"; //nordburg.getCharPref("extensions.nordburg", "syncFormURL");
		var params = "?hijax=true&task=getForm";
		var args = [];
		var mn = 2;
		if (arguments.length >=mn) {
			args = Array.prototype.slice.call(arguments);
			args = args.slice(mn);	
		}
		nordburg.getRemoteFile(syncformURL + params, function (doc) {
			//console.log ("Got doc: " + doc + ".");
			//console.log ("from url: " + syncformURL)
			var data = doc;
			data = JSON.parse(data);
			//var data = JSON.parse(JSON.stringify(doc));
			var task = data["task"];
			if (task == "getForm") {
				var mainContent = null;
				// in nordbar/sync.html
				mainContent = nordburg.syncWindow.document.getElementById("syncMainContent");
				mainContent.innerHTML = data.html;
				
				var submitBtn = null;
				submitBtn = nordburg.syncWindow.document.getElementById("submitBtn");
				if (submitBtn) {
					//submitBtn.setAttribute("type", "button");
				}
				var theForm = null;
				theForm = nordburg.syncWindow.document.getElementById("theform");
				if (theForm) theForm.setAttribute("action", syncformURL);
				
				/* so far the following have been tried and failed:
				 * nordburg.syncWindow.addEventListener/appcontent ("load" and "pageshow")
				 */
				nordburg.syncWindow.addEventListener("pageshow", function () {
					//console.log ("Something else loaded.");
					/*  You may need the following: (taken from WWVF)
					WWVF.appcontent = document.getElementById("appcontent");
					WWVF.appcontent.addEventListener("pageshow", WWVF.loadHandler, true);

					if (window.content.document.readyState == "complete")
					*/
				}, false);
				if (callback) callback(args);
			} else if (task == "success") {
				//console.log ("Success.  now closing");
				//nordburg.syncWindow.close();
			} else {
				//mainContent.innerHTML += "<p>Not sure what happened here.  Task: " + task + ", html: " + data.html + "\n";
				nordburg.createHTMLElement("p", nordburg.syncWindow.document, {"parentNode":mainContent, "textNode" : "Not sure what happened here.  Task: " + task + ", html: " + data.html + "."});
			}
			/*
			 * 
			 * This section is if only the mainContent is returned.
			 * Now I'm doing things the JSON way.
			 *
			var mc = doc.getElementById("theFormDiv");
			// Set the form action properly
			var theForm = null;
			var submitBtn = null;
			theForm = doc.getElementById("theform");
			submitBtn = doc.getElementByID("submitBtn");
			if (theForm) theForm.setAttribute("action", syncformURL);
			/*
			if (submitBtn) {
				submitBtn.addEventListener("click", function (
				) {
					nordburg.syncWindow.close();
				}, false);
			}
			* /
			mainContent.appendChild(mc);
			if (callback) callback(args);
			*/
		});
	}, // End of showSyncForm
	uploadSyncFile : function (cloud_files_ID, xmlContents) {
		//var permDbug = nordburg.dbug;
		var dbug = nordburg.dbug;
		var callback = null;
		if (arguments.length >=3) {
			callback = arguments[2];
		}

		var http = new XMLHttpRequest();
		http.open("POST", nordburg.cloudSyncURL, true);
		http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		var params = "cloud_files_ID=" + cloud_files_ID + "&viewBtn=View&hijax=true&task=sync&xmlFile=" + xmlContents;
		http.send(params);
		if (dbug) console.log ("Just posted to " + nordburg.cloudSyncURL + ".");
		if (dbug) console.log ("With params: " + params + ".");
		http.onload = function() {
			if (dbug) console.log(http.responseText);
			if (callback) callback(http.responseText);
		}
	}, // End of uploadSyncFile
	getLoginForm : function (holder, callback) {
		//var callback2 = null;
		//if (arguments.length > 2 && arguments[2] != null) callback2 = arguments[2];
		// holder is where the form should site.  So holder.appendChild(loginForm)
		// But, since getting the site has to be asynchronous, it's not that simple.  displayLoginForm will be 
		// used to actually attach the form.
		//nordburg.loginURL = "https://www.nordburg.ca/users/login.php?hijax=true"; //nordburg.getCharPref("extensions.nordburg.", "loginURL");
		nordburg.getRemotePage(nordburg.loginURL + "?hijax=true", nordburg.displayLoginForm, true, holder, callback);
	}, // End of getLoginForm
	displayLoginForm : function (doc, args) {
		// args should be: holder, callback, maybe callback2.  I still don't know what callback2 is for.

		var dbug = nordburg.dbug; //(arguments.length == 3 && arguments[2] != null && arguments[2] != false ? true : false);
		var holder = args[0];  // the holder.
		var topDoc = holder.ownerDocument; // = topDoc.getElementById("syncMainContent");
		console.log ("topDoc: " + topDoc + ".");
		var callback = args[1];
		var loginForm = null;
		loginForm = doc.getElementById("nordburgLoginform");  // This line could be a problem
		console.log ("loginForm: " + loginForm + ".");
		if (dbug) console.log ("got loginForm: " + loginForm + ".");
		if (dbug) console.log ("got topDoc: " + topDoc + ".");
		if (dbug) console.log ("got doc: " + doc + ".");
		if (dbug) console.log ("got holder: " + holder + ".");
		if (loginForm) {
			holder.appendChild(loginForm);
			loginForm.setAttribute("action", nordburg.loginURL + "?hijax=true");
			if (dbug) console.log("Setting action to " + loginForm.getAttribute("action") + " .");
		} else {
			if (dbug) console.log("Couldn't find loginForm.");
		}

		var loginSubmitBtn = null;
		loginSubmitBtn = topDoc.getElementById("loginSubmitBtn");  // This line could be trouble too
		if (loginSubmitBtn) {
			loginSubmitBtn.addEventListener("click", function(e) {
				e.preventDefault();
				var nordburgUsername = null;
				nordburgUsername = topDoc.getElementById("nordburgUsername");
				var nordburgPassword = null;
				nordburgPassword = topDoc.getElementById("nordburgPassword");
				if (nordburgUsername && nordburgPassword) {
					if (dbug) console.log("Sending " + nordburgUsername.value + " and " + nordburgPassword.value + ".");
					// Ummmmm can we send this as a POST thing instead of GET?
					var url = nordburg.loginURL + "?hijax=true&task=login&nordburgUsername=" + nordburgUsername.value + "&nordburgPassword=" + nordburgPassword.value;

					var http = new XMLHttpRequest();
					http.open("POST", nordburg.loginURL, true);
					http.setRequestHeader("Content-type","application/x-www-form-urlencoded");
					var params = "hijax=true&task=login&nordburgUsername=" + nordburgUsername.value + "&nordburgPassword=" + nordburgPassword.value;
					params = params.replace(/%20/g, '+');
					http.send(params);
					if (dbug) console.log ("Just posted to " + nordburg.loginURL + ".");
					if (dbug) console.log ("With params: " + params + ".");
					http.onload = function() {
						var resDoc = http.responseText;
						if (dbug) console.log(resDoc);
						//if (callback) callback(http.responseText);
						if (resDoc.match(/Unfortunately, there's not much use right now to logging in, but enjoy your stay!/i)) {
							holder.removeChild(loginForm);
							callback(args.slice(2));
						} else {
							var tryAgain = nordburg.createHTMLElement(topDoc, "div", {"parentNode":loginForm, "textNode":"Sorry, try again some other time."});	// This isn't ideal.  I'd rather show the login form again.
						}
					}
				} else {
					if (dbug) console.log("Couldn't find username or password.");
				}
			}, false);
		} else {
			if (dbug) console.log("Couldn't find loginSubmitBtn.");
		}
	}, // End of displayLoginForm
	getHash : function (str) {
		// function borrowed from http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
		var hash = 0, i, chr, len = str.length;
		if (len == 0) return hash;
		for (i = 0; i < len; i++) {
			chr   = str.charCodeAt(i);
			// Below:
			// first, add five 0 to the end of the character.
			// So, if chr = 5, then it can represented as 101.  Then it becomes 10100000 (minus 0) + 101 = 10100101
			hash  = ((hash << 5) - hash) + chr;
			// Below:
			// Convert to 32bit integer, it's a bitwise OR assignement operator, hash = hash | 0;
			// So, if the hash happens to be 5, then has equals 00000000000000000000000000000101.
			hash |= 0;
		}
		return hash;
	}, // End of getHash
	/* Before callig this function, don't forget to remove all event handlers in the row.*/
	removeThisRow : function (node) {
		var returnValue = true;
		if (node instanceof HTMLElement) {
			if (node.nodeNmae == "TR") {
				node.parentNode.removeChild(node);
			} else if (node.parentNode != null) {
				nordburg.removeThisRow(node.parentNode);
			} else {
				return false;
			}
		}
		return returnValue;
	},
	amILoggedIn : function (callback) {
		var dbug = nordburg.dbug; //getBoolPref("extensions.nordbar.", "dbug");
		dbug = (arguments.length >1 && (arguments[1] != null && arguments[1] != false) ? true : false);
		//console.log ("dbug: " + dbug + ".");
		var msg = [];
		msg.push("Checking if I'm logged in...");
		var rv = false;
		var args = [];
		var mn = 1;
		if (arguments.length > mn) {
			args = Array.prototype.slice.call(arguments);
			args = args.slice(mn);
		}
		var url = nordburg.cloudSyncURL + "?hijax=true&task=gcfids&rnd=" + Math.random();
		nordburg.getRemoteFile(url, function (doc) {
			//doc = JSON.parse(doc);
			msg.push("Calling " + url);
			msg.push("Got " + doc + ".");
			msg.push("Which is of type: " + typeof(doc) + ".");
			//{"1":{"name":"FB Tracker"
			if (doc.match(/{"\d+"\s*:\s*{"name"\s*:".*",\s*"last_updated"\s*:\s*/)) {
				msg.push ("Yup, looks like what you're looking for.  Logged in.");
				rv = JSON.parse(doc);
			} else {
				msg.push ("Nein.  Not logged in.");
			}
			//if (typeof(doc) == "object")
			/*var output = [];
			for (var k in doc) {
				output.push(k);
			}
			msg.push(output.join(", "));
			*/

			msg.push("Returning: " + rv + ".");
			if (dbug) console.log (msg.join("\n"));
			if (callback != null) callback(rv, args);
		}, true);
	}, // End of amILoggedIn
	cloneNode : function (node) {
		/* Oh crap.  This is harder than it looks.  You can only clone nodes when you know that there
		 * are no child nodes of type 1. */
		/*
		 * From Stack Overflow:
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}
		 */
		var depthFirst = true;
		rv = node.cloneNode(depthFirst);
		return rv;
	},
	isSmaller : function (first, second) {
		var dbug = (arguments.length >2 && (arguments[2] != null && arguments[2] != false) ? true : false);
		var returnValue = false;
		var firstVer = first.split(".");
		var secondVer = second.split(".");
		var keepGoing = true;
		for (var i = 0; keepGoing & i < firstVer.length & i < secondVer.length; i++) {
			if (firstVer[i].match(/^-?\d+$/) && secondVer[i].match(/^-?\d+$/)) {
				if (parseInt(firstVer[i]) < parseInt(secondVer[i])) {
					returnValue = true;
					keepGoing = false;
				} else if (parseInt(firstVer[i]) > parseInt(secondVer[i])) {
					keepGoing = false;
				}
			} else {
				if (nordburg.isStringLessThan(firstVer[i], secondVer[i], dbug)) returnValue = true;
			}
		}
		if (keepGoing & firstVer.length < secondVer.length) returnValue = true;
		return returnValue;
	},
	isStringLessThan : function (x, y) {
		var dbug = (arguments.length > 2 && (arguments[2] != null && arguments[2] != false) ? true : false);
		
		var returnValue = true;
		x = x.toString();	// Why the deuce did I do this?
		y = y.toString();	// Oh yeah.  Only dev releases will get here.
		var output = "isStringLessThan::\n" + x + " v " + y + "?";
		if (x.match(/^-?\d+$/)) {
			var parts = y.match(/^(-?\d+?)-(.*)$/);
			if (parts) {
				output += "\nComparing strings " + x + " with " + parts[1] + ".";
				if (x < parts[1]) {
					output += "\nAnd " + x + " is less than " + parts[1] + ".\nReturning true.";
					returnValue = true;
				} else {
					output += "\nAnd " + x + " is greater than " + parts[1] + ".\nReturning false.";
					returnValue = false;
				}
			}
		} else if (y.match(/^-?\d+$/)) {
			var parts = x.match(/^(-?\d+?)-(.*)$/);
			if (parts) {
				output += "\nComparing strings " + y + " with " + parts[1] + ".";
				if (parts[1] <= y) {
					output += "\nAnd " + parts[1] + " is less than or equal to " + y + ".\nReturning true.";
					returnValue = true;
				} else {
					output += "\nAnd " + parts[1] + " is greater than " + y + ".\nReturning false.";
					returnValue = false;
				}
			}
		} else if (x.match(/\d-.+/) && y.match(/\d-.+/)) {
			var xparts = x.match(/^(-?\d+?)-([a-z]+)(\d*)$/);
			var yparts = y.match(/^(-?\d+?)-([a-z]+)(\d*)$/);

			if (xparts && yparts) {
				output += "Comparing strings " + xparts[1] + " with " +  yparts[1] + ".";
				if (xparts[1] < yparts[1]) {
					output += "\nAnd " + xparts[1] + " is less than " + yparts[1] + ".\nReturning true.";
					returnValue = true;
				} else if (xparts[1] > yparts[1]) {
					output += "\nAnd " + xparts[1] + " is greater than " + yparts[1] + ".\nReturning false.";
					returnValue =false;
				} else if (xparts[1] == yparts[1]) {
					output += "\n" + xparts[1] + " == " + yparts[1] + ".";
					if (xparts[2] && yparts[2]) {
						if (xparts[2].replace("development", "zdevelopment") < yparts[2].replace("development", "zdevelopment")) {
							output += "\n" + xparts[2].replace("development", "zdevelopment") + " is less than " + yparts[2].replace("development", "zdevelopment") + ".\nReturning true.";
							returnValue = true;
						} else  if (xparts[2].replace("development", "zdevelopment") > yparts[2].replace("development", "zdevelopment")) {
							output += "\n" + xparts[2].replace("development", "zdevelopment") + " is greater than " + yparts[2].replace("development", "zdevelopment") + ".\nReturning false.";
							returnValue = false;
						} else if (xparts[2] == yparts[2]) {
							if (xparts[3] && yparts[3]) {
								if (xparts[3] < yparts[3]) {
									returnValue = true;
								} else {
									returnValue = false;
								}
							} else {
								returnValue = false;
							}
						}
					} else {
						returnValue = false;
					}
				}
			} else {
				output += "\nCan't compare.";
			}
		}
		if (dbug) console.log (output);
		return returnValue;
	},
	getLocalVer : function (id, callback) {
		//console.log("Getting version for " + id + ".");
		var thisVersion = null;
		Components.utils.import("resource://gre/modules/AddonManager.jsm");
		try {
			// Firefox 4 and later; Mozilla 2 and later
			
			AddonManager.getAddonByID(id, function(addon) {
				thisVersion = addon.version;
				//console.log("Got version " + addon.version + ".");
				callback(thisVersion);
			});
		}
		catch (ex) {
			// Firefox 3.6 and before; Mozilla 1.9.2 and before
			//console.log("Ex: " + ex.message + ".");
			var em = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
			var addon = em.getItemForID("id");
			thisVersion =  addon.version;
			callback(thisVersion);
		}
	},
}
if (nordburg.dbug) console.log ("nordburg.js loaded: " + document.location.href + ".");
