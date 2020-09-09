"use strict";
Z.content = (function() {
	return {
		items: [],			// The most recently loaded list of content items
		loaders: {			// A list of content loader functions
			data: Z.utilities.loadData,
			image: Z.utilities.loadImage,
			audio: Z.utilities.loadAudio,
			sound: Z.sound ? Z.sound.loadData : Z.utilities.loadData,
			carSprite: Z.carSpriteGenerator ? Z.carSpriteGenerator.loadData : Z.utilities.loadData,
			world: Z.cellGenerator ? Z.cellGenerator.loadData : Z.utilities.loadData,
			map: Z.mapGenerator ? Z.mapGenerator.loadData : Z.utilities.loadData,
			sprite: Z.sprite ? Z.sprite.loadData : Z.utilities.loadData,
			spriteGenerator: Z.spriteGenerator ? Z.spriteGenerator.loadData : Z.utilities.loadData,
			torch: Z.torch ? Z.torch.loadData : Z.utilities.loadData
		},
		
		// Loads a list of content assets and calls allFinishedCallback when done (only argument
		// will be an array of objects indexed by item id). Each item has the following properties:
		//	item.id:		A unique identifier for the content item
		//	item.loader:	The function used to load the object. Should take a callback as the
		//					first argument (which should be called when the item has finished
		//					with the loaded item as the only argument)
		//	item.args:		An array of arguments to pass to the loader
		//	item.args[0]:	The item path
		//	item.args[1]:	(Optional) The item inline data (this will skip AJAX call)
		load: function(items, allFinishedCallback) {
			if (items.length == 0) {	// No items to load
				allFinishedCallback([]);
				return;
			}
			var content = [],
				loadCount = items.length,
				loaded = 0;
			$(items).each(function(i, v) {
				v.args.unshift(function (item) {
					Z.ui.loading(
						true,
						"Loading content... (" + Math.round((++loaded / items.length) * 100) + "%)"
					);
					content[v.id] = item;
					if (--loadCount <= 0) {
						Z.content.items = content;
						allFinishedCallback(content);
					}
				});
				v.loader.apply(undefined, v.args);
			});
		}
	};
}());