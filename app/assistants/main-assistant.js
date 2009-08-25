MainAssistant = Class.create({
	initialize: function()
	{
		this.model = {listTitle: 'Feeds:' , items: []};
	},
	
	setup: function()
	{
		var feed = new Feeds.Feed('Engadget');
		feed.setFeedURL('http://www.engadget.com/Feeds.xml');
		feed.setIcon('http://www.blogsmithmedia.com/www.engadget.com/media/favicon-v2.ico');
		
		this.attributes = { itemTemplate: "main/feedItem" , listTemplate: "main/list" ,
             				swipeToDelete: false , reorderable: false , renderLimit: 500 };
		this.model.items.push(feed);
		this.controller.setupWidget('feedsList' , this.attributes , this.model);
	},
	
	activate: function()
	{
	
	},
	
	deactivate: function()
	{
	
	},
	
	cleanup: function()
	{
	
	}
});