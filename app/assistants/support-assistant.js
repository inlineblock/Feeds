SupportAssistant = Class.create({
	setup: function()
	{
		this.controller.setupWidget(Mojo.Menu.appMenu , { omitDefaultItems: true } , { visible: false });
		
		this.controller.get( 'appname' ).innerHTML = Mojo.Controller.appInfo.title;
		this.controller.get( 'appdetails' ).innerHTML = Mojo.Controller.appInfo.version + " by " + Mojo.Controller.appInfo.company;
		
		var supportitems = [];
		var i = 0;
		if(typeof SupportInfo.publisherURL !== "undefined" && SupportInfo.publisherURL)
		{
			supportitems[i++] = {text: Mojo.Controller.appInfo.company + "'s Website", detail:$L(SupportInfo.publisherURL), Class:$L('img_web'),type:'web'};
		}
		if(typeof SupportInfo.supportEmail !== "undefined" && SupportInfo.supportEmail)
		{
			supportitems[i++] = {text: 'Send Email',address: SupportInfo.supportEmail , subject: Mojo.Controller.appInfo.title + " v" + Mojo.Controller.appInfo.version + " Support", Class:$L("img_email"),type:'email'}
		}
		
		this.controller.setupWidget('AppSupport_list', 
					    {
							itemTemplate:'support/listitem', 
							listTemplate:'support/listcontainer',
							emptyTemplate:'support/emptylist',
							swipeToDelete: false						
						},
					    {
							listTitle: $L('Support'),
				            items : supportitems
				         }
		);
		this.handleListTap = this.handleListTap.bindAsEventListener(this);  
		this.controller.get('AppHelp_list').observe(Mojo.Event.listTap , this.handleListTap);
		this.controller.get('AppSupport_list').observe(Mojo.Event.listTap , this.handleListTap);
		this.controller.get('copyright').innerHTML = Mojo.Controller.appInfo.copyright;
	
	},
	
	handleListTap: function(event)
	{
		if (event && event.item && event.item.type)
		{
			switch(event.item.type)
			{
				case 'web':
					return this.controller.serviceRequest("palm://com.palm.applicationManager", {
						method: "open",
						parameters:  {
						  id: 'com.palm.app.browser',
						  params: {
						      target: event.item.detail
						  }
						}
					});
				break;
		  		case 'email':
					return this.controller.serviceRequest('palm://com.palm.applicationManager', {
						method:'open',
						parameters:{ target: 'mailto:' + event.item.address + "?subject="  + event.item.subject }
					});	
		  		break;
				case 'phone':
					return this.controller.serviceRequest('palm://com.palm.applicationManager', {
						method:'open',
						parameters: {
						   target: "tel://" + event.item.detail
						   }
					});	
				break;
				case 'scene':
					return this.controller.stageController.pushScene(event.item.detail);	
				break;
			}
		}
	},
	
	activate: function()
	{
	
	},

	deactivate: function()
	{
	
	},

	cleanup: function()
	{
		Mojo.Event.stopListening(this.controller.get('AppHelp_list') , Mojo.Event.listTap , this.handleListTap)
		Mojo.Event.stopListening(this.controller.get('AppSupport_list') , Mojo.Event.listTap , this.handleListTap)
		
	}
});