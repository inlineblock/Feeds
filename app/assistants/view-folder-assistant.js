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
		
		this.controller.setupWidget(Mojo.Menu.appMenu , {} , {items:[{label: $L('Mark All As Read') , command: "markAllAsRead"}]});
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
		if (event.type == Mojo.Event.command) 
		{
			switch (event.command) 
			{
				case "markAllAsRead":
					return window.setTimeout(this.markAllAsRead.bind(this) , 50); // this prevents the stutter of the appmenu when going up.
				break;
			}
		}
		this.doHandleCommand(event);
	},
	
	markAllAsRead: function()
	{
	
		try
		{
		this.folder.markAllAsRead(this.markAllAsReadCallBack.bind(this));
		if (this._isRefreshing){ return; }
		
		this.showLoader();
		this._isRefreshing = true;
		}
		catch(e)
		{
			Mojo.Log.error("ERRORS" , Object.toJSON(e));
		}
	},
	
	markAllAsReadCallBack: function(finished)
	{
		this._isRefreshing = false;
		this.hideLoader();
		if (finished)
		{
			this.modelChanged();
		}
		else
		{
			this.errorDialog('Unable to mark all as read.');
		}
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