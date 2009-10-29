PreferencesAssistant = Class.create(Delicious.Assistant , {
	initialize: function()
	{
		this._onSettingChange = this.onSettingChange.bindAsEventListener(this);
		
		this._onThemeChange = this.onThemeChange.bindAsEventListener(this);
	},
	
	setup: function()
	{
		this.countSelectorModel = {value: Feeds.Preferences.getCount() };
		this.controller.setupWidget("countSelector", {label: $L('Articles') , choices: [{label: '10' , value: 10} , {label: '25' , value: 25} , {label: '50' , value: 50} , {label: '75' , value: 75} , {label: '100' , value: 100}]} , this.countSelectorModel);
		
		
		
		this.darkThemeModel = {value: Feeds.Preferences.getDarkTheme()};
		this.controller.setupWidget('darkThemeToggle' , { trueValue: true , falseValue: false } , this.darkThemeModel);

	},
	
	activate: function()
	{
		var countSelector = this.controller.get('countSelector');
		countSelector.observe(Mojo.Event.propertyChange, this._onSettingChange);
		
		
		
		var darkThemeToggle = this.controller.get('darkThemeToggle');
		darkThemeToggle.observe(Mojo.Event.propertyChange, this._onThemeChange);
	},
	
	deactivate: function()
	{
		var countSelector = this.controller.get('countSelector');
		countSelector.stopObserving(Mojo.Event.propertyChange, this._onSettingChange);
		
		var darkThemeToggle = this.controller.get('darkThemeToggle');
		darkThemeToggle.stopObserving(Mojo.Event.propertyChange, this._onThemeChange);
	},
	
	cleanup: function()
	{
	
	},
	
	onSettingChange: function()
	{
		Feeds.Preferences.setCount(this.countSelectorModel.value);
	},
	
	onThemeChange: function()
	{
		var val = this.darkThemeModel.value;
		Feeds.Preferences.setDarkTheme(val);
		if (val)
		{
			this.controller.getSceneScroller().up('body').addClassName('palm-dark');
		}
		else
		{
			this.controller.getSceneScroller().up('body').removeClassName('palm-dark');
		}
	},
	
	handleCommand: function()
	{
	
	}

});