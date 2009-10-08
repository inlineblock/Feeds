PreferencesAssistant = Class.create(Delicious.Assistant , {
	initialize: function()
	{
		this._onSettingChange = this.onSettingChange.bindAsEventListener(this);
	},
	
	setup: function()
	{
		this.countSelectorModel = {value: Feeds.Preferences.getCount() };
		this.controller.setupWidget("countSelector", {label: $L('Articles') , choices: [{label: '10' , value: 10} , {label: '25' , value: 25} , {label: '50' , value: 50} , {label: '75' , value: 75} , {label: '100' , value: 100}]} , this.countSelectorModel);

	},
	
	activate: function()
	{
		var countSelector = this.controller.get('countSelector');
		countSelector.observe(Mojo.Event.propertyChange, this._onSettingChange);
	},
	
	deactivate: function()
	{
		var countSelector = this.controller.get('countSelector');
		countSelector.stopObserving(Mojo.Event.propertyChange, this._onSettingChange);
	},
	
	cleanup: function()
	{
	
	},
	
	onSettingChange: function()
	{
		Feeds.Preferences.setCount(this.countSelectorModel.value);
	},
	
	handleCommand: function()
	{
	
	}

});