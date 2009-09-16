Delicious.Assistant = Class.create({
	showLoader: function()
	{
		this.showNightShade();
		this.cleanNightShade();
		this.addToNightShade('<div class="loader"></div>');
	},
	
	hideLoader: function()
	{
		this.hideNightShade();
	},
	
	showLoading: function()
	{
		this.showNightShade();
		this.cleanNightShade();
		this.addToNightShade('<div class="loading"></div>');
	},
	
	hideLoading: function()
	{
		this.hideNightShade();
	},
	
	showNightShade: function()
	{
		if (!this.nightShade)
		{
			this.nightShade = new Element('div' , {id:'nightShade' , className: 'palm-scrim'});
		}
		this.nightShade.show();
		if (!this.nightShade.parentNode)
		{
			this.controller.sceneElement.appendChild(this.nightShade);
		}
	},
	
	hideNightShade: function()
	{
		if (this.nightShade && this.nightShade.parentNode)
		{
			this.nightShade.remove();
		}
		if (this.overNightShade && this.overNightShade.parentNode)
		{
			this.overNightShade.remove();
		}
	},
	
	addToNightShade: function(elt)
	{
		if (!this.overNightShade)
		{
			this.overNightShade = new Element('div' , {id:'overNightShade'});
		}
		
		this.overNightShade.show();
		if (!this.overNightShade.parentNode)
		{
			this.controller.sceneElement.appendChild(this.overNightShade);
		}
		
		
		this.overNightShade.insert(elt);
		this.centerOverNightShade();
	},
	
	centerOverNightShade: function()
	{
		var height = this.overNightShade.offsetHeight;
		var width = this.overNightShade.offsetWidth;
		
		var hh = this.nightShade.offsetHeight;
		var ww = this.nightShade.offsetWidth;
		
		if (width > ww || height > hh) return;
		
		var middleTop = Math.floor((hh/2)-(height/2));
		var middleLeft = Math.floor((ww/2)-(width/2));
		
		this.overNightShade.setStyle({position:'absolute' , top: middleTop + 'px' , left: middleLeft + 'px'});
	},
	
	cleanNightShade: function()
	{
		if (this.overNightShade)
		{
			this.overNightShade.innerHTML = "";
		}
	},
	
	popScene: function(o)
	{
		var o = o || {};
		this.controller.stageController.popScene(o);
	},
	
	errorDialog: function(msg , cb)
	{
		var cb = cb || function() {};
		this.msgDialog("Error" , msg , cb);
	},
	
	msgDialog: function(titleText , msg , cb)
	{
		var titleText = titleText || "Title";
		var msg = msg || "message alert text";
		var cb = cb || function() {};
		this.controller.showAlertDialog({
			    onChoose: cb ,
			    title: titleText,
			    message: msg,
			    choices:[
			         {label:$L('continue')} 
			    ]
			   });
	},
	
	posNegDialog: function(titleText , msg , pos , neg , cb)
	{
		var titleText = titleText || "Title";
		var msg = msg || "message alert text";
		var pos = pos || "Continue";
		var neg = neg || "cancel";
		var cb = cb || function() {};
		this.controller.showAlertDialog({
			    onChoose: cb ,
			    title: titleText,
			    message: msg,
			    choices:[
			         {label:pos , value:true , type:'affirmative'},
			         {label:neg , value:false , type:'dismiss'}
			    ]
			   });
	},
	
	activateScrollTop: function()
	{
		var main = this.controller.get('main-header');
		if (main)
		{
			this._scrollToTop = this._scrollToTop || this.scrollToTop.bindAsEventListener(this);
			main.observe(Mojo.Event.tap , this._scrollToTop);
		}
	},
	
	deactivateScrollTop: function()
	{
		var main = this.controller.get('main-header');
		if (main)
		{
			main.stopObserving(Mojo.Event.tap , this._scrollToTop);
		}
	},
	
	scrollToTop: function()
	{
		var scroller = this.controller.getSceneScroller();
		var distance;
		//scroller.scrollTop = (0);
		var func = (function(el , distance) { 
			var cur = el.scrollTop;
			cur -= distance;
			if (cur < 5)
			{
				el.scrollTop = 0;
				return;
			}
			else
			{
				el.scrollTop = cur;
				window.setTimeout(arguments.callee.bind({}, el , distance) , 50);
			}
		});
		
		distance = Math.ceil(scroller.scrollTop/10);
		if (distance < 30) distance = 30;
		func(scroller , distance);
	},
	
	
});