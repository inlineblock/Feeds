Feeds.Feed = Class.create({
	initialize: function(title)
	{
		this.title = title;
	},
	
	setIcon: function(icon)
	{
		this.icon = icon;
	},
	
	setFeedURL: function(url)
	{
		this.feedURL = url;
	}
});