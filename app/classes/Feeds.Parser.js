Feeds.Parser = Class.create({
	initialize: function(xml)
	{
		this.root = xml.documentElement;
	},
	
	getArticles: function() { return []; },
	
	getLastUpdated: function() { return new Date(0); },
	
	getTitle: function() { return ''; },
	
	getDescription: function() { return ''; },
	
	// XML Helper functions
	getXMLChildText: function(node, tag)
	{
		var nodes = n.getElementsByTagName(tag);
		return nodes.length ? nodes[0].firstChild.nodeValue : undefined;
	},
	
	getXMLChildAttribute: function(node, tag, att)
	{
		var nodes = n.getElementsByTagName(tag);
		return nodes.length ? nodes[0].getAttribute(att) : undefined;
	}
});

Feeds.Parser.isValid = function(xml)
{
	var parsers = this.parsers;
	for (var type in parsers)
	{
		if (parsers[type].isValid(xml)) { return true; }
	}
	return false;
};

Feeds.Parser.getFeedType = function(xml)
{
	var parsers = this.parsers;
	for (var type in parsers)
	{
		if (parsers[type].isValid(xml)) { return type; }
	}
	
	return '';
};

Feeds.Parser.parsers = {};
Feeds.Parser.addParser = function(type, parser)
{
	this.parsers[type] = parser;
	return true;
};

Feeds.Parser.parse = function(xml)
{
	var parser = this.parsers[this.getFeedType(xml)];
	return (parser && new parser(xml)) || false;
};