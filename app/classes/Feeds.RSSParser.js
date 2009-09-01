Feeds.RSSParser = Class.create(Feeds.Parser, {
	initialize: function(xml) { $super(xml); },
	
	getTitle: function() { return this.getXMLChildText(this.root, 'title'); },
	
	getDescription: function() { return this.getXMLChildText(this.root, 'description'); },
	
	getLastUpdated: function()
	{
		var stamp = this.getXMLChildText(this.root, 'lastBuildDate') || 0;
		return new Date(stamp); 
	},
	
	getArticles: function() { return []; }
});
	
Feeds.RSSParser.isValid = function(xml)
{
	var root = xml.documentElement;
	return root.nodeName === 'rss' && root.getAttribute('version') === '2.0';
};

Feeds.Parser.addParser('application/rss+xml', Feeds.RSSParser);