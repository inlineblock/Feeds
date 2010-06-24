Delicious.StageManager = Class.create({
	controller: false,
	
	initialize: function(controller)
	{
		this.controller = controller;
	},
	
	stageExists: function(uniqueid)
	{
		return (this.controller.getStageController(uniqueid) ? true : false);
	},
	
	newCard: function(uniqueid , stage , o)
	{
		if (!uniqueid) return false;
		if (!stage) var stage = uniqueid;
		
		o = o || {};
		var stageProxy = this.controller.getStageProxy(uniqueid);
		var stageController = this.controller.getStageController(uniqueid);
		if (stageProxy && stageController)
		{
			stageController.window.focus();
		}
		else
		{
			
			var stageArguments = {'name': uniqueid , lightweight: true};
			var pushScene = function(stageController)
			{
				stageController.pushScene(stage , o);
			};
			
			this.controller.createStageWithCallback(stageArguments , pushScene , Mojo.Controller.StageType.card);
		}
	},
	
	newPopup: function(uniqueid , stage , o)
	{
		if (!uniqueid) return false;
		if (!stage) var stage = uniqueid;
		
		o = o || {};
		var stageProxy = this.controller.getStageProxy(uniqueid);
		var stageController = this.controller.getStageController(uniqueid);
		if (stageProxy && stageController)
		{
			stageController.window.focus();
		}
		else
		{
			
			var stageArguments = {'name': uniqueid , lightweight: true};
			var pushScene = function(stageController)
			{
				stageController.pushScene(stage , o);
			};
			
			this.controller.createStageWithCallback(stageArguments , pushScene , Mojo.Controller.StageType.popupAlert);
		}
	},
	
	newDashboard: function(uniqueid , stage , o)
	{
		if (!uniqueid) return;
		if (!stage) var stage = uniqueid;
		o = o || {};
		var stageProxy = this.controller.getStageProxy(uniqueid);
		var stageController = this.controller.getStageController(uniqueid);
		if (stageProxy && stageController)
		{
			stageController.window.focus();
		}
		else
		{
			var stageArguments = {'name': uniqueid , lightweight: true};
			var pushScene = function(stageController)
			{
				stageController.pushScene(stage , o);
			};
			
			this.controller.createStageWithCallback(stageArguments , pushScene , Mojo.Controller.StageType.dashboard);
		}
	},
	
	close: function(uniqueid)
	{
		if (!uniqueid) return;
		//this.controller.closeStage(uniqueid);
		var stage = this.controller.getStageController(uniqueid);
		if (stage && stage.window && stage.window.close)
		{
			stage.window.close();
		}
	}
	
});