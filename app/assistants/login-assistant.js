LoginAssistant = Class.create(Delicious.Assistant , {
	
	initialize: function()
	{
		this.createListeners();
	},
	
	createListeners: function()
	{
		this._initSignin = this.initSignin.bindAsEventListener(this);
	},
	
	setup: function()
	{
		this.usernameModel = { value: '' , disabled: false };
		this.controller.setupWidget("usernameField", { hintText: $L('email address'), multiline: false, enterSubmits: false, focus: true}, this.usernameModel);
		
		this.passwordModel = { value: '' };
		this.controller.setupWidget("passwordField", { hintText: $L('password') , focusMode: Mojo.Widget.focusSelectMode
}, this.passwordModel);
		
		
		this.controller.setupWidget('loginButton' , {label: $L("Sign In") } , { buttonClass: "primary" , buttonLabel: $L("Sign In") });
	},
	
	activate: function(event)
	{
		 this.controller.listen("loginButton" , Mojo.Event.tap , this._initSignin);
	},
	
	deactivate: function(event)
	{
		this.controller.stopListening("loginButton" , Mojo.Event.tap , this._initSignin);
	},
	
	initSignin: function(event)
	{
		if (this.usernameModel.value == "" || this.passwordModel.value == "")
		{
			return this.errorDialog('You must enter in a valid email address and password.');
		}
		this.showLoader();
		Feeds.GoogleAccount.login(this.usernameModel.value , this.passwordModel.value , this.signingCallBack.bind(this));
	},
	
	signingCallBack: function(worked)
	{
		this.hideLoader();
		if (worked)
		{
			Feeds.GoogleAccount.saveLogin(this.usernameModel.value , this.passwordModel.value);
			this.controller.stageController.popScenesTo('main' , {'fullRefresh':true});
		}
		else
		{
			this.errorDialog('Google Authentication Failed!');
		}
	},
	
	handleCommand: function(event)
	{
		if (event.type == Mojo.Event.commandEnable && (event.command == Mojo.Menu.helpCmd)) 
		{
         	event.stopPropagation(); // enable help. now we have to handle it
		}
		
		if (event.type == Mojo.Event.command) 
		{
			switch (event.command) 
			{
				case Mojo.Menu.helpCmd:
					this.controller.stageController.pushScene('support');
				break;
			}
		}
	},

});