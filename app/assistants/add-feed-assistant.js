AddFeedAssistant = Class.create(Delicious.Assistant , {
	initialize: function()
	{
		this.createListener();
	},
	
	createListener: function()
	{
		this._addButtonClick = this.addButtonClick.bindAsEventListener(this);
		this._popScene = this.popScene.bindAsEventListener(this);
	},
	
	setup: function()
	{
		this.titleModel = {value: '' , disabled: false};
		this.controller.setupWidget("titleField", { hintText: $L('Title'), multiline: false, enterSubmits: false, focus: true} , this.titleModel);
		
		this.urlModel = {value: '' , disabled: false};
		this.controller.setupWidget("urlField", { hintText: $L('http://') , multiline: false, enterSubmits: false}, this.urlModel);
		
		this.controller.setupWidget('addButton' , {label: $L("Add Feed (DISABLED)") , disabled:true } , { buttonClass: "primary" , buttonLabel: $L("Add Feed (DISABLED)") , disabled:true });
		this.controller.setupWidget('cancelButton' , {label: $L("cancel")} , { buttonClass: "secondary" , buttonLabel: $L("cancel")});
	},
	
	activate: function()
	{
		var addButton = this.controller.get('addButton');
		addButton.observe(Mojo.Event.tap , this._addButtonClick);
		
		var cancelButton = this.controller.get('cancelButton');
		cancelButton.observe(Mojo.Event.tap , this._popScene);
	},
	
	deactivate: function()
	{
		var addButton = this.controller.get('addButton');
		addButton.stopObserving(Mojo.Event.tap , this._addButtonClick);
		
		var cancelButton = this.controller.get('cancelButton');
		cancelButton.stopObserving(Mojo.Event.tap , this._popScene);
	},
	
	cleanup: function()
	{
	
	},
	
	addButtonClick: function(e)
	{
		if (this.titleModel.value == "")
		{
			return this.errorDialog($L("You must enter in the feed's title."));
		}
		
		if (this.urlModel.value == "")
		{
			return this.errorDialog($L("You must enter in the feed's url."));
		}
		
		
		var newFeed = new Feeds.Feed();
		newFeed.setTitle(this.titleModel.value);
		if (!newFeed.setFeedURL(this.urlModel.value))
		{
			return this.errorDialog($L("Invalid Feed URL."));
		}
		
		
		this.showLoading();
		newFeed.validateFeed(this.validateFeed.bind(this));
	},
	
	validateFeed: function(valid , feed)
	{
		if (!valid)
		{
			this.errorDialog($L("Invalid. Feed URL returns invalid data."));
			return this.hideLoading();
		}
		else
		{
			Feeds.Manager.addNewFeed(feed , this.addNewFeedCallBack.bind(this));
		}
	},
	
	addNewFeedCallBack: function()
	{
		this.popScene({refresh: true});
	}
	
	
});