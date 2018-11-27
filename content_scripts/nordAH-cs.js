var nordAHCS = {
	dbug : nordAH.dbug,
	running : false,

	titles : {},
	bodyLangs : {},
	idCounter : {},
	doctype : {},
	encoding : {},
	feeds : {},
	gatherInfo : function () {
		nordAHCS.getTitles();
		nordAHCS.getAllLangs();
		nordAHCS.getDoctype();
		nordAHCS.getAllEncoding();
		nordAHCS.getFeeds();
	},
	getTitles : function () {
		if (nordAHCS.dbug) console.log("Getting titles.");
		nordAHCS.getTitleTag();
		nordAHCS.getMetaTitle();
		nordAHCS.getH1s();
		nordAHCS.getBreadCrumb();
		if (nordAHCS.dbug) console.log("Sending back results.");
	},
	getTitleTag : function () {
		if (document.title && document.title != "") {
			nordAHCS.titles["titleTag"] = document.title;
		} else {
			nordAHCS.titles["titleTag"] = browser.i18n.getMessage("noTitleTag");
		}
	},
	getMetaTitle : function () {
		var metas = document.getElementsByTagName("meta");
		var returnValue = [];
		if (metas == "undefined") {
			returnValue.push(browser.i18n.getMessage("noMetadata"));
		} else {
			for (var i = 0; i < metas.length; i++) {
				if (metas[i].getAttribute("name") == "dcterms.title" || metas[i].getAttribute("name") == "dc.title" || metas[i].getAttribute("name") == "title") {
					returnValue.push(metas[i].getAttribute("name") + ": " + metas[i].getAttribute("content"));
				}

			}
		}
		if (returnValue.length == 0) returnValue.push(browser.i18n.getMessage("noMetadata"));
		nordAHCS.titles["metaTitle"] = returnValue;
	},
	getH1s : function () {
		var returnValue = [];
		var h1s = document.getElementsByTagName("h1");
		if (h1s) {
			if (h1s == "undefined") {
				returnValue.push(browser.i18n.getMessage("noH1s"));
			} else {
				for (var i = 0; i < h1s.length; i++) {
					returnValue.push(nordburg.trim(nordburg.getNodeText(h1s[i])));
				}
			}
		}
		nordAHCS.titles["h1s"] = returnValue;
	},	
	getBreadCrumb : function () {
		var returnValue = "";
		var bcIds = ["gcwu-bc", "cn-bcrumb", "cn-bc-inner", "wb-bc"];
		var bcDiv = null;
		
		for (var i = 0; i < bcIds.length && bcDiv == null; i++) {
			bcDiv = document.getElementById(bcIds[i]);
		}

		if (bcDiv == "undefined" || bcDiv == null) {
			returnValue = "";
		} else {
			var bcList = bcDiv.getElementsByTagName("li");
			if (bcList != null) {
				if (bcList.length > 0) {
					returnValue = nordburg.trim(nordburg.getNodeText(bcList[bcList.length-1]));
				}
			} else {
				returnValue = browser.i18n.getMessage("noBreadcrumbs");
			}
		}
		nordAHCS.titles["Breadcrumbs"]= returnValue;
	},
	getAllLangs :  function () {
		nordAHCS.getHTMLLang();
		nordAHCS.getBodyLangs();
	},
	getHTMLLang : function () {
		var dir = "";
		var htmlTag = document.getElementsByTagName("html");

		if (htmlTag == "undefined") {
			if (nordAHCS.dbug) console.log ("Coudln't get HTML tag.");
		} else {
			htmlTag = htmlTag[0];
			try {
				var lang = (htmlTag.hasAttribute("lang") ? htmlTag.getAttribute("lang") : "");
				var xmlLang = (htmlTag.hasAttribute("xml:lang") ? htmlTag.getAttribute("xml:lang") : "");
				if (htmlTag.hasAttribute("dir")) dir = htmlTag.getAttribute("dir");
				nordAHCS.bodyLangs["html"] = {};
				nordAHCS.bodyLangs["html"]["id"] = "html";
				nordAHCS.bodyLangs["html"]["lang"] = lang;
				nordAHCS.bodyLangs["html"]["xmllang"] = xmlLang;
				nordAHCS.bodyLangs["html"]["dir"] = dir;
				nordAHCS.bodyLangs["html"]["text"] = "";
			}
			catch (ex) {
				console.log ("No html tag.");
			}
		}
	},
	getBodyLangs : function () {
		var theBody = document.getElementsByTagName("body")[0];
		if (theBody == "undefined") {
			if (nordAHCS.dbug) console.log ("Couldn't get body.");
		} else {
			nordAHCS.getLangs(theBody);
		}
	},
	getLangs : function (n) {
		//if (nordAHCS.dbug) console.log ("n: " + n + ".");
		if (typeof(n) == "undefined") {
			if (nordAHCS.dbug) console.log ("Couldn't get an element because it's undefined, wha?!?!");
		} else {
			var id = n.nodeName;
			var dir = "";
			var lang = "";
			var xmllang = "";
			var nodeText = "";
			if (n.hasAttribute("dir")) {
				dir = n.getAttribute("dir");
			}
			if (n.hasAttribute("lang")) {
				lang = n.getAttribute("lang");
			}
			if (n.hasAttribute("xml:lang")) {
				xmllang = n.getAttribute("xml:lang");
			}

			if (dir != "" || lang != "" || xmllang != "") {
				if (n.hasAttribute("id")) {
					id += "#" + n.getAttribute("id");
				} else {
					if (n.hasAttribute("name")) {
						id +=":name: " + n.getAttribute("name");
					} else {
						var nodeList = "";
						nodeList = nordburg.getParentWithID(n);
						id = nodeList;
					}
				}

				if (nordAHCS.bodyLangs[id] != undefined) {
					nordAHCS.idCounter[id] += 1;
					id += " (" + nordAHCS.idCounter[id] + ")";
				}
				nodeText = nordburg.getNodeText(n);
				nodeText = nordburg.trim(nodeText, 150);
				nordAHCS.bodyLangs[id] = {};
				nordAHCS.idCounter[id] = 1;
				nordAHCS.bodyLangs[id]["id"] = id;
				nordAHCS.bodyLangs[id]["dir"] = dir;
				nordAHCS.bodyLangs[id]["lang"] = lang;
				nordAHCS.bodyLangs[id]["xmllang"] = xmllang;
				nordAHCS.bodyLangs[id]["text"] = nodeText;
			}
			for (var i=0; i < n.childNodes.length; i++) {
				if (n.childNodes[i].nodeType == 1) {
					nordAHCS.getLangs(n.childNodes[i]);
				}
			}
		}
	}, //  End of getLangs
	getDoctype : function () {
		var page = document.doctype;
		if (nordAHCS.dbug) console.log ("Got doctype: "  + document.doctype + ".");
		var ver = browser.i18n.getMessage("unknown");
		if (page) {
			var msg = [];
			var name = page.name;
			msg.push("URL: " + document.location.href); 
			var publicID = page.publicId;
			msg.push("publicID: " + publicID + ".");
			var systemID = (page.systemId.match(/^\S/) ? page.systemId : page.publicId);
			msg.push("systemID: " + systemID + ".");
			var output = "";

			//msg.push("Internal subset:" + page.internalSubset + ".")
			msg.push("NodeName:" + document.documentElement.nodeName + ".");

			var tech = "doctype";
			var ver = "";
			var level = "";

			output = "DOCTYPE";
			var DTD = publicID.match(/\/\/DTD ([^\/]*)\//i);
			if (DTD != null) {
				output = DTD[1];
				//console.log ("Got output " + output + ".");
				if (output.match(/^html/i)) {
					tech = "html";
				} else if (output.match(/^xhtml/i)) {
					tech = "xhtml";	
				}
	
				if (output.match(/1\.0/)) {
					ver = "1.0";
				} else if (output.match(/(4\.01?)/)) {
					ver = "4.01";
				}

				level = systemID.match(/(loose|strict|trans|frameset)/i);
				if (level) {
					level = level[1];
					level = level.toLowerCase();
				} else {
					msg.push("Didn't get a level from " + systemID + ".");
					level = null;
				}
			} else {
				if (name  == "html") {
					output = "HTML5";
					tech = "html";
					ver = "5";
				}
			}
			
			if (nordAHCS.dbug) console.log (msg.join("\n"));
			if (nordAHCS.dbug) console.log ("About to save: " + tech + ", ver:" + ver + ", level " + level + ", output: " + output + ".");
			nordAHCS.doctype["tech"] = tech;
			nordAHCS.doctype["ver"] = ver;
			if (level) nordAHCS.doctype["level"] = level;
			//nordAHCS.doctype["output"] = output;


		} else {
			if (nordAHCS.dbug) console.log ("Couldn't get doctype definition.");
			//if (nordAHCS.dbug) console.log (nordburg.objToString(document));
			nordAHCS.doctype["tech"] = browser.i18n.getMessage("unknown");
			nordAHCS.doctype["ver"] = browser.i18n.getMessage("unknown");
			//nordAHCS.doctype[""] = browser.i18n.getMessage("unknown");
		}
	}, // End of getDoctype
	getAllEncoding : function () {
		var msg = [];
		var log = [];
		var doc = document;

		var metas = null;
		var charset = browser.i18n.getMessage("unknown"); 
		metas = doc.getElementsByTagName("meta");
		if (metas && metas.length > 0) {
			if (nordAHCS.dbug) console.log ("Got " + metas.length + " metas.");
			for (var i= 0; i < metas.length; i++) {
				if (metas[i].hasAttribute("charset")) {
					msg.push("Meta charset: " + metas[i].getAttribute("charset"));
					nordAHCS.encoding["metaCharset"] = {"title" : "<meta charset>", "value" : metas[i].getAttribute("charset")};
					if (nordAHCS.dbug) console.log ("Got metaCharset as " + nordAHCS.encoding["metaCharset"] + ".");
				}
				if (metas[i].hasAttribute("http-equiv") && metas[i].hasAttribute("content")) {
					if (nordAHCS.dbug) console.log ("Got " + metas[i].getAttribute("http-equiv") + " = " + metas[i].getAttribute("content") + " metas.");
					if (metas[i].getAttribute("http-equiv").match(/^Content-type$/i) && metas[i].getAttribute("content").match(/charset/i)) {
						if (nordAHCS.dbug) console.log ("Got http-equiv");
						
						msg.push("Meta http-equiv: " + metas[i].getAttribute("content") + ".");
						nordAHCS.encoding["MetaHttpEquiv"] = {"title" : "<http-equiv=\"Content-Type\">", "value" : metas[i].getAttribute("content")};
						if (nordAHCS.dbug) console.log ("Got metaHttpEquiv as " + nordAHCS.encoding["metaHttpEquiv"] + ".");
					} else {
						if (nordAHCS.dbug) console.log ("Didn't have Content-type = something charset.");
					}
				}
			}
		}
		msg.push(browser.i18n.getMessage("contentType") + ": " + doc.contentType + ".");
		msg.push(browser.i18n.getMessage("browserSees") + ": " + doc.characterSet + ".");
		if (nordAHCS.dbug) console.log ("Saving encoding as " + msg.join("\n") + ".");
		//nordAHCS.encoding["encodingMsg"] = msg;
		nordAHCS.encoding["charset"] = {"title" : "Charset", "value" : doc.characterSet};
		nordAHCS.encoding["browserSees"] = {"title" : browser.i18n.getMessage("browserSees") , "value" : doc.characterSet};
		nordAHCS.encoding["contentType"] = {"title" : browser.i18n.getMessage("contentType") , "value" : doc.contentType};
	}, // End of getAllEncoding
	getFeeds : function () {
		// Still needs to either return a value, or send a message back to the chrome script.  Worry about this when the other parts are done.
		var feedoutput = [];
		var feedType = "";
		var rv = "nofeed";
		var feed = browser.i18n.getMessage("nofeeds");
		var doc = document;
		if (nordAHCS.dbug) console.log ("The content type: " + doc.contentType + ".");
		//if (nordAHCS.dbug) console.log ("doc: " + nordburg.objToString(doc) + ".");
		if (doc.contentType.match(/xml/i)) {
			if (nordAHCS.dbug) console.log ("The content type matches xml.");
			var rsss = doc.getElementsByTagName("RSS");
			if (rsss.length > 0) {
				if (nordAHCS.dbug) console.log ("Got RSS element.");
				rv = "RSS";
				feedoutput.push("RSS: " + doc.title + " (" + doc.location.href + ")");
			} else {
				if (nordAHCS.dbug) console.log ("Didn't get RSS element.");
				rsss = doc.getElementsByTagName("feed");
				if (rsss.length > 0) {
					if (nordAHCS.dbug) console.log ("Got Atom element.");
					rv = "Atom";
					feedoutput.push("Atom: " + doc.title + " (" + doc.location.href + ")");
				} else {
					if (nordAHCS.dbug) console.log ("Didn't get Atom element.");
					if (nordAHCS.dbug) console.log("Okay, so here's the document:");
					var rootNode = doc.documentElement;
					var src = [];
					src.push("<" + rootNode.nodeName + ">");
					for (var i = 0; i < rootNode.childNodes.length; i++) {
						src.push("\t<" + rootNode.childNodes[i] + ">");
						src.push("\t</" + rootNode.childNodes[i] + ">");
					}
					src.push("</" + rootNode.nodeName + ">");
					if (nordAHCS.dbug) console.log(src.join("\n"));

					feedType =  "waiting";
					rv = "waiting";
					
					nordburg.getRemotePage(doc.location.href, function (actualDoc) {
						var oldVal = nordAH.dbug;
						//nordAH.dbug = true;
						var actualRoot = actualDoc.documentElement;
						if (nordAHCS.dbug) console.log("Actual rootnode name for " + doc.location.href + ": " + actualRoot.nodeName + ".");
						var rsss = actualRoot.getElementsByTagName("RSS");
						if (rsss.length > 0) {
							if (nordAHCS.dbug) console.log ("Got RSS element.");
							rv = "RSS";
							feedoutput = ["RSS: " + actualRoot.title + " (" + doc.location.href + ")"];
						} else {
							if (nordAHCS.dbug) console.log ("Didn't get RSS element.");
							rsss = actualRoot.getElementsByTagName("feed");
							if (rsss.length > 0) {
								if (nordAHCS.dbug) console.log ("Got Atom element.");
								rv = "Atom";
								feedoutput = ["Atom: " + actualRoot.title + " (" + doc.location.href + ")"];
							} else {
								if (nordAHCS.dbug) console.log ("Beats me what this is.");
								rv = "nofeed";
								feedoutput = [browser.i18n.getMessage("nofeeds")];
							}
						}
						nordAHCS.feeds["feedType"] = rv;
						/*
						if (feedoutput.indexOf(browser.i18n.getMessage("nofeeds")) > -1 && feedoutput.length > 1) {
							console.log ("Already has nofeeds.");
							feedoutput = feedoutput.splice(feedoutput.indexOf(browser.i18n.getMessage("nofeeds")), 1);
						}
						*/
						nordAHCS.feeds["feedslist"] = feedoutput;
						
						if (nordAHCS.dbug) console.log ("setFeedType::Mof::Setting feedType to " + nordAHCS.feeds["feedType"] + "."); //, and setting fFile to " + fFile + ".");
						// Send a message to popup to update the feed info
						//nordAH.updateIconsAndLabels();
						nordAHCS.dbug = oldVal;
					});
					//return;  ?
				}
			}
		} else {
			rv = "nofeed";
			if (nordAHCS.dbug) console.log ("Somehow " + doc.contentType + " didn't match /xml/i");
			if (nordAHCS.dbug) console.log ("Trying to get links.");
			var links = doc.getElementsByTagName("link");
			if (links) {
				if (nordAHCS.dbug) console.log ("Got links.");
				if (links != undefined) {
					if (nordAHCS.dbug) console.log ("Got links and they're not undefined.");
					if (links.length > 0) {
					       if (nordAHCS.dbug) console.log ("Above: Links is of length " + links.length);
						for (var i = 0; i < links.length; i++) {
							if (links[i].hasAttribute("type")) {
								var type = links[i].getAttribute("type");
								if (type.match(/application\/atom\+xml/i)) {
									//var output = "";
									if (rv == "nofeed" || rv == "Atom") {
										rv = "Atom";
									} else {
										rv = "Both";
									}
									feedoutput.push("Atom: " + links[i].getAttribute("title") + " (" + links[i].getAttribute("href") + ")");
								} else if (type.match(/application\/rss\+xml/)) {
									if (rv == "nofeed" || rv == "RSS") {
										rv = "RSS";
									} else {
										rv = "Both";
									}
									feedoutput.push("RSS: " + links[i].getAttribute("title") + " (" + links[i].getAttribute("href") + ")");
								}
							}
						}
				       } else {
					       if (nordAHCS.dbug) console.log ("Links is of length " + links.length);
				       }
				} else {
					if (nordAHCS.dbug) console.log("Links is undefined.");
				}
			} else {
				if (nordAHCS.dbug) console.log ("Didn't get any links: " + links + ".");	
			}
		}
		if (feedoutput.length == 0) feedoutput.push(browser.i18n.getMessage("nofeeds"));
		if (rv == "Both") rv = browser.i18n.getMessage("both");
		nordAHCS.feeds["feedType"] = rv;
		nordAHCS.feeds["feedslist"] = feedoutput;
		if (nordAHCS.dbug) console.log ("setFeedType::Eof::Setting feedType to " + nordAH.feedType + ", feedoutput to " + feedoutput + "."); //, and setting fFile to " + fFile + ".");
		
	}, // End of getFeeds
	easterEgg : function () {
		if (nordAHCS.dbug) console.log ("I would do the Easter Egg now.");
	},
	notify : function (message, sender, sendResponse) {
		if (nordAHCS.dbug) console.log ("Got message: " + message["msg"]);
		if (message["task"] == "easterEgg") {
			nordAHCS.easterEgg();
		} else if (message["task"] == "getTitles") {
			sendResponse({"msg":"Returning titles.", "task":"returnTitles", "titles":nordAHCS.titles});
		} else if (message["task"] == "getInfo") {
			sendResponse({"msg":"Returning all info.", "task":"returnInfo", "titles":nordAHCS.titles, "langs" : nordAHCS.bodyLangs, "doctype" : nordAHCS.doctype, "encoding" : nordAHCS.encoding, "feeds":nordAHCS.feeds});
		}
	}, // End of notify
}

browser.runtime.onMessage.addListener(nordAHCS.notify);
nordAHCS.gatherInfo();
if (nordAHCS.dbug) console.log ("nordAH::nordAH-cs.js loaded.");
