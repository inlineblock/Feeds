PreferencesAssistant = Class.create(Delicious.Assistant , {
	initialize: function()
	{
		this._onSettingChange = this.onSettingChange.bindAsEventListener(this);
		this._onThemeChange = this.onThemeChange.bindAsEventListener(this);
		
		this._landscapeChange = this.landscapeChange.bindAsEventListener(this);
	},
	
	setup: function()
	{
		this.countSelectorModel = {value: Feeds.Preferences.getCount() };
		this.controller.setupWidget("countSelector", {label: $L('Articles') , choices: [{label: '10' , value: 10} , {label: '25' , value: 25} , {label: '50' , value: 50} , {label: '75' , value: 75} , {label: '100' , value: 100}]} , this.countSelectorModel);
		
		
		
		this.darkThemeModel = {value: Feeds.Preferences.getDarkTheme()};
		this.controller.setupWidget('darkThemeToggle' , { trueValue: true , falseValue: false } , this.darkThemeModel);
		
		var landscape = Feeds.Preferences.getLandscapeSettings();
		this.landscapeModeModel = {value: landscape.enabled};
		this.controller.setupWidget('landscapeModeToggle' , { trueValue: true , falseValue: false } , this.landscapeModeModel);
		this.scrollGesturesModel = {value: landscape.gestures};
		this.controller.setupWidget('scrollGesturesToggle' , { trueValue: true , falseValue: false } , this.scrollGesturesModel);

	},
	
	activate: function()
	{
		var countSelector = this.controller.get('countSelector');
		countSelector.observe(Mojo.Event.propertyChange, this._onSettingChange);
		
		var darkThemeToggle = this.controller.get('darkThemeToggle');
		darkThemeToggle.observe(Mojo.Event.propertyChange, this._onThemeChange);
		
		var landscapeModeToggle = this.controller.get('landscapeModeToggle');
		landscapeModeToggle.observe(Mojo.Event.propertyChange, this._landscapeChange);
		var scrollGesturesToggle = this.controller.get('scrollGesturesToggle');
		scrollGesturesToggle.observe(Mojo.Event.propertyChange, this._landscapeChange);
	},
	
	deactivate: function()
	{
		var countSelector = this.controller.get('countSelector');
		countSelector.stopObserving(Mojo.Event.propertyChange, this._onSettingChange);
		
		var darkThemeToggle = this.controller.get('darkThemeToggle');
		darkThemeToggle.stopObserving(Mojo.Event.propertyChange, this._onThemeChange);
		
		var landscapeModeToggle = this.controller.get('landscapeModeToggle');
		landscapeModeToggle.stopObserving(Mojo.Event.propertyChange, this._landscapeChange);
		var scrollGesturesToggle = this.controller.get('scrollGesturesToggle');
		scrollGesturesToggle.stopObserving(Mojo.Event.propertyChange, this._landscapeChange);
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
	
	landscapeChange: function()
	{
		var settings = {enabled: this.landscapeModeModel.value , gestures: this.scrollGesturesModel.value};
		Feeds.Preferences.setLandscapeSettings(settings);
	},
	
	handleCommand: function()
	{
	
	}

});