Feeds.AtomParser = Class.create(Feeds.Parser, {
	initialize: function(xml) { $super(xml); },
	
	getTitle: function() { return this.getAtomHtml(this.root, 'title'); },
	
	getDescription: function() { return this.getAtomHtml(this.root, 'subtitle'); },
	
	getLastUpdated: function()
	{
		var stamp = this.getXMLChildText(this.root, 'updated') || 0;
		return this.getRFC3339Date(stamp); 
	},
	
	getArticles: function()
	{
		if (this.articles) { return this.articles; }
		
		// shortcuts
		var articles = (this.articles = []),
			getText = this.getXMLChildText,
			getHtml = this.getAtomHtml,
			getLink = this.getAtomLink,
			getPerson = this.getAtomPerson,
			Article = Feeds.Article;
		
		var items = this.root.getElementsByTagName('entry'), l = items.length;
		for (var i = 0; i < l; ++i)
		{
			var item = items[i], media = false, enc = item.querySelector('link[rel="enclosure"]');
			if (enc)
			{
				media = {
					type:   enc.getAttribute('type'),
					length: enc.getAttribute('length'),
					url:    enc.getAttribute('href')
				};
			}
			articles.push(new Article({
				title:    getHtml(item, 'title'),
				link:     getLink(item, 'link[rel="alternate"][type="text/html"]'),
				comments: getLink(item, 'link[rel="replies"][type="text/html"]'),
				summary:  getHtml(item, 'summary'),
				author:   getPerson(item, 'author'),
				date:     getRFC3339Date(getText(item, 'updated')),
				guid:     getText(item, 'id'),
				media:    media
			}));
		}
		
		return articles;
	},
	
	/* modified from: http://blog.toppingdesign.com/2009/08/13/fast-rfc-3339-date-processing-in-javascript/ */
	getRFC3339Date: function(dString)
	{ 
		var utcOffset, offsetSplitChar,
			offsetMultiplier = 1,
			dateTime = dString.split("T"),
			date = dateTime[0].split("-"),
			time = dateTime[1].split(":"),
			offsetField = time[time.length - 1],
			offsetString;
		offsetFieldIdentifier = offsetField.charAt(offsetField.length - 1);
		if (offsetFieldIdentifier == "Z") {
			utcOffset = 0;
			time[time.length - 1] = offsetField.substr(0, offsetField.length - 2);
		} else {
			if (offsetField[offsetField.length - 1].indexOf("+") != -1) {
				offsetSplitChar = "+";
				offsetMultiplier = 1;
			} else {
				offsetSplitChar = "-";
				offsetMultiplier = -1;
			}
			offsetString = offsetField.split(offsetSplitChar);
			time[time.length - 1] == offsetString[0];
			offsetString = offsetString[1].split(":");
			utcOffset = (offsetString[0] * 60) + offsetString[1];
			utcOffset = utcOffset * 60 * 1000;
		}
		
		return new Date(Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1], time[2]) + (utcOffset * offsetMultiplier ));
	},
	
	getAtomHtml: function(entry, tag)
	{
		var nodes = entry.getElementsByTagName(tag);
		if (!nodes.length) { return undefined; }
		var node = nodes[0];
		if (node.getAttribute('type') === 'xhtml')
		{
			node = node.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'div');
			return node.innerHTML;
		}
		else if (node.getAttribute('type') === 'html')
		{
			return node.innerHTML;
		}
		else /* type="text" */
		{
			return node.firstChild.nodeValue;
		}
	},
	
	getAtomLink: function(entry, selector)
	{
		var node = entry.querySelector(selector);
		return node ? node.getAttribute('href') : undefined;
	},
	
	getAtomPerson: function(entry, tag)
	{
		return 'Unnamed';
	}
});
	
Feeds.AtomParser.isValid = function(xml)
{
	var root = xml.documentElement;
	return root.nodeName === 'feed' && root.namespaceURI === 'http://www.w3.org/2005/Atom';
};

Feeds.Parser.addParser('application/atom+xml', Feeds.AtomParser);