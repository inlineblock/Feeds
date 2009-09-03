Feeds.Article = Class.create({
	initialize:function(o)
	{
		o = o || {};
		this.title = title || 'Untitled';
		this.link = o.link || '';
		this.comments = o.comments || '';
		this.summary = o.summary || '';
		this.author = o.author || '';
		this.date = o.date || '';
		this.guid = o.guid || '';
		this.media = o.media || { type: '' };
	}
	
	title: '',
	link: '',
	comments: '',
	summary: '',
	author: '',
	date: '',
	guid: '',
	media: { type: '' }
});