ViewArticleAssistant = Class.create(Delicious.Assistant , {
	article: false,
	
	initialize: function(o)
	{
		var o = o || {};
		this.article = o.article;
	},
	
	setup: function()
	{
		var title = this.controller.get('articleTitle');
		title.innerHTML = this.article.title;
		
		var article = this.controller.get('article');
		article.innerHTML = Mojo.View.render({object: this.article , template: 'view-article/article'});
	},
	
	activate: function()
	{
		this.activateScrollTop();
		this.article.markAsRead();
		//this.fixTopMarginForArticle();
	},
	
	deactivate: function()
	{
		this.deactivateScrollTop();
	},
	
	fixTopMarginForArticle: function()
	{
		var fixMe = this.controller.get('fixMe');
		var main = this.controller.get('main-header');
		var h = main.getHeight() + 10;
		fixMe.setStyle({marginTop: h+'px'});
	}

});