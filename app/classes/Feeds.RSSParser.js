Feeds.RSSParser = Class.create(Feeds.Parser, {
	initialize: function(xml) { $super(xml); },
	
	getTitle: function() { return this.getXMLChildText(this.root, 'title'); },
	
	getDescription: function() { return this.getXMLChildText(this.root, 'description'); },
	
	getLastUpdated: function()
	{
		var stamp = this.getXMLChildText(this.root, 'lastBuildDate') || 0;
		return new Date(stamp); 
	},
	
	getArticles: function()
	{
		if (this.articles) { return this.articles; }
		
		// shortcuts
		var articles = (this.articles = []),
			getText = this.getXMLChildText,
			Article = Feeds.Article;
		
		var items = this.root.getElementsByTagName('item'), l = items.length;
		for (var i = 0; i < l; ++i)
		{
			var item = items[i], media = false, enc = item.getElementsByTagName('enclosure');
			if (enc.length)
			{
				enc = enc[0];
				media = {
					type:   enc.getAttribute('type'),
					length: enc.getAttribute('length'),
					url:    enc.getAttribute('url')
				};
			}
			articles.push(new Article({
				title:    getText(item, 'title'),
				link:     getText(item, 'link'),
				comments: getText(item, 'comments'),
				summary:  getText(item, 'description'),
				author:   getText(item, 'author'),
				date:     new Date(getText(item, 'pubDate') || 0),
				guid:     getText(item, 'guid'),
				media:    media
			}));
		}
		
		return articles;
	}
});
	
Feeds.RSSParser.isValid = function(xml)
{
	var root = xml.documentElement;
	return root.nodeName === 'rss' && root.getAttribute('version') === '2.0';
};

Feeds.Parser.addParser('application/rss+xml', Feeds.RSSParser);