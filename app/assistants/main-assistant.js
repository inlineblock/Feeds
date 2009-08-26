MainAssistant = Class.create(Delicious.Assistant , {
	initialize: function()
	{
		this.model = {listTitle: 'Feeds' , items: []};
		this.attributes = { itemTemplate: "main/feedItem" , listTemplate: "main/list" ,
             				swipeToDelete: true , reorderable: true , renderLimit: 500 };
        this.createListeners();
        
	},
	
	createListeners: function()
	{
		this.addNewFeed = this.addNewFeed.bindAsEventListener(this);
	},
	
	setup: function()
	{
		this.addIcon = this.controller.get('addIcon');
		if (!Feeds.Manager)
		{
			Feeds.Manager = new Feeds.FeedManager();
		}
		this.controller.setupWidget('feedsList' , this.attributes , this.model);
		this.showLoader();
		Feeds.Manager.initTable(this.getFeeds.bind(this));
	},
	
	activate: function()
	{
		this.addIcon.observe('click' , this.addNewFeed);
	},
	
	deactivate: function()
	{
	
	},
	
	cleanup: function()
	{
	
	},
	
	refreshList: function()
	{
		this.getFeeds();
	},
	
	modelChanged: function()
	{
		this.controller.modelChanged(this.model);
	},
	
	getFeeds: function()
	{
		Feeds.Manager.getFeeds(this.getFeedsCallBack.bind(this));
	},
	
	getFeedsCallBack: function(response)
	{
		this.removeLoader();
		if (response.success)
		{
			this.model.items = response.feeds;
			this.modelChanged();
		}
	},
	
	addNewFeed: function()
	{
		this.controller.stageController.pushScene('add-feed');
	}
});