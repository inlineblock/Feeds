SupportAssistant = Class.create({
	setup: function()
	{
		/* this function is for setup tasks that have to happen when the scene is first created */
		
		/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
		
		/* setup widgets here */
		
		/* add event handlers to listen to events from widgets */
		
		this.controller.setupWidget(Mojo.Menu.appMenu , { omitDefaultItems: true } , { visible: false });
		
		this.controller.get( 'appname' ).innerHTML = Mojo.Controller.appInfo.title;
		this.controller.get( 'appdetails' ).innerHTML = Mojo.Controller.appInfo.version + " by " + Mojo.Controller.appInfo.company;
		
		var supportitems = [];
		var i = 0;
		if(typeof SupportInfo.publisherURL !== "undefined" && SupportInfo.publisherURL)
		{
			supportitems[i++] = {text: Mojo.Controller.appInfo.company + ' Website', detail:$L(SupportInfo.publisherURL), Class:$L('img_web'),type:'web'};
		}
		if(typeof SupportInfo.supportURL !== "undefined" && SupportInfo.supportURL)
		{
			supportitems[i++] = {text: 'Support Website' , detail:$L(SupportInfo.supportURL) , Class:$L("img_web"),type:'web'}
		}
		if(typeof SupportInfo.supportEmail !== "undefined" && SupportInfo.supportEmail)
		{
			supportitems[i++] = {text: 'Send Email',address: SupportInfo.supportEmail , subject: Mojo.Controller.appInfo.title + " Support", Class:$L("img_email"),type:'email'}
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
		this.controller.get( 'copywrite' ).innerHTML = Mojo.Controller.appInfo.copyright;
	
	},
	
	handleListTap: function(event)
	{
		/* put in event handlers here that should only be in effect when this scene is active. For
		   example, key handlers that are observing the document */
		  if(event.item.type == 'web')
		  {
		  	this.controller.serviceRequest("palm://com.palm.applicationManager", {
			  method: "open",
			  parameters:  {
			      id: 'com.palm.app.browser',
			      params: {
			          target: event.item.detail
			      }
			  }
			});
		  }	  
		  else if(event.item.type == 'email')
		  {
		  	this.controller.serviceRequest('palm://com.palm.applicationManager', {
			    method:'open',
			    parameters:{ target: 'mailto:' + event.item.address + "?subject="  + Mojo.appInfo.title + " " + event.item.subject}
			});	
		  }
		  else if(event.item.type == 'phone')
		  {
		  	this.controller.serviceRequest('palm://com.palm.applicationManager', {
			    method:'open',
			    parameters: {
			       target: "tel://" + event.item.detail
			       }
			    });	
		  }
		  else if(event.item.type == 'scene')
		  {
		  	this.controller.stageController.pushScene(event.item.detail);	
		  }
	},
	activate: function()
	{
	
	},

	deactivate: function()
	{
	
	},

	cleanup: function(event)
	{

		/* this function should do any cleanup needed before the scene is destroyed as 
		   a result of being popped off the scene stack */
		Mojo.Event.stopListening(this.controller.get('AppHelp_list'),Mojo.Event.listTap,this.handleListTap)
		Mojo.Event.stopListening(this.controller.get('AppSupport_list'),Mojo.Event.listTap,this.handleListTap)
		
	}
});