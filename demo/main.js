;(function(){

define(function (){
	'use strict'

	// default action is always to return an executable object - function - upon load.
	// We provide the function, the caller calls it with args specific to the route.

	// everything inside this function will be ran again and again every time the 
	// route is called. You can keep some data "global" by assigning it to a var outside
	// of this returned function. Example:
	var moduleLevelCache = {"my global data":'my global value'}
	// you can stick values like compiled templates etc into this "store" 
	// for reuse on next run of this same route.

	return function(){
		'use strict'

		// Everything here will be ran again and again on every request for this route

		var context = this

		document.title = "jSignature - Demo"

		require(
			['jquery', 'pubsub','jsignature']
			, function($, PubSub){
				
				var PS = new PubSub()
				
	            context.app.$element().html('<div id="signatureparent">jSignature inherits colors from here - parent element<div id="signature"></div></div><div id="demotools"></div><div><p>Display Area:</p><div id="displayarea"></div></div>').show()
	            
	            var $sigdiv = $('#signature').jSignature()
	        	, $tools = $('#demotools')
	        	, $extraarea = $('#displayarea')
	        	, export_plugins = $sigdiv.jSignature('listPlugins','export')
	        	, chops = ['<span><b>Extract signature data as: </b></span><select>','<option value="">(select export format)</option>']
	        	, name
	        	, pubsubprefix = 'DEMO'

	        	for(var i in export_plugins){
	        		if (export_plugins.hasOwnProperty(i)){
	        			name = export_plugins[i]
	        			chops.push('<option value="' + name + '">' + name + '</option>')
	        		}
	        	}
	        	chops.push('</select><span><b> or </b></span>')
	        	
	        	$(chops.join('')).bind('change', function(e){
	        		if (e.target.value !== ''){
	        			var data = $sigdiv.jSignature('getData', e.target.value)
	        			$.publish(pubsubprefix + 'formatchanged')
	        			if (typeof data === 'string'){
	        				$('textarea', $tools).val(data)
	        			} else if($.isArray(data) && data.length === 2){
	        				$('textarea', $tools).val(data.join(','))
	        				$.publish(pubsubprefix + data[0], data);
	        			} else {
	        				try {
	        					$('textarea', $tools).val(JSON.stringify(data))
	        				} catch (ex) {
	        					$('textarea', $tools).val('Not sure how to stringify this, likely binary, format.')
	        				}
	        			}
	        		}
	        	}).appendTo($tools)
	        	
	        	$('<input type="button" value="Reset">').bind('click', function(e){
	        		$sigdiv.jSignature('reset')
	        	}).appendTo($tools)
	        	
	        	$('<div><textarea style="width:100%;height:7em;"></textarea></div>').appendTo($tools)
	        	
	        	PS.subscribe(pubsubprefix + 'formatchanged', function(){
	        		$extraarea.html('')
	        	})

	        	PS.subscribe(pubsubprefix + 'image/svg+xml', function(data) {
	        		var i = new Image()
	        		i.src = 'data:' + data[0] + ';base64,' + btoa( data[1] )
	        		$(i).appendTo($extraarea)
	        		
	        		var message = [
	        			"If you don't see an image immediately above, it means your browser is unable to display in-line (data-url-formatted) SVG."
	        			, "This is NOT an issue with jSignature, as we can export proper SVG document regardless of browser's ability to display it."
	        			, "Try this page in a modern browser to see the SVG on the page, or export data as plain SVG, save to disk as text file and view in any SVG-capabale viewer."
	                   ]
	        		$( "<div>" + message.join("<br/>") + "</div>" ).appendTo( $extraarea )
	        	});

	        	PS.subscribe(pubsubprefix + 'image/svg+xml;base64', function(data) {
	        		var i = new Image()
	        		i.src = 'data:' + data[0] + ',' + data[1]
	        		$(i).appendTo($extraarea)
	        		
	        		var message = [
	        			"If you don't see an image immediately above, it means your browser is unable to display in-line (data-url-formatted) SVG."
	        			, "This is NOT an issue with jSignature, as we can export proper SVG document regardless of browser's ability to display it."
	        			, "Try this page in a modern browser to see the SVG on the page, or export data as plain SVG, save to disk as text file and view in any SVG-capabale viewer."
	                   ]
	        		$( "<div>" + message.join("<br/>") + "</div>" ).appendTo( $extraarea )
	        	});
	        	
	        	PS.subscribe(pubsubprefix + 'image/png;base64', function(data) {
	        		var i = new Image()
	        		i.src = 'data:' + data[0] + ',' + data[1]
	        		$('<span><b>As you can see, one of the problems of "image" extraction (besides not working on some old Androids, elsewhere) is that it extracts A LOT OF DATA and includes all the decoration that is not part of the signature.</b></span>').appendTo($extraarea)
	        		$(i).appendTo($extraarea)
	        	});
	        	
	        	PS.subscribe(pubsubprefix + 'image/jsignature;base30', function(data) {
	        		$('<span><b>This is a vector format not natively render-able by browsers. Format is a compressed "movement coordinates arrays" structure tuned for use server-side. The bonus of this format is its tiny storage footprint and ease of deriving rendering instructions in programmatic, iterative manner.</b></span>').appendTo($extraarea)
	        	});
	        	
			}
		)
	}
})

})()