Feeds.AtomParser = Class.create(Feeds.Parser, {
	initialize: function(xml) { $super(xml); },
	
	getTitle: function() { return this.getXMLChildText(this.root, 'title'); },
	
	getDescription: function() { return this.getXMLChildText(this.root, 'subtitle'); },
	
	getLastUpdated: function()
	{
		var stamp = this.getXMLChildText(this.root, 'updated') || 0;
		return new Date(stamp); 
	},
	
	getArticles: function() { return []; }
});
	
Feeds.AtomParser.isValid = function(xml)
{
	var root = xml.documentElement;
	return root.nodeName === 'feed' && root.namespaceURI === 'http://www.w3.org/2005/Atom';
};

Feeds.Parser.addParser('application/atom+xml', Feeds.AtomParser);