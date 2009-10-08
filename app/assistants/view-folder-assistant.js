ViewFolderAssistant = Class.create(Delicious.Assistant , {
	folder: false,
	
	initialize: function(o)
	{
		var o = o || {};
		this.folder = o.folder;
		
		this.model = {listTitle: 'Feeds' , items: []};
		this.attributes = { itemTemplate: "main/feedItem" , listTemplate: "main/list" ,
             				swipeToDelete: true , reorderable: false , renderLimit: 500 };
        this.createListeners();
	},
	
	createListeners: function()
	{
		this.listTapHandler = this.listTapHandler.bindAsEventListener(this);
		this.listDeleteHandler = this.listDeleteHandler.bindAsEventListener(this);
		//this._refreshCounts = this.refreshCounts.bindAsEventListener(this);
	},
	
	setup: function()
	{
		var title = this.controller.get('folderTitle');
		title.innerHTML = this.folder.title;
		
		var appMenu = this.getAppMenu();
		this.controller.setupWidget(Mojo.Menu.appMenu , {} , {visible: true , items: appMenu});
		this.model.items = this.folder.display;
		
		this.controller.setupWidget('feedsList' , this.attributes , this.model);
	},
	
	activate: function(o)
	{
		var o = o || {};
		this.activateScrollTop();
		
		var feedsList = this.controller.get('feedsList');
		if (feedsList)
		{
			feedsList.observe(Mojo.Event.listTap , this.listTapHandler);
			feedsList.observe(Mojo.Event.listDelete , this.listDeleteHandler);
		}
		
		this.modelChanged();
		
	},
	
	deactivate: function()
	{
		this.deactivateScrollTop();
		
		var feedsList = this.controller.get('feedsList');
		if (feedsList)
		{
			feedsList.stopObserving(Mojo.Event.listTap , this.listTapHandler);
			feedsList.stopObserving(Mojo.Event.listDelete , this.listDeleteHandler);
		}
	},
	
	handleCommand: function(event)
	{
		this.doHandleCommand(event);
	},
	
	modelChanged: function()
	{
		this.controller.modelChanged(this.model);
	},
	
	listTapHandler: function(event)
	{
		var item = event.item;
		if (item.isFolder)
		{
			this.controller.stageController.pushScene('view-folder' , {'folder': item});
		}
		else
		{
			this.controller.stageController.pushScene('view-feed' , {'feed': item});
		}
	},
	
	listDeleteHandler: function(event)
	{
		var item = event.item;
		if (item)
		{
			this.showLoading();
			this.folder.manager.deleteFeed(item , this.deleteFeedCallBack.bind(this));
		}
	},
	
	deleteFeedCallBack: function(worked)
	{
		this.hideLoading();
		if (!worked)
		{
			this.errorDialog('Unable to delete feed from Google Reader.');
		}
		this.model.items = this.folder.feeds;
		this.modelChanged();
	}

});