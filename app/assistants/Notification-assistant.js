NotificationAssistant = Class.create({
	manager: false,
	
	initialize: function(o)
	{
		o = o || {};
		this.manager = o.manager || false;
		this.count = o.count || false;
		this.createListeners();
	},
	
	createListeners: function()
	{
		this._onTap = this.onTap.bindAsEventListener(this);
	},
	
	setup: function()
	{
		this.controller.sceneElement.observe(Mojo.Event.tap, this._onTap);
		var dashboard = this.controller.get('dashboard');
		dashboard.insert(Mojo.View.render({object: {'count': this.count}, template: 'Notification/template'}));
	},
	
	cleanup: function()
	{
		this.controller.sceneElement.stopObserving(Mojo.Event.tap, this._onTap);
	},
	
	onTap: function()
	{
		Feeds.StageManager.newCard('main' , 'main' , {manager: this.manager , fullRefresh: true});
		Feeds.Notifications.close();
	}

});