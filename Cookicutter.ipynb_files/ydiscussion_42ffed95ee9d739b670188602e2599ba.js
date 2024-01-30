"use strict";

var discussions = (function() {
		
		var minCharsLimit = 1, feedsCont = null, hashParams = null, courseId = null, courseItemId = null,cache = {};
		
		function initCItemMode(cId, itemId) {

			feedsCont = $("#discussionslist");
			courseId = cId;
			if(itemId != null) {
				courseItemId = itemId;
				$("#discussions").css({"margin-top": 50, "min-height": "100vh"}).removeClass("container");
				$("#discussions .s-title").text("Discuss");
				$("#discussions .docs-note").remove();
			}else {
				$("#discussions .s-title, #discussions ul.discussionsOptions").remove();
				
				if(location.hash.length > 1 && /^[a-f\d]{24}$/i.test(location.hash.split("#")[1])) {
					feedsCont.data("url", ctx + "/feeds/" + location.hash.split("#")[1].split("/")[0] + "/get");
				}
				
			}
			
			minCharsLimit = $("#discussions").data("mincharlimit");
				
//			$(".trendCont").hide();
//			$("#discussionslist").closest(".column").removeClass("col-8").addClass("col-12");
//			$(".filter-nav").removeClass("col-8");
			
			allDiscussions.init();
			myDiscussion.init();
			trendingTags.init();
		}
		
		function init() {
			
			courseId = null;
			courseItemId = null;
			
			var cont = null;
			
				cont = $("#discussions");
				
				cont.find(".tab.discussionsOptions a[href^=#]").on("click", function(e) {
					e.preventDefault();
					
					$(this).closest("li").addClass("active").siblings(".active").removeClass("active");
					
					var hash = $(this).attr("href").split("#")[1];
					
					location.hash = hash;
					
					cont.find(".tab-content.discussionsOptions").hide().filter(function() {
						return $(this).data("id") === hash;
					}).show();
					
					return false;
				});
				
				var hash = location.hash.split("#")[1];//containing hash value
				
				var tabHash = "feed";
				
				if(["feed","settings"].indexOf(hash) > -1) {
					tabHash = hash;
				}
				
				cont.find(".tab-content.discussionsOptions").hide().filter(function() {
					return $(this).data("id") === tabHash;
				}).show();
				
				cont.find(".tab.discussionsOptions a[href^=#]").filter(function() {
					return $(this).attr("href") === "#" + tabHash;
				}).closest("li").addClass("active").siblings(".active").removeClass("active");
			
			
			feedsCont = $("#discussionslist");
			minCharsLimit = $("#discussions").data("mincharlimit");
			
			var notifyBlock = $("#newdiscussion").find(".notifyBlock");
			
			if(!(notifyBlock.hasClass("course-admin") || notifyBlock.hasClass("sub-admin"))) {
				notifyBlock.remove();
			}
			
			var switchUI = $("#orgDiscussionsSwitch");
			
			switchUI.on("change", function(e) {
				e.preventDefault();
				
				var packet = {
						url: ctx + "/org/update",
						data: {discussion: $(this).prop("checked")},
						success: function(data, params) {
							switchUI.siblings("small").text(switchUI.prop("checked")?enabledLocaleVar:disabledLocleVar);
						}
				};
				
				postData(packet, {});
			});
			
			if(location.hash.indexOf("start") > -1 || location.hash.indexOf("reply") > -1)	{
				//start|reply course discussion
				hashParams = location.hash.split("#")[1].split("/");
				courseMode = true;
				
				$(".trendCont, .filter").hide();
				$("h3.s-title > span").hide();
				$("#newDiscussionBtn").removeClass("float-right");
				
				$("#discussionslist").closest(".column").removeClass("col-8").addClass("col-12");
				
			}else  if(location.hash.length > 1 && /^[a-f\d]{24}$/i.test(location.hash.split("#")[1].split("/")[0])) {
				$(".trendCont, .filter").hide();
				$("#discussions h3").hide();
				//$("#newDiscussionBtn").removeClass("float-right");
				
				$("#discussionslist").closest(".column").removeClass("col-8").addClass("col-12");
				
				feedsCont.data("url", ctx + "/feeds/" + location.hash.split("#")[1].split("/")[0] + "/get");
				
			}else {
				trendingTags.init();
			}
			
			allDiscussions.init();
			myDiscussion.init();
			blockedLearners.init();
			
			$(".discussionSettingForm").on("submit", function(e) {
				e.preventDefault();
				
				var data = $(this).serializeObject(), packet;
				var blockedWordList = $(this).find(".blockedWordValues").find(".chip").map(function() { return $(this).data("value") }).toArray();
				data["blockedWords"]= JSON.stringify(blockedWordList);
				packet = {
						url: $(this).attr("action"),
						data: data,
						success: function(data, params) {
							showAlert("green", data.message);
						}
				}
				
				postData(packet, {btn: $(this).find("button[type=submit]")});
				
				return false;
			});
			
			$(".discussionSettingForm").on("keypress", ".form-autocomplete-input input", function(e) {
				if(e.which === 13){
					var val = $(this).val();
						
					if($(this).siblings(".chip[data-value='"+val+"']").length == 0) {
	    					$(this).before('<div class="chip" data-value="'+val+'">'+val+'<a href="#" class="btn btn-clear" aria-label="Close" role="button"></a></div>');
	    				}
	    				$(this).val("");
	    				
	    				e.preventDefault();
	    				return false;
		        }

			});
		
		}
		
		var myDiscussion = (function()	{
			var restrictUrls = [window.location.origin +"/s/logout",window.location.origin +"/s/logout/","/s/logout","/s/logout/","logout/"];
			function init() {
				
				$("#discussions").on("click", ".deleteFeed", function(e)	{
					
					e.preventDefault();	
					
					if(!confirm("Are you sure?")) {
						return false;
					}
					
					var packet = {
							url: $(this).attr("href"),
							data: {},
							success: function(data, params)	{
									params.btn.closest(".discussion").remove();
									
									$("#totaldiscussions, .itemDiscussions").html(parseInt($("#totaldiscussions").text()) - 1);
									
									if(feedsCont.children(".discussion").length == 0)	{
										feedsCont.html($("#nodiscussion-template").html());
									}
									
							}
					};
					
					postData(packet, { btn: $(this)});
					
					return false;
				});
				
				$("#discussions").on("click", ".reportFeed", function(e)	{
					
					e.preventDefault();			
					
					if(!confirm("Are you sure?")) {
						return false;
					}
					
					var packet = {
							url: $(this).attr("href"),
							data: {},
							success: function(data, params)	{
								showAlert("green", data.message);
							}
					};
					
					postData(packet, { btn: $(this)});
					
					return false;
				});
				
				$("#discussions").on("click", ".hideFeed", function(e)	{
					
					e.preventDefault();		
					
					if(!confirm("Are you sure?")) {
						return false;
					}
					
					var packet = {
							url: $(this).attr("href"),
							data: {},
							success: function(data, params)	{
								
									params.btn.closest("li").hide().closest("ul").find(".unhideFeed").closest("li").show();
									params.btn.closest(".discussion").addClass("hidden");
									showAlert("green", data.message);
							}
					};
					
					postData(packet, { btn: $(this)});
					
					return false;
				});
				
				$("#discussions").on("click", ".unhideFeed", function(e)	{
					
					e.preventDefault();	
					
					if(!confirm("Are you sure?")) {
						return false;
					}
					
					var packet = {
							url: $(this).attr("href"),
							data: {},
							success: function(data, params)	{
									params.btn.closest("li").hide().closest("ul").find(".hideFeed").closest("li").show();
									params.btn.closest(".discussion").removeClass("hidden");
									showAlert("green", data.message);
							}
					};
					
					postData(packet, { btn: $(this)});
					
					return false;
				});
				
				$("#discussions").on("click", ".pinFeed", function(e)	{
					
					e.preventDefault();		
					
					if(!confirm("Are you sure?")) {
						return false;
					}
					
					var packet = {
							url: $(this).attr("href"),
							data: {},
							success: function(data, params)	{
								
									params.btn.closest("li").hide().closest("ul").find(".unpinFeed").closest("li").show();
									params.btn.closest(".discussion").addClass("pinned");
									showAlert("green", data.message);
							}
					};
					
					postData(packet, { btn: $(this)});
					
					return false;
				});
				
				$("#discussions").on("click", ".unpinFeed", function(e)	{
					
					e.preventDefault();			
					
					if(!confirm("Are you sure?")) {
						return false;
					}
					
					var packet = {
							url: $(this).attr("href"),
							data: {},
							success: function(data, params)	{
									params.btn.closest("li").hide().closest("ul").find(".pinFeed").closest("li").show();
									params.btn.closest(".discussion").removeClass("pinned");
									showAlert("green", data.message);
							}
					};
					
					postData(packet, { btn: $(this)});
					
					return false;
				});
				
				$("#discussions").on("click", "#mceu_5",function() {
					$(".mce-primary").find("button[role=presentation]").on("click", function(e) {
						var mceValue = $(".mce-combobox .mce-textbox").val();
						if(isInvalidUrlEnter(mceValue)){
							showAlert("red", "This url is not valid " + mceValue);
							$(".mce-textbox").val("");
						}
					});
				});
				
				comment.init();
				
				newDiscussionPopupCompletion();
				
			}
			
			function isInvalidUrlEnter(mceValue){
				for(var urlInx  in restrictUrls){
					if(mceValue.includes(restrictUrls[urlInx])){
						return true;
					}
				}
				return false;
			}
			
			function newDiscussionPopupCompletion() {
				var ncont = $("#newdiscussion");
				
				ncont.find("textarea").attr("class", "mceEditor");
				
				tinymce.editors = [];
				
				tinymce.init({
					theme: "modern",
				    skin: 'light',
					mode : "specific_textareas",
			        editor_selector : /(mceEditor|mceRichText)/,
			        entity_encoding : "raw",
			        extended_valid_elements: 'a[class|href|target=_blank],b[class|data-id]',
					menubar : false,
					toolbar: [
					          "bold italic underline | bullist numlist | link"
					      ],
					statusbar : false,
					plugins: "link,mention,autolink,paste",
					paste_as_text: true,
					mentions: {
							delimiter: ['@', '#'],
							queryBy: '_id',
						    source: function (query, process, delimiter) {
						        // ajax call
						        // When using multiple delimiters you can alter the query depending on the delimiter used
						        if (delimiter === '@' && $.trim(query).length > 0 && query.split(" ").length == 1) {
						        	this.queryBy = "fname";
						           $.getJSON(ctx + '/feeds/users/suggestions?name=' + query, function (data) {
						              //call process to show the result
						        	   process(data.data);
						           });								           
						        }
						        
						        if (delimiter === '#' && $.trim(query).length > 0 && query.split(" ").length == 1) {
						        	this.queryBy = "_id";
						           $.getJSON(ctx + '/hashtag/suggestions?term=' + query, function (data) {
						              //call process to show the result
						        	   process(data);
						           });								           
						        }
						    },
						    render: function(item) {
						    	var template = _.template(
										$("#suggestTemplate").html()
									);
					    	
						    	return template( {item:item} );
						    },
						    renderDropdown: function() {
						        //add twitter bootstrap dropdown-menu class
						        return '<ul class="menu absolute ui-autocomplete"></ul>';
						    },
						    insert: function(item) {
						    	if(item.fname !== undefined)
						    		return '<b class="user" data-id="' + item._id + '"> @' + item.fname + ' </b>';
						    	
						    	return "#"+ item._id;
						    }
					},
					oninit: function() {
						
					},
					setup: function (editor) {
						
						var plcehlder = "<p id='thePlaceholder' style='color:gray;'>" + discussionPlaceholder + "</p>";
						
					    editor.on('init', function(){
					      if (tinyMCE.get("newDiscEditor").getContent() === ''){
					    	  tinyMCE.get("newDiscEditor").setContent(plcehlder);
					    	  ncont.find("button[type=submit]").attr("disabled", true);
					      }
					    });
					    //and remove it on focus
					    editor.on('focus',function(){
					      $('#newdiscussion iframe').contents().find('#thePlaceholder').remove();
					      ncont.find("button[type=submit]").removeAttr("disabled");
					    });
					  //and add it on focus
					    editor.on('blur',function(){
					    	if (tinyMCE.get("newDiscEditor").getContent() === ''){
					    		tinyMCE.get("newDiscEditor").setContent(plcehlder);
					    		ncont.find("button[type=submit]").attr("disabled", true);
					    	}
					    });
					}
				});
				
				$("#postImageUpload").change(function() {
				    // will log a FileList object, view gifs below
				    
				    if(this.files[0].size > 5000000) {
				    		showAlert("red", "Image size can't be more than 5 MB !");
				    		$(this).val("");
				    		return false;
				    }
				    
				    renderImage(this.files[0], "#postImageCont", "#postImageUpload");
				    
				});
				
				$("#newdiscussion").find("button[type=submit]").on("click", function() {
					//save post
					
					var taggedUsers = [],
						postHtmlText = $.trim(tinyMCE.get("newDiscEditor").getContent().replace(/<p>[ ]<\/p>/g, "").replace(/\u00A0/g,' ')),
						postHtmlDom = $(postHtmlText),
						postTxt = postHtmlDom.text().replace(/\s/g, ''),
						hashtags, formData = new FormData(), files = document.getElementById("postImageUpload").files, btn;
					
					if(postTxt === "")	{
						showAlert("red", "Post can't be empty !!!");
						return false;
					}
					if(isInvalidUrlEnter(postHtmlText)){
						showAlert("red", "Post contains invalid url");
						return false;
					}
					
					if(postTxt.length < minCharsLimit) {
						alert("Only "+postTxt.length+" characters are there. Minimum " + minCharsLimit + " characters is needed.");
						return false;
					}
					
					hashtags = getHashTags(postHtmlDom.text());
					formData.append("postHtmlText", postHtmlText);
					
					postHtmlDom.find("b.user").each(function() {
						if(taggedUsers.indexOf($(this).data("id")) < 0)	{
							taggedUsers.push($(this).data("id"));
						}
					});
					
					if(hashtags.length > 0)	{
						formData.append("hashtags", JSON.stringify(hashtags));
					}
					
					if(taggedUsers.length > 0)	{
						formData.append("taggedUsers", JSON.stringify(taggedUsers));
					}
					
					if(courseId != null) {
						formData.append("courseId", courseId);
					}
	            		
					if(courseItemId != null) {
	            			formData.append("courseItemId", courseItemId);
	            		}
					
					if(files.length > 0) {
						formData.append('file', files[0]);
					}
					
					if($("input[name=notifyUsers]:checked").length > 0) {
						formData.append('notify', $("input[name=notifyUsers]:checked").map(function() { return this.value; }).toArray().join(","))
					}
					
					btn = $(this).addClass("loading").attr("disabled", true);
					
					$.ajax({
					       url : ctx + "/post/save",
					       type : 'POST',
					       data : formData,
					       processData: false,  // tell jQuery not to process the data
					       contentType: false,  // tell jQuery not to set contentType
					       success : function(data) {
					    	   	if(!data.response) {
					    	   		showAlert("red", data.message);
					    	   		return;
					    	   	}
								
									$("#totaldiscussions, .itemDiscussions").html(parseInt($("#totaldiscussions").text()) + 1);
									
									tinyMCE.get("newDiscEditor").setContent("");
									$("#newdiscussion").removeClass("active");
										
									var discussion = {
												_id: data.id,
												"post-html-text": stripTags(postHtmlText, "p", "strong", "b", "em", "ul", "ol", "li", "a", "img", "br"),
												createdDate: {
													$date: (new Date()).getTime()
												},
												"ownerId": "me",
												"owner-info": {
													fname: "me",
													_id: "me"
												},
												"images": data.images
											},
										template = _.template(
											$("#discussioncard-template").html()
										),
										html = template( {item:discussion} );
									
									feedsCont.prepend(html);
									feedsCont.find(".empty").hide();
									feedsCont.find(".discussion:eq(0)").find("time.timeago").timeago();
									
									$("#postImageCont").html("");
									$("#postImageUpload").val("");
									
							
					       }
					}).always(function() {
						btn.removeClass("loading").removeAttr("disabled");
					});
					
				});
			}
			jQuery(document).ready(function($) {
			if($("#searchLearner").length > 0) {
			$("#searchLearner").autocomplete({
			      minLength: 2,
			      source: function( request, response ) {
			        var term = request.term;
			        if ( term in cache ) {
			          response( cache[ term ] );
			          return;
			        }
			 
			        $.getJSON( ctx + "/users/blocked/suggest?name=" + encodeURIComponent(term)+"&blocked=false" ,function( data, status, xhr ) {
			        	cache[ term ] = data.data;
			          response( data.data );
			        });
			      },
			      select: function( event, ui ) {
			    	  	if($(this).siblings(".chip[data-value='"+ui.item._id+"']").length == 0) {
	        				$(this).before('<div class="chip" data-value="'+ui.item._id+'">'+ ui.item.fname + + ' <b style="font-size: small;">'+ui.item.email+'</b>' + '<a href="#" class="btn btn-clear " aria-label="Close" role="button" onclick=unblockedLearner("'+ui.item._id+'")></a></div>');
	        			}
			    	  	
			    		var learnerIds = [];
						$(".discussion-learner-list").find(".chip[data-value]").each(function() {
							learnerIds.push($(this).data("value"));
						});
						var data = {};
						data["blockedLearners"] = JSON.stringify(learnerIds);
			    	  	updateData(ui.item._id,"Successfully blocked learner");
	        			this.value = "";			    	  	
			    	  	return false;			    	  
			      }
			    }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
				
					item.email = getUserEmail(item.email);
			    	
			    	var template = _.template(
								$("#usersuggest-template").html()
							),
						liHtml = template( {item:item} );
			    	
			    	// add spectre menu class
					ul.addClass("menu");
			    	
			        return $(liHtml).appendTo( ul );
			    };
			    }
			});   
			
			
			
			function updateData(data,msg){
				var packet = {
						url: ctx + "/users/"+data+"/discussion/block",
						success: function(data, params) {
							showAlert("green", msg);
						}
				};
				postData(packet, {});
			}
		
			return	{
				init: init
			};
		})();
		
		function renderImage(file, contid, fileinputid) {

		    $(contid).html("<div class='imgCont relative'><img src='"+URL.createObjectURL(file)+"'><button type='button' class='btn absolute btn-link fg-red p-0' style='right:5px;top:0;' onclick='$(this).closest(\".imgCont\").remove();$(\""+fileinputid+"\").val(\"\");'><i class='material-icons'>cancel</i></button></div>");
		}
		
		var comment = (function()	{
			
			function init()	{
				
				feedsCont.on("change", "#commentImageUpload", function() {
				    // will log a FileList object, view gifs below
				    
				    if(this.files[0].size > 5000000) {
				    		showAlert("red", "Image size can't be more than 5 MB !");
				    		$(this).val("");
				    		return false;
				    }
				    
				    renderImage(this.files[0], "#commentImageCont", "#commentImageUpload");
				    
				});
				
				feedsCont.on("click", ".addComment", function()	{
					//reset other open comments
					feedsCont.find(".commentTxt").html("").hide();
					feedsCont.find(".addComment").show();
					
					
					$(this).hide();
					
					var id = $(this).data("id"), cont = $(this).closest(".newAnswer");
					
					cont.find(".commentTxt").show().html($("#newcomment-template").html());
					cont.find("textarea").attr("class", "mceEditor").attr("id", id);
					
					tinymce.init({
						theme: "modern",
					    skin: 'light',
						mode : "specific_textareas",
				        editor_selector : /(mceEditor|mceRichText)/,
				        entity_encoding : "raw",
				        extended_valid_elements: 'a[class|href|target=_blank],b[class|data-id]',
						menubar : false,
						statusbar : false,
						toolbar: [
						          "bold italic underline | bullist numlist | link"
						      ],
						plugins: "link,mention,autolink,paste",
						mentions: {
								delimiter: ['@', '#'],
								queryBy: '_id',
							    source: function (query, process, delimiter) {
							        // ajax call
							        // When using multiple delimiters you can alter the query depending on the delimiter used
							        if (delimiter === '@' && $.trim(query).length > 0 && query.split(" ").length == 1) {
							        	this.queryBy = "fname";
							           $.getJSON(ctx + '/feeds/users/suggestions?name=' + query, function (data) {
							              //call process to show the result
								    	   process(data.data);
							           });								           
							        }
							        
							        if (delimiter === '#' && $.trim(query).length > 0 && query.split(" ").length == 1) {
							        	this.queryBy = "_id";
							           $.getJSON(ctx + '/hashtag/suggestions?term=' + query, function (data) {
							              //call process to show the result
							        	   process(data);
							           });								           
							        }
							    },
							    render: function(item) {
							    	var template = _.template(
											$("#suggestTemplate").html()
										);
									return template( {item:item} );
							    },
							    renderDropdown: function() {
							        //add twitter bootstrap dropdown-menu class
							      return '<ul class="menu absolute ui-autocomplete"></ul>';
							    },
							    insert: function(item) {
								    	if(item.fname !== undefined)
								    		return '<b class="user" data-id="' + item._id + '"> @' + item.fname + ' </b>';
								    	
								    	return "#"+ item._id;
							    }
						},
						paste_as_text: true,
						setup: function (editor) {
							var plcehlder = $("#discussionplaceholer-template").html();
							
						    editor.on('init', function(){
						      if (tinyMCE.get(id).getContent() === ''){
						    	  tinyMCE.get(id).setContent(plcehlder);
						    	  cont.find(".submitButton").attr("disabled", true);
						      }
						    });
						    //and remove it on focus
						    editor.on('focus',function(){
						      cont.find('iframe').contents().find('#thePlaceholder').remove();
						      cont.find(".submitButton").removeAttr("disabled");
						    });
						  //and add it on focus
						    editor.on('blur',function(){
						    	if (tinyMCE.get(id).getContent() === ''){
						    		tinyMCE.get(id).setContent(plcehlder);
						    		cont.find(".submitButton").attr("disabled", true);
						    	}
						    });
						}
					});
				});
				
				feedsCont.on("click", ".cancelComment", function()	{
					$(this).closest(".commentTxt").html("").hide().closest(".newAnswer").find(".addComment").show();
				});
				
				feedsCont.on("click", ".submitButton", function()	{
					var postId = $(this).closest(".discussion").data("id"), text = $.trim(tinyMCE.get("comm"+postId).getContent().replace(/<p>[ ]<\/p>/g, "").replace(/\u00A0/g,' ')), commentTxt = $(text).text().replace(/\s/g, ''), postHtmlDom = $(text);
					
					if(text === "")	{
						showAlert("red", "Comment can't be empty !!!");
						return false;
					}
					
						if(commentTxt.length < minCharsLimit) {
							alert("Only "+commentTxt.length+" characters are there. Minimum " + minCharsLimit + " characters is needed.");
							return false;
						}
	            		
	            		$(this).addClass("active").attr("disabled", true);
	            		
	            		var cdata = {commentHtml: text}, packet, hashtags = [], taggedUsers = [],
	            			formData = new FormData(), files = document.getElementById("commentImageUpload").files, btn;
	            		
	            		hashtags = getHashTags(postHtmlDom.text());
						
					postHtmlDom.find("b.user").each(function() {
						if(taggedUsers.indexOf($(this).data("id")) < 0)	{
							taggedUsers.push($(this).data("id"));
						}
					});
	            		
	            		
	            		if(hashtags.length > 0)	{
						cdata["hashtags"] = hashtags;
					}
					
					if(taggedUsers.length > 0)	{
						cdata["taggedUsers"] = taggedUsers;
					}
					
					formData.append("commentData", JSON.stringify(cdata));
	            		
	            		if(files.length > 0) {
							formData.append('file', files[0]);
						}
	            		
	            		
	            		btn = $(this).addClass("loading").attr("disabled", true);
						
						$.ajax({
						       url : $(this).closest(".newAnswer").data("url"),
						       type : 'POST',
						       data : formData,
						       processData: false,  // tell jQuery not to process the data
						       contentType: false,  // tell jQuery not to set contentType
						       success : function(data) {
						    	   
						    	   	if(!data.response) {
						    	   		showAlert("red", data.message);
						    	   		return;
						    	   	}
						    	   	
						    	   	var template = _.template(
    										$("#commentTemplate").html()
    									),
    									html = template( {item:{ _id: data.id, "images": data.images, feedId: postId, "comment-html-text": stripTags(text, "p", "strong", "b", "em", "ul", "ol", "li", "a", "img", "br"), userId: "me" }} );
    								
    								btn.closest(".newAnswer").before(html);
    								btn.closest(".answers").find(".answer:last").find("time.timeago").timeago();
    								btn.closest(".commentTxt").html("").hide().closest(".newAnswer").find(".addComment").show();
								
						       }
						}).always(function() {
							btn.removeClass("loading").removeAttr("disabled");
						});
	            		
	            
				});
				
				feedsCont.on("click", ".deleteComment", function(e)	{
					
					e.preventDefault();
					
					if(!confirm("Are you sure?")) {
						return false;
					}
					
					var packet = {
							url: $(this).attr("href"),
							data: { feedId: $(this).closest(".discussion").data("id")},
							success: function(data, params)	{
								params.btn.closest(".answer").remove();
							}
					};
					
					postData(packet, { btn: $(this)});
					
					return false;
				});
				
				feedsCont.on("click", ".reportComment", function(e)	{
					
					e.preventDefault();
					
					if(!confirm("Are you sure?")) {
						return false;
					}
					
					
					var packet = {
							url: $(this).attr("href"),
							data: { feedId: $(this).closest(".discussion").data("id")},
							success: function(data, params)	{
								showAlert("green", data.message);
							}
					};
					
					postData(packet, { btn: $(this)});
					
					return false;
				});
				
				feedsCont.on("click", ".hideComment", function(e)	{
					
					e.preventDefault();
					
					if(!confirm("Are you sure?")) {
						return false;
					}
					
					var packet = {
							url: $(this).attr("href"),
							data: { feedId: $(this).closest(".discussion").data("id")},
							success: function(data, params)	{
									params.btn.closest("li").hide().closest("ul").find(".unhideComment").closest("li").show();
									params.btn.closest(".answer").addClass("hidden");
									showAlert("green", data.message);
							}
					};
					
					postData(packet, { btn: $(this)});
					
					return false;
				});

				feedsCont.on("click", ".unhideComment", function(e)	{
					
					e.preventDefault();
					
					if(!confirm("Are you sure?")) {
						return false;
					}
					
					var packet = {
							url: $(this).attr("href"),
							data: { feedId: $(this).closest(".discussion").data("id")},
							success: function(data, params)	{
									params.btn.closest("li").hide().closest("ul").find(".hideComment").closest("li").show();
									params.btn.closest(".answer").removeClass("hidden");
									showAlert("green", data.message);
							}
					};
					
					postData(packet, { btn: $(this)});
					
					return false;
				});
			}
			
			return	{
				init: init
			};
		})();
		
		var allDiscussions = (function() {
			
			var isContentLoading = false, limit = 15, template = null;
			
			function init(id) {
				template = _.template( $("#discussioncard-template").html() );
				
				discussionSearch.init();
				hashtagSearch.init();
				loadNewData();
				
				$(window).on("scroll", lazyLoadData);
				
				$("#discussions").find(".filter .chip").on("click", function(e) {
					var checkbox = $("#" + $(this).attr("for"));
					if(checkbox.val() !== "") {
						feedsCont.data("url", checkbox.val());
						$(".hashtagFilter, .searchFilter").hide();
						
						loadNewData();
					}
				});
				
				$("#discussions").on("click", ".hashtag", function(e)	{
					e.preventDefault();
					var hashtag = $.trim($(this).find("span").length>0?$(this).find("span").text():$(this).text());
					feedsCont.data("url", ctx + "/hashtag/" + hashtag.replace("#", "") + "/feed");
					
					$(".searchFilter").hide();
					$(".hashtagFilter").show().text("#" + hashtag.replace("#", ""));
					$("#tag-4").prop("checked", true);
					
					loadNewData();
					
					return false;
				});
				
				$("#discussions").on("click", ".spimage", function(e) {
					const viewer = new Viewer(this, {
						  inline: false,
						  title: 0,
						  navbar: 0,
						  toolbar: {
							    zoomIn: 1,
							    zoomOut: 1,
							    oneToOne: 1,
							    reset: 1,
							    prev: 0,
							    play: {
							      show: 0,
							      size: 'large',
							    },
							    next: 0,
							    rotateLeft: 1,
							    rotateRight: 1,
							    flipHorizontal: 1,
							    flipVertical: 1,
							  }
						});
					viewer.show(true);
				});
			}
			
			var discussionSearch = (function() {
				
				function init() {
					
					$("#searchDiscussionForm input").on("focus", function() {
						$(this).closest("form").addClass("col-4").removeClass("col-2").find("button").show();
					});
					
					$("#searchDiscussionForm input").on("blur", function() {
						$(this).closest("form").addClass("col-2").removeClass("col-4").find("button").hide();
					});
					
					
					$("#searchDiscussionForm").on("submit", function(e) {
						e.preventDefault();
						
						var txt = $(this).find("input").val().trim();
						if(txt !== "") {
							feedsCont.data("url", ctx + "/discussions/get?query=" + txt);
							$(".hashtagFilter").hide();
							$(".searchFilter").show().find("span").text(txt);
							$("#tag-5").prop("checked", true);
							
							loadNewData();
						}
						
						return false;
					});
				}
				
				return {
					init: init
				};
				
			})();
			
			var hashtagSearch = (function() {
				
					function split( val ) {
				      return val.split( /,\s*/ );
				    }
				    function extractLast( term ) {
				      return split( term ).pop();
				    }
					
				
				function init() {
					
					$(".searchHashtagForm").on("submit", function(e) {
						e.preventDefault();
						
						var hashtag = $(".searchHashtag").val().replace(/\s/g, "");
						if(hashtag !== "") {
							feedsCont.data("url", ctx + "/hashtag/" + hashtag + "/feed");
							
							$(".hashtagFilter").show().text("#" + hashtag);
							$("#tag-4").prop("checked", true);
							
							loadNewData();
						}
						
						return false;
					});
					
					$(".searchHashtag").on("focus", function(event) {
						var input = $(this);
						
						input.bind( "keydown", function( event ) {
							if (event.which === 32)
					             return false;
							
							
						        if ( event.keyCode === $.ui.keyCode.TAB &&
						                $( this ).autocomplete( "instance" ).menu.active ) {
						              event.preventDefault();
						            }
						}).autocomplete({
						      source: function(request, response) {
						    	  
						    	    $.getJSON(ctx + '/hashtag/suggestions', { 
						    	    	term: input.val()
						    	    	}, response);
						      },
						      search: function() {
						          // custom minLength
						          var term = extractLast( this.value );
						          if ( term.length < 2 ) {
						            return false;
						          }
						        },
						      focus: function() {
						          // prevent value inserted on focus
						          return false;
						        },
					        select: function( event, ui ) {
					            var terms = split( this.value );
					            // remove the current input
					            terms.pop();
					            // add the selected item
					            terms.push( ui.item._id );
					            // add placeholder to get the comma-and-space at the end
					            //terms.push( "" );
					            this.value = terms.join( ", " );
					            
					            $(this).closest("form").trigger("submit");
					            
					            return false;
					          }
						}).data("ui-autocomplete")._renderItem = function( ul, item ) {
							//add spectre menu class
							ul.addClass("menu");
							
					        return $( "<li class='menu-item'>" )
					          .append( "<a>#" + item._id + "</a>" )
					          .appendTo( ul );
					      };
					});
				}
			    
			    return {
			    	init: init
			    };
				
			})();
			
			function loadNewData() {
				if(isContentLoading)	{
					return false;
				}
				
				//remove previous discussions
				feedsCont.find(".discussion, .empty").remove();
				feedsCont.children(".loading").show();
				
				getNewData();
			}
			
			function lazyLoadData() {
				if (!isContentLoading && $(window).scrollTop() + $(window).height() >= feedsCont.children('.loading').offset().top) {
					getNewData();
		        }
			}
			
			function getNewData()	{
				isContentLoading = true;
				
				var data = {skip: feedsCont.find(".discussion").length, limit: limit}, packet;
				
				if(courseId !== null) {
					data["courseId"] = courseId;
				}
				
				if(courseItemId !== null) {
					data["courseItemId"] = courseItemId;
				}
				
				packet = {
						url: feedsCont.data("url"),
						data: data,
						success: function(data, params)	{
							
						var html = "", items = data.data, prevDisCount = feedsCont.find(".discussion").length;
							
					    	for(var i = 0;i < items.length; i++){
					    		html = html + template( {item:items[i]});
						}
					    	
					    	feedsCont.children(".loading").before(html);
					    	
					    	if(data.total == 0) {
					    		feedsCont.prepend($("#nodiscussion-template").html());
					    	}else {
					    		
					    		if(feedsCont.data("url").indexOf("query=") > -1) {
					    			var params = new URLSearchParams(new URL("https://"+location.href+"/"+feedsCont.data("url")).search),
					    			
					    			query = params.get("query");
					    			
					    			if(prevDisCount > 0) {
					    				feedsCont.find(".discussion:gt("+(prevDisCount - 1)+")").find(".discussionContent :not(img)").contents().filter(function() { return this.nodeType == Node.TEXT_NODE }).wrap("<spee />");
					    			}else {
					    				feedsCont.find(".discussion").find(".discussionContent :not(img)").contents().filter(function() { return this.nodeType == Node.TEXT_NODE }).wrap("<spee />");
					    			}
					    			
					    			feedsCont.find("spee").contents().filter(function() { return this.nodeType == Node.TEXT_NODE && $.trim($(this).text()) != ""; }).each(function()	{
					    				var txt = $(this).text().replace(new RegExp(query, "ig"), '<mark>'+query+'</mark>');
									$(this).replaceWith(txt);
								});
					    		}
					    		
					    	}
					    	
					    	$("#totaldiscussions, .itemDiscussions").html(data.total);
					    	
					    	$("time.timeago").timeago();
					    	
					    	if(data.total == feedsCont.find(".discussion").length)	{
					    		feedsCont.children(".loading").hide();
								$(window).off("scroll");
							}else	{
								$(window).off("scroll").on("scroll", lazyLoadData);
							}
							
					    	isContentLoading = false;
						}
				};
				
				getData(packet, {});
			}
			
			return {
				init: init
			};
			
		})();
		
		var trendingTags = (function() {
			
			var cont = null;
			
			function init() {
				cont = $("#trendingtags");
				
				var fdata = {}, packet;
				
				if(courseId !== null) {
					fdata["courseId"] = courseId;
				}
				
				if(courseItemId !== null) {
					fdata["courseItemId"] = courseItemId;
				}
				
				packet = {
						url: cont.data("url"),
						data: fdata,
						success: function(data, params) {
							
							var tags = data.data;
							
							if(tags.length > 0)	{
								var template = _.template(
										$("#trendingtag-template").html()
									), html = "";
								
								for(var i = 0;i < tags.length; i++){
									if(tags[i]._id !== "") {
										html = html + template( {item:tags[i]} );
									}
								}
								
								cont.html("<ul class='menu' style='box-shadow: none;background: none;'>"+html+"</ul>");
							}else {
								cont.find(".empty").show();
							}
							
							cont.removeClass("loading")
						}
				};
				
				getData(packet, {});
			}
			
			return {
				init: init
			};
			
		})();
		
		var blockedLearners = (function() {
			var title = "";
					
			function init() {
				blockedLearnerList = "";
				$.ajax({
				       url : ctx + "/users/blocked/suggest?blocked=true",
				       type : 'GET',
				       success : function(data) {
				    	   
				    	   	if(data) {
				    	   		data.data.forEach(function(d) {
				    	   			blockedLearnerList = blockedLearnerList.concat('<div class="chip" data-value='+d._id+'><span class="learnerIdTitle">'+d.fname+ ' <b style="font-size: small;">&nbsp;'+getUserEmail(d.email)+'</b></span><a href="#" class="btn btn-clear" aria-label="Close" role="button" onclick=unblockedLearner("'+d._id+'")></a></div>');
				    	   		});
				    	   		$("#blockedLearnerId").append(blockedLearnerList);
				    	   	}
				    	 }
				}).always(function() {
				});
			}
			
			function getUserEmail(email) {
				return email.substring(email.indexOf("-") + 1);
			}
			return {
				init: init
			};
			
		})();
		
		return {
			init: init,
			initCItemMode: initCItemMode
		};
		
	})();

var affiliatelinks = (function(){
	
	var cont = null, referCode = null, domain = null, queries = {};
	
	function init() {
		cont = $("#affiliatelinks");
		referCode = cont.data("refercode");
		domain = cont.data("domain")
		
		cont.find(".resetFilterBtn").on("click", function(e) {
			cont.find(".courseTxt").val("");
			reloadLinks(false);
		});
		
		cont.find(".filterSearchBtn").on("click", function(e) {
			reloadLinks(false);
		});
		
		getLinks();
	}
	
	function getLinks() {
		var columns =  [
		                { "data": "_id" },
		                { "data": "spayee:resource.spayee:title" },
		                { "data": "spayee:resource.spayee:courseUrl" }
		            ],
		columnDefs = [
							{ 'sortable': false, 'targets': [0,2] },
							{
							    "render": function ( data, type, row ) {
								 	  return '<div class="column"><div class="card relative"><div class="card-image"><img class="img-responsive rounded" src="/s/store/courses/'+data+'/cover?v='+row['spayee:resource']['spayee:coverVersion']+'" onerror="showCourseDefaultCover(this, \''+data+'\')"></div></div></div>';
							    },
							    "targets": 0
							},{
								"render": function(data, type, row) {
									return htmlEntities(data);
								},
								"targets": 1
							},{
								"render": function(data, type, row) {
									return '<div class="input-group"><input type="text" id="c-'+row._id+'" class="form-input input-sm" value="https://'+domain+getCourseLandingPageUrl(row._id, data)+'?affCode='+referCode+'" readonly><button class="btn input-group-btn btn-sm clipBtn tooltip-top" data-tooltip="Copied" data-clipboard-target="#c-'+row._id+'"><i class="material-icons">file_copy</i> Copy</button></div>';
								},
								"targets": 2
							}
							
			               
			           ];
		
		
			initDataTable(cont.find(".affiliatelinksTable"), columns, columnDefs, true, "", "", {ssscustom: getFilters}, {"fnDrawCallback": function(e)	{
				//
				if(ClipboardJS.isSupported()) {

					var clipboard = new ClipboardJS('.clipBtn');
					
					clipboard.on('success', function(e) {
					    
					    e.trigger.classList.add("tooltip");
					    
					    setTimeout(function() {
					    	e.trigger.classList.remove("tooltip");
					    }, 1000);

					    e.clearSelection();
					});
				}else {
					$('.clipBtn').remove();
				}
			}, "order": [[ 1, "asc" ]]});
		
	}
		
	function reloadLinks(samePage) {
		cont.find(".affiliatelinksTable").find("table").DataTable().ajax.reload(null, !samePage);
	}
	
	function getFilters() {
		var d = {}, txt = $.trim(cont.find(".courseTxt").val());
		
		if(txt !== "") {
			queries["spayee:resource.spayee:title"] = cont.find(".courseTxt").val();
		}else {
			delete queries["spayee:resource.spayee:title"];
		}
        	
        	d["queries"] = JSON.stringify(queries);
            
        return d;
	}
	
	return {
		init: init
	};
})();

var ccodes = (function() {
	
	var cont = null, queries = {};
	
	function init() {
		
		cont = $("#creditcodes");
		
		$("#searchCreditCode").on("submit", function(e) {
			e.preventDefault();
			reloadCreditCodes(false);
			return false;
		});
		
		loadCreditCodes();
		
	}
	
	function loadCreditCodes() {
		var columns = [
						{ "data": "createdDate" },
		                { "data": "code" },
		                { "data": "credits" },
		                { "data": "validTill" },
		                { "data": "usageType" },
		                { "data": "active" },
		                { "data": "redeemedBy"}
	                    ],
	        columnDefs = [{"render": function ( data, type, row ) {
							 	   if(data !== undefined) {
							            return convertDateTime(new Date(data["$date"]));
							 	   }
							 	   return "-";
							    },
							    "targets": 0
							},
			              {
			                  "render": function ( data, type, row ) {
			               	   if(data)	{
			               		   return "<span class='text-success'>YES</span>";
			               	   }
			               	   return "<span class='text-error'>NO</span>";
			                  },
			                  "targets": 5
				           },{
				                  "render": function ( data, type, row ) {
					               	   if(data != undefined)	{
					               		var html = "";
				                		   	$.each(data.data, function(index, value) {
				                		   		var fname = value.fname , email = getUserEmail(value.email);
				                		   		html = html + '<figure class="avatar avatar-sm" data-initial="'+getUserInitial(email, fname)+'"><img src="'+ctx+'/profile/'+value._id+'/thumb" alt="" onerror="this.style.display=\'none\'"></figure>'+(fname!==undefined?fname:'') +" ("+email+")";
				                		   	});
				                		   	
				                		   	return html;
					               	   }
					               	   return "-";
					                  },
					                  "targets": 6
						      }];
		
		initDataTable(cont.find(".creditcodesTable"), columns, columnDefs, false, "", "", {ssscustom: getFilters}, {});
	}
	
	function getFilters() {
		var d = {}, txt = $.trim($(".searchCodeTxt").val());
		
		if(txt !== "") {
			queries["code"] = txt.toUpperCase();
		}else {
			delete queries["code"];
		}
		
        	d["queries"] = JSON.stringify(queries);
        	
        return d;
	}
	
	function reloadCreditCodes(samePage) {
		if(samePage) {
			cont.find("table").DataTable().ajax.reload(null, false);
		}else {
			cont.find("table").DataTable().ajax.reload();
		}
	}
	
	return {
		init: init
	};
	
})();


var affiliatecodes = (function(){
	
	var cont = null;
	
	function init() {
		cont = $("#affiliatecodes");
		
		getCodes();
	}
	
	function getCodes() {
		var columns =  [
		                { "data": "course" },
		                { "data": "title" },
		                { "data": "code" }
		            ],
		columnDefs = [
							{
							    "render": function ( data, type, row ) {
							    		if(data !== undefined ) {
								    		if(Array.isArray(data)) {
								    			return '<div class="column"><div class="card relative"><div class="card-image"><img class="img-responsive rounded" src="/s/store/courses/'+data[0]._id+'/cover?v='+data[0]['spayee:resource']['spayee:coverVersion']+'" onerror="showCourseDefaultCover(this, \''+data[0]._id+'\')"></div></div></div>';
								    		}else {
								    			return '<div class="column"><div class="card relative"><div class="card-image"><img class="img-responsive rounded" src="/s/store/courses/'+data._id+'/cover?v='+data['spayee:resource']['spayee:coverVersion']+'" onerror="showCourseDefaultCover(this, \''+data._id+'\')"></div></div></div>';
								    		}
							    		}
							    		
							    		return "";
							    },
							    "targets": 0
							},{
								"render": function(data, type, row) {
									if(data === undefined) {
										if(row.course !==undefined || row.telegram !== undefined){
											var titles = [];
										if(row.course !== undefined) {
											if(Array.isArray(row.course)) {
												
												$.each(row.course, function(index, value) {
													titles.push(value["spayee:resource"]["spayee:title"]);
												});
												
												
									    		}else {
									    			titles.push(row.course["spayee:resource"]["spayee:title"]);
									    			
									    			
									    		}
										} if(row.telegram !== undefined) {
											if(Array.isArray(row.telegram)) {
									
												$.each(row.telegram, function(index, value) {
													titles.push(value["title"]);
												});
												
										
									    		}else {
													titles.push(row.telegram["title"]);
									    		
									    			
									    		}
										}
										return titles.join(", ");
										 }else {
											return "All Courses";
										}
									}
									
									return data;
									
								},
								"targets": 1
							},{
								"render": function(data, type, row) {
									return '<div class="input-group"><input type="text" id="c-'+row._id+'" class="form-input input-sm" value="'+data+'" readonly><button class="btn input-group-btn btn-sm clipBtn tooltip-top" data-tooltip="Copied" data-clipboard-target="#c-'+row._id+'"><i class="material-icons">file_copy</i> Copy</button></div>';
								},
								"targets": 2
							}
							
			               
			           ];
		
		
			initDataTable(cont.find(".affiliatecodesTable"), columns, columnDefs, false, "", "", {}, {"fnDrawCallback": function(e)	{
				//
				if(ClipboardJS.isSupported()) {

					var clipboard = new ClipboardJS('.clipBtn');
					
					clipboard.on('success', function(e) {
						
						console.log(e);
					    
					    e.trigger.classList.add("tooltip");
					    
					    setTimeout(function() {
					    	e.trigger.classList.remove("tooltip");
					    }, 1000);

					    e.clearSelection();
					});
				}else {
					$('.clipBtn').remove();
				}
			}, "order": [[ 1, "asc" ]]});
		
	}
	
	return {
		init: init
	};
})();

var sales = (function() {
	
	var cont = null, searchBtn = null, cancelSearch = null, fromDate = null, toDate = null, cache = {}, affiliateOldTransactions = false;
	
	function init() {
		
		cont = $("#sales");
		searchBtn = cont.find(".searchBtn");
		cancelSearch = cont.find(".cancelSearchBtn");
        fromDate = cont.find(".fromDate").datetimepicker({
			timepicker:false,
			format:'Y-m-d',
			maxDate: convertDateTimeY_M_D(new Date())
		});
		toDate = cont.find(".toDate").datetimepicker({
			timepicker:false,
			format:'Y-m-d',
			maxDate: convertDateTimeY_M_D(new Date())
		});
		
		bindEvents();
		getTransactions();
	}
	
	function bindEvents() {
		
		$(".oldTransactionsBtn").on("click", function(e) {
			$(this).addClass("active").siblings().removeClass("active");
			affiliateOldTransactions = true;
			reloadTransactions(false);
		});
		
		$(".newTransactionsBtn").on("click", function(e) {
			$(this).addClass("active").siblings().removeClass("active");
			affiliateOldTransactions = false;
			reloadTransactions(false);
		});
		
		$(".more-filters-key-sales-btn").on("click", function(e) {
			$(".more-filters-sales").show();
			$(".more-filters-key-sales").hide();
			$(".more-filters-key-sales-utm-medium").show();
		});
		
		$(".less-filters-key-sales").on("click", function(e) {
			$(".more-filters-sales").hide();
			$(".more-filters-key-sales").show();
			$(".more-filters-key-sales-utm-medium").hide();
		});
		
		$("#createdDate").on("change", function() {
			if($(this).val().indexOf("custom") < 0)	{
				searchBtn.trigger("click");
				$("#createdDate").find("option[data-value='custom']").attr("value", "custom");
				cont.find(".customDate").hide();
				logAmplitude("sales_report_date_range_changed");
			}else	{
				cont.find(".customDate").show();
			}
		});
		
		var todaysDate = new Date().toISOString().split("T")[0];
		
	   fromDate.on("change", function(e) {
			toDate.datetimepicker({
					minDate: $(this).val()
				});
		});
		
		toDate.on("change", function(e) {
			fromDate.datetimepicker({
						maxDate: $(this).val()
					});
			
			if($(this).val() === "") {
				fromDate.datetimepicker({
						maxDate: convertDateTimeY_M_D(new Date())
					});
			}
		});
		
		$("#customDateBtn").on("click", function() {
			
			var fDate = fromDate.val(), tDate = toDate.val();
			
			if(fDate === "" || !checkDateFormat(fDate))	{
				showAlert("red", "From Date can't be empty !!!");
				return false;
			}
			
			if(tDate === "" || !checkDateFormat(tDate))	{
				showAlert("red", "To Date can't be empty !!!");
				return false;
			}
			
			$("#createdDate").find("option[data-value='custom']").attr("value", "custom-" + toISTDate(fDate) + "-" + toISTDate(tDate));
			
			searchBtn.trigger("click");
			logAmplitude("sales_report_date_range_changed");
		});
		
		searchBtn.on("click", function() {
			reloadTransactions(false);
			logAmplitude("sales_report_search_tapped");
		});
		
		cancelSearch.on("click", function() {
			cont.find("input, select").filter(function() { return $(this).closest(".dateFields").length == 0 && $(this).data("value") !== undefined;}).val("");
			reloadTransactions(false);
			$(".affiliateOldCont").hide();
			$("#commissionAmount").data("rate", null);
			logAmplitude('sales_report_clear_tapped');
		});
		
		$("#exportBtn").on("click", function() {
			var href = $(this).data("href"), queries = "";
            
            cont.find("input[data-value], select[data-value]").each(function() {
	            	if($.trim($(this).val()) !== "" && $(this).data("value") !== "")	{
	            		queries = queries + "&" + $(this).data("value") + "=" + encodeURIComponent($.trim($(this).val()));
	        		}
	        	});
            
            queries = queries + "&timezoneOffset=" + new Date().getTimezoneOffset();
            queries = queries + "&skip=0";
            queries = queries + "&limit=10000";
            
            if(affiliateOldTransactions) {
            		queries = queries + "&affOld=true";
            }
            
            var packet = {
					url: href + queries,
					data: {},
					success: function(data, params) {
						showAlert("green", data.message);
					}
				};
			
			getData(packet, { btn: $(this)});
			logAmplitude("sales_report_download_csv_tapped");
		});
		
		cont.on("click", ".checkStatusBtn", function() {
			
			var data = cont.find("table").DataTable().rows($(this).closest("tr")).data()[0], packet;
			
			packet = {
					url: ctx + "/"+$(this).data("id")+"/transactions/" + data._id + "/status/check",
					data: {},
					success: function(data, params) {
						if(data.status) {
							reloadTransactions(true);
							showAlert("green", "Change in Transaction Status");
						}else {
							showAlert("red", "No change in Transaction Status");
						}
					}
				};
			
			getData(packet, { btn: $(this)});
			return false;
		});
		
		cont.on("click", ".changeStatusBtn", function() {
			
			var data = cont.find("table").DataTable().rows($(this).closest("tr")).data()[0],
				template = _.template($("#transactionInfoTemplate").html()), popup = $("#transactionInfo");	
			
			if(popup.length > 0) {
				popup.remove();
			}
			
			cont.append(template({item: data}));
			
			popup = $("#transactionInfo");
			
			popup.find("form").on("submit", function(e) {
				e.preventDefault();
				
				var packet = {
						url: $(this).attr("action"),
						data: {data: JSON.stringify($(this).serializeObject()), orderId: data["ORDERID"]},
						success: function(data, params) {
								showAlert("green", "Transaction Successfully Updated");
								reloadTransactions(true);
								popup.remove();
						}
					};
				
				postData(packet, {btn: popup.find("button[type=submit]")});
				return false;
			});	
		});
		
		cont.on("click", ".manualTransactionDelBtn", function(e) {
			
			var data = cont.find("table").DataTable().rows($(this).closest("tr")).data()[0],
			template = _.template($("#refundTemplate").html()), popup = $("#refund"), transactionId = data._id;
		
			if(popup.length > 0) {
				popup.remove();
			}
			
			cont.append(template({item: data}));
			
			popup = $("#refund");
			
			popup.find("form").on("submit", function() {
				var pData = $(this).serializeObject();
				pData.transactionId = transactionId;
				var packet = {
						url:  $(this).attr("action"),
						data: pData,
						success: function(data, params) {
								showAlert("green", "Transaction Successfully Updated");
								reloadTransactions(false);
								popup.remove();
						}
					};
				
				postData(packet, {btn: popup.find("button[type=submit]")});
				return false;
			});	
			
		});
		
		cont.on("click", ".TrackErrBtn,.newPickrrSuccBtn", function() {
			var data = cont.find("table").DataTable().rows($(this).closest("tr")).data()[0],
			template = _.template($("#transactionPickrrErrorTemplate").html()), popup = $("#transactionPickrrError");	
		
			if(popup.length > 0) {
				popup.remove();
			}
			
			cont.append(template());
			
			var html = "";
				popup = $("#transactionPickrrError");
				
				if(data['newtransactionPickrrResponseDataArray'] !== undefined){
					
					$.each(data['newtransactionPickrrResponseDataArray'], function(index, value) {
					if(value['pickrrTrackingId'] !== undefined){
						var trackurl = "https://www.pickrr.com/tracking/#/?tracking_id="+value['pickrrTrackingId'];
						html = html + "<tr><td>"+(index+1)+"</td><td>" + value['item_name'] + "</td><td>"+ "<a  target='_blank' href='"+ trackurl + "'>Track</a>" + "</td></tr>";
					}
				
					if(value['err'] !== undefined){
						html = html + "<tr><td>"+(index+1)+"</td><td>" + value['item_name'] + "</td><td>"+ value['err']+ "</td></tr>";
					}
					});
					popup.find('.content').append("<table class='table'><thead><td>S No.</td><td>Item Name</td><td>Status</td></thead><tbody>" + html + "</tbody></table>");
				
				} else {
					popup.find('.content').append(data['transactionPickrrResponseData']['err']);
				}
		});
		
		cont.on("click", ".refundBtn", function() {
			
			var data = cont.find("table").DataTable().rows($(this).closest("tr")).data()[0],
				template = _.template($("#refundTemplate").html()), popup = $("#refund");	
			
			if(popup.length > 0) {
				popup.remove();
			}
			
			cont.append(template({item: data}));
			
			popup = $("#refund");
			
			popup.find("form").on("submit", function() {
				var packet = {
						url: $(this).attr("action"),
						data: $(this).serializeObject(),
						success: function(data, params) {
								showAlert("green", "Transaction Successfully Updated");
								reloadTransactions(false);
								popup.remove();
						}
					};
				
				postData(packet, {btn: popup.find("button[type=submit]")});
				return false;
			});	
		});
		
		cont.find("#createTransactionBtn").off("click").on("click", function( event ) {
			var popup = cont.find("#transactionCreateView"), template = _.template($("#transactionCreateModal").html());
			
			if(popup.length > 0) {
				popup.remove();
			}

			cont.append(template());
			popup = $("#transactionCreateView");
			popup.addClass("active");
			
			if(revShareManualTxnEnabled){
				popup.find('form input[name="amount"]').attr('disabled',true);
			}
			
			var courseSearchInput, userSearchInput, countrySelect, transactionCreateView = $("#transactionCreateView");

			var addCourseSearchEvent = function(){
				courseSearchInput = transactionCreateView.find("#searchCourse");
				courseSearchInput.autocomplete({
				      minLength: 2,
				      source: function( request, response ) {
				        var term = request.term;
				        var countryCode = countrySelect.val() || "";
				        $.getJSON( ctx + "/courses/suggest?packages=true&name=" + encodeURIComponent(term) + "&countryCode=" + countryCode, function( data, status, xhr ) {
				        	response( data.data );
				        });
				      },
				      select: function( event, ui ) {
				    	  var id = ui.item._id;
				    	  var box = courseSearchInput.parent();
				    	  if(box.find('div[data-value="' + id + '"]').length) {
				    		  showAlert("red", "Course already selected.");
				    		  return;
				    	  }
				    	  onCourseSelect(ui.item, countrySelect.val() || "");
				      },
				      open: function(event, ui) {
				    	  	$("ul.ui-autocomplete").find("time.timeago").timeago()
				      }
				    }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
				    	
				    	var template = _.template(
									$("#coursesuggest-template").html()
								),
							liHtml = template({item: item}), liNode = $(liHtml);
				    	
				    		ul.addClass("menu");
				    		
				        return liNode.appendTo( ul );
				    };
				    
				    courseSearchInput.keypress(function(e){
						 var keycode = (e.keyCode ? e.keyCode : e.which);
						 if(keycode == '13'){
						    e.preventDefault();
						 }
					});
			}
			
			var onCourseSelect = function(item, countryCode){
				var id = item._id;
				var title = item["spayee:resource"]["spayee:title"];
				
				function addCourse(title, pid, vid, mrp){
					var attrs = "";
					if(pid && vid){
						attrs = ' data-pid="' + pid +'" data-vid="' + vid +'"' +'" data-mrp="' + mrp +'"'							
					}
					courseSearchInput.parent().prepend('<div class="chip" data-value="' + id + '" ' + attrs + '>' + htmlEntities(title) + '<a href="#" onclick="removeItemchip('+mrp+')" class="btn btn-clear" aria-label="Close" role="button"></a></div>');
					var amountElement = transactionCreateView.find('form input[name="amount"]');
					var amount = amountElement.val();
					amountElement.val(Number(amount) + mrp)
				}
				
				var productVariants = countryCode ? item["spayee:resource"]["spayee:countryPricing"][countryCode]["spayee:productVariants"] : item["spayee:resource"]["spayee:productVariants"];
				
				if(productVariants && productVariants.length){
				
					var variantPopup = cont.find("#transactionCourseVariantView"), template = _.template($("#transactionCourseVariantModal").html());
					
					if(variantPopup.length > 0) {
						variantPopup.remove();
					}

					cont.append(template());
					variantPopup = $("#transactionCourseVariantView");
					variantPopup.addClass("active");
					
					for(var pv of productVariants){
						variantPopup.find('select[name="pid"]').append('<option value="' + pv.id + '">' + pv.productType + '</option>')
					}
					
					function onProductVariantChange(id){
						variantPopup.find('select[name="vid"]>option').remove();
						for(var pv of productVariants){
							if(id === pv.id){
								for(var vv of pv.validityVariants){									
									variantPopup.find('select[name="vid"]').append('<option value="' + vv.id + '">' + vv.label + '</option>')
								}
							}
						}
					}
					
					function appentToTitle(title, pid, vid){
						for(var pv of productVariants){
							if(pid === pv.id){
								title = title + ' | ' + pv.productType;
								for(var vv of pv.validityVariants){
									if(vid === vv.id){
										title = title + ' | ' + vv.label;
									}
								}
							}
						}
						return title;
					}
					
					function getMrp(pid, vid){
						var mrp = 0;
						for(var pv of productVariants){
							if(pid === pv.id){
								for(var vv of pv.validityVariants){
									if(vid === vv.id){
										mrp += vv.price || vv.mrp || 0;
									}
								}
							}
						}
						return mrp;
					}
					
					variantPopup.find('select[name="pid"]').on("change", function(){
						onProductVariantChange($(this).val())
					});
					
					variantPopup.find("form").on("submit", function(e){
						e.preventDefault();
						
						var data = $(this).serializeObject();
						addCourse(appentToTitle(title, data.pid, data.vid), data.pid, data.vid, getMrp(data.pid, data.vid));
						variantPopup.removeClass("active");
					});
					
					onProductVariantChange(productVariants[0].id);
					
				} else {
					addCourse(title, null, null, item["spayee:resource"]["spayee:price"] || item["spayee:resource"]["spayee:mrp"] || 0);
				}
				
				logAmplitude("sales_report_create_transaction_tapped");
		    	
			}
			
			var addUserSearchEvent = function(){
				var cache = {};
				userSearchInput = transactionCreateView.find("#searchUser");
				userSearchInput.autocomplete({
				      minLength: 2,
				      source: function( request, response ) {
				        var term = request.term;
				        if ( term in cache ) {
				          response( cache[ term ] );
				          return;
				        }
				 
				        $.getJSON( ctx + "/users/suggest?name=" + encodeURIComponent(term), function( data, status, xhr ) {
				        	cache[ term ] = data.data;
				        	response( data.data );
				        });
				      },
				      select: function( event, ui ) {
				    	  var id = ui.item._id;
				    	  var box = userSearchInput.parent();
				    	  if(box.find('div[data-value="' + id + '"]').length) {
				    		  showAlert("red", "Course already selected.");
				    		  return;
				    	  }
				    	  var title = '<div><p>' + ui.item["fname"] + '</p><p class="small">' + ui.item["email"] + '</p></div>';
				    	  box.prepend('<div class="chip item stu-chip" data-value="' + id + '">' + title + '<a href="#" class="btn btn-clear" aria-label="Close" role="button"></a></div>');
				      }
				    }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
					
						item.email = getUserEmail(item.email);
				    	
						var template = _.template(
									$("#usersuggest-template").html()
								),
							liHtml = template( {item:item} );
				    	
				    		// add spectre menu class
						ul.addClass("menu");
				    	
				        return $(liHtml).appendTo( ul );
				    };
				    userSearchInput.keypress(function(e){
						 var keycode = (e.keyCode ? e.keyCode : e.which);
						 if(keycode == '13'){
						    e.preventDefault();
						 }
					});
			};
			
			var addCountrySelectEvent = function(){
				
				countrySelect = transactionCreateView.find('select[name="countryCode"]');
				
				countrySelect.on("change", function(){
					courseSearchInput.parent().find('div[class="chip"]').remove();
					console.log(countrySelect.find('option[value="'+ countrySelect.val() +'"]').data("currency") || 'INR');
					if((countrySelect.find('option[value="'+ countrySelect.val() +'"]').data("currency") || 'INR') === 'INR'){
						transactionCreateView.find('#gstStateField').show();
					} else {
						transactionCreateView.find('#gstStateField').hide();
					}
				});

				countrySelect.find('option').each(function(){
					var code = $(this).attr("value");
					var label = getCountryLabel(code);
					if(label) {
						$(this).html(label + " " + $(this).html());
					}
				});
			}
			
			var addFormSubmitEvent = function(){
				transactionCreateView.find("form").on("submit", function(e) {
					e.preventDefault();
					
					var data = $(this).serializeObject();
					
					if($(this).find(".chip.affiliateId").length > 0) {
						data.affiliateCode = $(this).find(".chip.affiliateId").data("id");
					}
					
					var courseIdsBox = courseSearchInput.parent(), courses = [];
					var userIdBox = userSearchInput.parent();
					
					courseIdsBox.find("div").each(function(){
						var id = $(this).attr("data-value");
						var pid = $(this).attr("data-pid");
						var vid = $(this).attr("data-vid");
						var course = {id: id};
						if(pid){
							course.pid = pid;
						}
						if(vid){
							course.vid = vid;
						}
						courses.push(course);
					});
					if(courses.length){
						data.courses = JSON.stringify(courses);
					} else {
						showAlert("yellow", "Please add atleast one course.");
						return;
					}
					data.userId = $(userIdBox.find("div")).attr("data-value");
					if(!data.userId){
						showAlert("yellow", "Please select a learner.");
						return;
					}

					if(countrySelect.find('option[value="'+ data.countryCode +'"]').length > 0) {
						data.currencyCode = countrySelect.find('option[value="'+ data.countryCode +'"]').data("currency");
					}
					
					if(data.currencyCode === 'INR'){
						if(!data.gstState){
							showAlert("yellow", "Please select a state.");
							return;
						}
					} else {
						data.gstState = '';
					}
					var payload = {
						state: data.gstState,
						courses: JSON.parse(data.courses),
						learner: data.userId,
						transaction_id: data.transactionId,
						payment_mode: data.paymentMode,
						amount: data.amount,
						affiliate: data.affiliateCode
					}
					var packet = {
							url: $(this).attr("action"),
							data: data,
							success: function(data, params) {
								showAlert("green", "Transaction successfully created!");
								popup.remove();
								reloadTransactions(false);
								logAmplitude('sales_report_create_transaction_saved_tapped', params.payload);
							}
					}
					
					postData(packet, {btn: $(this).find("button[type=submit]"), clearForm: true, payload});
				})
			}
			
			popup.find("#affiliateId").autocomplete({
		      minLength: 2,
		      source: function( request, response ) {
		        var term = request.term;
		        if ( term in cache ) {
		          response( cache[ term ] );
		          return;
		        }
		        
		        $.getJSON( ctx + "/users/suggest?name=" + encodeURIComponent(term) + "&role=affiliate", function( data, status, xhr ) {
			        		if(data.data.length == 0){
			        	       response([
			  		        	       {
						        	       label: '', 
						        	       value: response.term
						        	       }
						        	     ]);
			        		} else{
		        	    	 		cache[ term ] = data.data;
		        	    	 		response( data.data );
			        		}
			    });
		      },
		      select: function( event, ui ) {
		      
		      		if(ui.item.label === "") {
		      			return;
		      		}
		      
		    	  	if($(this).siblings(".chip").length == 0) {
        				$(this).before('<div class="chip affiliateId" data-id="'+ui.item.referCode+'">'+ getUserEmail(ui.item.email)+' ('+ui.item.referCode + ') <a href="#" class="btn btn-clear" aria-label="Close" role="button"></a></div>');
        			}
        			
        			return;
        			
		      }
		    }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
		    
				// add spectre menu class
				ul.addClass("menu");
	    
	    		if(item.label === "") {
					return $("<li><a onclick='$(\"a[href=#learners]\").trigger(\"click\");showModal(\"newuser\");$(\"#role\").val(\"affiliate\");'>No affiliates found. Click here to add new affiliate.</a></li>").appendTo( ul );
				}else {
					var liHtml = `<li class="menu-item"><a><div class="tile tile-centered"><div class="tile-content">`+getUserEmail(item.email)+` (`+item.referCode+`)</div></div></a></li>`;
					return $(liHtml).appendTo(ul);
				}
		    };
			
			addCourseSearchEvent();
			addUserSearchEvent();
			addCountrySelectEvent();
			addFormSubmitEvent();
			
			$("#sales #transactionCreateView .close").on("click", function() {
				if($(this).is('button')){
					logAmplitude('sales_report_create_transaction_close', {button:'close button'});
				} else if($(this).is('a')){
					logAmplitude('sales_report_create_transaction_close', {button:'cross-close'});
				}
			});
		});
		
		
		cont.on("click", ".changeLogBtn", function(e) {
			var commentsBtn = $(this), row = $(this).closest("tr"), transaction = cont.find("table").DataTable().rows(row).data()[0], popup = $("#transactionChangelogPopup"), template = _.template($("#transactionChangelog-template").html());
			
			if(popup.length > 0) {
				popup.remove();
			}
			
			cont.append(template({item: transaction}));
			popup = $("#transactionChangelogPopup");

			popup.find("time.timeago").timeago();
		});
			
		cont.on("click", ".editBtn", function(e) {
			var commentsBtn = $(this), row = $(this).closest("tr"), transaction = cont.find("table").DataTable().rows(row).data()[0], popup = $("#transactionEditPopup"), template = _.template($("#transactionEdit-template").html());
			
			if(popup.length > 0) {
				popup.remove();
			}
			
			cont.append(template({item: transaction}));
			popup = $("#transactionEditPopup");
			
			popup.find("select[data-value]").each(function() {
				var val = $(this).data("value");
				if($(this).find("option[value='"+val+"']").length > 0) {
					$(this).val(val);
				}
			});
			
			
			if($(".selectAffiliateTxt").length > 0) {
			$(".selectAffiliateTxt").autocomplete({
		      minLength: 2,
		      source: function( request, response ) {
		        var term = request.term;
		        if ( term in cache ) {
		          response( cache[ term ] );
		          return;
		        }
		 
		        $.getJSON( ctx + "/users/suggest?name=" + encodeURIComponent(term) + "&role=affiliate", function( data, status, xhr ) {
		        		if(data.data.length == 0){
	        	       response([
	  		        	       {
				        	       label: '', 
				        	       value: response.term
				        	       }
				        	     ]);
        	     }
        	     else{
        	    	 
        	    	 cache[ term ] = data.data;
			         response( data.data );
        	     }
		        });
		      },
		      select: function( event, ui ) {
		    	  
		    	  if(ui.item.label === "") {
		    		  $(event.target).val("");
		    	  }else {
				  $(event.target).val(ui.item.referCode);
				  event.preventDefault();	  
		    	  }
		      }
		    }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
				ul.addClass("menu");
				if(item.label === "") {
					return $("<li><a onclick='$(\"a[href=#learners]\").trigger(\"click\");showModal(\"newuser\");$(\"#role\").val(\"affiliate\");$(\".affiliate-cont\").show();'>No affiliate code found. Click here to add new affiliate.</a></li>").appendTo( ul );
				}else {					
					var template = _.template(
								$("#affiliatecodesuggest-template").html()
							),
					liHtml = template( {item:item} );
					return $(liHtml).appendTo( ul );
				}
		    };
		}
			
						
			popup.find("form").off("submit").on("submit", function(e) {
				e.preventDefault();
				
				var fdata = $(this).serializeObject(), packet;
				var customFields = [];
				var changeFields = [];
				
				var gstTin = "";
				var gstAddress="";
				if(transaction.userGSTDetails){
					gstTin = transaction.userGSTDetails.gstin?transaction.userGSTDetails.gstin:"";
					gstAddress = transaction.userGSTDetails.gstaddress?transaction.userGSTDetails.gstaddress:"";
				}
				
				if(transaction.uFields && transaction.uFields.length>0){
					transaction.uFields.forEach(function(entry) {
    					customFields.push({key:entry.key,value:fdata[entry.key]});    					
    					if(fdata[entry.key]!==transaction['user-'+entry.key])
    					changeFields.push({fieldName:entry.displayName,oldValue:transaction['user-'+entry.key]?transaction['user-'+entry.key]:"NA",newValue:fdata[entry.key]});
    					delete fdata[entry.key];
					});					
				}
				if(customFields.length>0){
					fdata = {...fdata, customFields:JSON.stringify(customFields)};
				}
				 
				if(transaction.items[0]){
				var affCode =  transaction.items[0].affiliateCode?transaction.items[0].affiliateCode:"";
					fdata = {...fdata,itemId:$("#affiliateCode").attr("data-itemId")};
					if(fdata.affiliateCode !== affCode)
					changeFields.push({fieldName:"Affiliate Code",oldValue:affCode!=""?affCode:"NA",newValue:fdata.affiliateCode!=""?fdata.affiliateCode:"NA"});
				}
				if(fdata.gstin !== gstTin){
						changeFields.push({fieldName:"GST Number",oldValue:gstTin!=""?gstTin:"NA",newValue:fdata.gstin!=""?fdata.gstin:"NA"});
				}
				if(fdata.gstaddress !== gstAddress){
						changeFields.push({fieldName:"GST Address",oldValue:gstAddress!=""?gstAddress:"NA",newValue:fdata.gstaddress!=""?fdata.gstaddress:"NA"});
				}
				var pos =  transaction.placeOfSupply?transaction.placeOfSupply:""; 
				if(fdata.placeOfSupply!==pos){	
						changeFields.push({fieldName:"State",oldValue:pos!==""?pos.slice(0,transaction.placeOfSupply.lastIndexOf("(")):"NA",newValue:fdata.placeOfSupply!==""?fdata.placeOfSupply.slice(0,fdata.placeOfSupply.lastIndexOf("(")):"NA"});
				}
				
				if(changeFields.length>0){
					fdata= {...fdata,updatedFields:JSON.stringify(changeFields)};
				}
				packet = {
						url: ctx + "/transactions/"+transaction._id+"/update",
						data: fdata,
						success: function(data, params) {
							if(data.response) {
								showAlert("green", data.message);
								popup.remove();
								//redirect to course builder
								showAlert("green", "Refreshing in <b id='timer'>3</b> seconds");								
								var timer = 3, intv = setInterval(function() {
									timer--;
									$("#timer").html(timer);
									if(timer <= 0) {
										window.clearInterval(intv);
										location.reload();
									}
								}, 1000);							
							}else {
								showAlert("red", data.message);
							}
						}
				}
				
				postData(packet, {btn: $(this).find("button")});
				
				return false;
			});
		});
		
		cont.on("click", ".commentsBtn", function(e) {
			var commentsBtn = $(this), row = $(this).closest("tr"), transaction = cont.find("table").DataTable().rows(row).data()[0], popup = $("#transactionCommentsPopup"), template = _.template($("#transactionComments-template").html());
			
			if(popup.length > 0) {
				popup.remove();
			}
			
			cont.append(template({item: transaction}));
			popup = $("#transactionCommentsPopup");
			
			popup.find("time.timeago").timeago();
			
			popup.find(".modal-body").on("click", ".deleteComment", function(e) {
				
				if(!confirm("Are you sure?")) {
					return false;
				}
				
				var commentId = $(this).data("id"), packet;
				
				packet = {
						url: ctx + "/transactions/" + transaction._id + "/comment/" + commentId + "/delete",
						data: {},
						success: function(data, params) {
							if(data.response) {
								params.btn.closest(".tile").remove();
								
								var index1 = 0;
								
								$.each(transaction.comments, function(index, value) {
									if(value._id === commentId) {
										index1 = index;
									}
								});
								
								transaction.comments.splice( index1, 1 );

								$("#" + transaction._id + "-comments").text(transaction.comments.length);
								cont.find("table").dataTable().fnUpdate(transaction, row, undefined, false);
								
							}else {
								showAlert("red", data.message);
							}
						}
				};
				
				postData(packet, {btn: $(this)});
				
			});
			
			popup.find("form").off("submit").on("submit", function(e) {
				e.preventDefault();
				
				var fdata = $(this).serializeObject(), packet;
				
				packet = {
						url: ctx + "/transactions/"+transaction._id+"/comment/add",
						data: fdata,
						success: function(data, params) {
							if(data.response) {
								var temp1 = _.template($("#transactionCommentTemplate").html()),
									json = {_id: data.id, text: fdata.text, date: { $date: (new Date()).getTime() }, userId: SPUSER.id, user: {email: SPUSER.email, fname: SPUSER.name}};
								popup.find(".modal-body").append(temp1({item: json}));
								popup.find("time.timeago").timeago();
								
								if(transaction.comments === undefined) {
									transaction.comments = [];
								}
								transaction.comments.push(json);
								$("#" + transaction._id + "-comments").text(transaction.comments.length);
								
								cont.find("table").dataTable().fnUpdate(transaction, row, undefined, false);
								
								scrollToElement(popup.find(".modal-body .tile:last"));
								
							}else {
								showAlert("red", data.message);
							}
						}
				}
				
				postData(packet, {btn: $(this).find("button"), clearForm: true});
				
				return false;
			});
		});
		
		initAffiliateFilter();
		
		initCourseFilter();
	}
	
	function initCourseFilter() {

			cont.find(".filterCourseTxt").autocomplete({
	      minLength: 2,
	      source: function( request, response ) {
	        var term = request.term;
	        if ( term in cache ) {
	          response( cache[ term ] );
	          return;
	        }
	 
	        $.getJSON( ctx + "/courses/suggest?packages=true&name=" + encodeURIComponent(term), function( data, status, xhr ) {
	        	
		        	 if(data.data.length == 0){
		        	       response([
		  		        	       {
					        	       label: '', 
					        	       value: response.term
					        	       }
					        	     ]);
	        	     }
	        	     else{
	        	    	 	cache[ term ] = data.data;
				         response( data.data );
	        	     }
	        });
	      },
	      select: function( event, ui ) {
	    	  
	    	  if(ui.item.label === "") {
	    		  $(event.target).val("");
	    	  }else {
	    		  var cont1 = $(event.target).closest("div");
		    	  
		    	  // add course id to hidden input and remove
		    	  cont1.find("input[type='hidden']").val(ui.item._id);

		    	  // change course selection input
			      $(event.target).val(ui.item["spayee:resource"]["spayee:title"]);
			      event.preventDefault();
		    	  
	    	  }
	      }
	    }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
	    	
    			ul.addClass("menu");
    	
			if(item.label === "") {
				return $("<li><a onclick='$(\"a[href=#allcourses]\").trigger(\"click\");showModal(\"createcourse\");'>No courses found. Click here to add new course.</a></li>").appendTo( ul );
			}else {
				var template = _.template(
						$("#coursesuggest-template").html()
					),
				liHtml = template( {item:item} );
				
				return $(liHtml).appendTo( ul );
			}
	    };

	}
	
	function initAffiliateFilter() {
		if($(".filterAffiliateTxt").length > 0) {
			$(".filterAffiliateTxt").autocomplete({
		      minLength: 2,
		      source: function( request, response ) {
		        var term = request.term;
		        if ( term in cache ) {
		          response( cache[ term ] );
		          return;
		        }
		 
		        $.getJSON( ctx + "/users/suggest?name=" + encodeURIComponent(term) + "&role=affiliate", function( data, status, xhr ) {
		        		if(data.data.length == 0){
	        	       response([
	  		        	       {
				        	       label: '', 
				        	       value: response.term
				        	       }
				        	     ]);
        	     }
        	     else{
        	    	 
        	    	 cache[ term ] = data.data;
			         response( data.data );
        	     }
		        });
		      },
		      select: function( event, ui ) {
		    	  
		    	  if(ui.item.label === "") {
		    		  $(event.target).val("");
		    	  }else {
		    		  var cont = $(event.target).closest("div");
			    	  
			    	  // add school id to hidden input and remove
			    	  cont.find("input[type='hidden']").val(ui.item._id);
			    	  
			    	  $(".affiliateOldCont").show();

			    	  // change affiliate selection input
				  $(event.target).val(escape(ui.item.fname) + " (" + ui.item.email + ") " + ui.item.referCode);
				  $("#commissionAmount").data("rate", ui.item.affiliateRate);
				  event.preventDefault();
			    	  
		    	  }
		      }
		    }).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
			
				ul.addClass("menu");
		    	
				if(item.label === "") {
					return $("<li><a onclick='$(\"a[href=#learners]\").trigger(\"click\");showModal(\"newuser\");$(\"#role\").val(\"affiliate\");$(\".affiliate-cont\").show();'>No affiliates found. Click here to add new affiliate.</a></li>").appendTo( ul );
				}else {
					item.email = getUserEmail(item.email);
					
					var template = _.template(
								$("#usersuggest-template").html()
							),
						liHtml = template( {item:item} );
					
			        return $(liHtml).appendTo( ul );
				}
		    };
		}
	}
	
	function reloadTransactions(samePage) {
		if(samePage) {
			cont.find("table").DataTable().ajax.reload(null, false);
		}else {
			cont.find("table").DataTable().ajax.reload();
		}
	}
	
	function getTransactions() {

		var columns =  [
						{ "data": "createdDate" },
		                { "data": "" },
		                { "data": "TXNAMOUNT" },
		                { "data": "ORDERID" },
		                { "data": "userId" },
		                { "data": "items" }
		            ],
		columnDefs = [
							{ 'sortable': false, 'targets': [1,3,4,5] },
							{
							    "render": function ( data, type, row ) {
							 	   if(data !== undefined) {
							 		   if(data["$date"] !== undefined) {
								            return convertDateTime(new Date(data["$date"]));
							 		   }else {
								            return convertDateTime(new Date(data["time"]));
							 		   }
							 	   }
							 	   return "-";
							    },
							    "targets": 0
							},
							{
							    "render": function ( data, type, row ) {
							    			if(row["RESPCODE"] === "01")	{
								     	   var html = "<b class='text-success'>Success</b>";
								     	   if(row["TXNAMOUNT"] > 0 && cont.find(".transactionsTable th.noinvoice").length == 0) {
								     		   html = html + "<br><a href='"+ctx+"/invoice/"+row["ORDERID"]+"' target='_blank'>Invoice</a>";
								     	   }
								     	   return html;
								        }
								 	   
								 	  if(row["RESPCODE"] === "REFUND") {
										   var refundStatus = row?.refundData?.status;
										   if(refundStatus == undefined || refundStatus == 'processed'){
											   refundStatus = 'success';
										   }
								     	   return "<span class='text-warning'>Refund <br/>" + refundStatus + "</span>";
								      }
								 	  
								 	 if(row["RESPCODE"] === "DELETED" && row.manuallyDeleted) {
								     	   return "<span class='text-warning'>Manually Deleted</span>";
								     }
								 	 if(row["RESPCODE"] === "VOID") {
								     	   return "<span class='text-warning'>Void <br/>" + row["RESPMSG"] + "</span>";
								        }
								 	   
								 	   if(row["RESPCODE"] === "123456")	{
									        return row["RESPMSG"];
								 	   }
								 	   
								 	   if(row["STATUS"] !== undefined)
								 		  return "<span class='text-error'>" + row["STATUS"] + "<br/>" + row["RESPMSG"] + "</span>"; 
								 	   
								 	  return "<b class='text-error'>Failed <br/>" + row["RESPMSG"] + "</b>";
							    },
							    "targets": 1
							},
			               {
							    "render": function ( data, type, row ) {
							    		var currency = row['currencyCode']!==undefined?getCurrencySymbol(row['currencyCode']):'', affCode = null;
							    		
							    		$.each(row.items, function(index, value)	{
								    		if(value.affiliateCode !== undefined) {
								    			affCode = value.affiliateCode;
								    		}
								    	});
							    		
							    		
		                	   			if(data !== undefined && row['promocode'] !== undefined && row['promocode'] !== null)	{
		                	   				return "<div class='text-right text-small'><span class=''>" + currency + data + "</span><br/><span class='txt-fnote'>PROMO:&nbsp;<b>" + row['promocode'] + "</b></span><br/><span class='txt-fnote'>DISCOUNT:&nbsp;<b>" + currency + row["promoDiscount"] + "</b></span>" + (row.creditsUsed!==undefined&&row.creditsUsed!==null?"<br><span class='txt-fnote'>"+$("#orgCreditAlias").val()+":&nbsp;<b>"+currency+row.creditsValue+"</b></span>":"") + (affCode !== null? "<br/><span class='txt-fnote'>AFFCODE:&nbsp;<b>" + affCode + "</b></span>": "") + "</div>"; 
		                	   			}
	                	   		
			                	   		if(data !== undefined)	{
			                	   			if(data > 0 || (row.creditsUsed!==undefined && row.creditsUsed!==null)) {
			                	   				return "<div class='text-right text-small'><span class=''>" + currency + data + "</span>" + (row.creditsUsed!==undefined && row.creditsUsed!==null?"<br><span class='txt-fnote'>"+$("#orgCreditAlias").val()+":&nbsp;<b>"+currency+row.creditsValue+"</b></span>":"") + (affCode !== null? "<br/><span class='txt-fnote'>AFFCODE:&nbsp;<b>" + affCode + "</b></span>": "") + "</div>"; 
			                	   			}
		                	   				return "<div class='text-right text-small'><span class=''>Free</span>"+(affCode !== null? "<br/><span class='txt-fnote'>AFFCODE:&nbsp;<b>" + affCode + "</b></span>": "")+"</div>"; 
		                	   			}
			                	   
			                       return "NA";
							    },
							    "targets": 2
							},{
							    "render": function ( data, type, row ) {
							    		var html;
							    		
							    		 if(row.CHANNELID === "WAP")	{
				                    	   html = "Android<br>" + data;
				                      }else if(row.CHANNELID === "iOS") {
				                    	  html = "iOS<br>" + data;
				                      }else {
				                    	   html = "Web<br>" + data;
				                     }
							    		if(row["TXNID"] !== undefined && row["TXNID"] !== "NA") {
							    			html = html + "<br>" + row["TXNID"];
							    		}
				                      return html;
							    },
							    "targets": 3
							},{
							    "render": function ( data, type, row ) {
							    		if(row['userId'].length === 0) {
							    			return "-";
							    		}							    	
		                		   		var fname = row["userName"];
		                		   		var email = getUserEmail(row["userEmail"] ? row["userEmail"] : row["preCheckoutEmail"]);
		            					var isLearner = row["role"]=="student";
		                		   		if(cont.find(".transactionsTable th.actions.course-admin").length > 0 || (SPUSER.role=='sub-admin' && SPUSER.subAdminRoles.includes("learner-details") && isLearner)) {
		                		   			return '<a target="_blank" href="'+ctx+'/learners/'+data+'/courses" class="chip"><figure class="avatar avatar-sm" data-initial="'+getUserInitial(email, fname)+'"><img src="'+ctx+'/profile/'+data+'/thumb" alt="" class="img-fit-cover" onerror="this.style.display=\'none\'"></figure>'+((fname!==undefined && fname!==null)?fname:email)+'</a><br><div class="ml-1 mt-1 text-ellipsis" style="max-width: 150px;" title="'+row.userPhone+'"><i class="material-icons md-18 icon-text">phone</i> '+row.userPhone+'</div>';
		                		   		}
										
		                		   	
		                		   		return '<div class="chip"><figure class="avatar avatar-sm" data-initial="'+getUserInitial(email, fname)+'"><img src="'+ctx+'/profile/'+data+'/thumb" alt="" class="img-fit-cover" onerror="this.style.display=\'none\'"></figure>'+email+'</div><div class="ml-1 mt-1"><i class="material-icons md-18 icon-text">phone</i> '+row.userPhone+'</div>';
			                  },
			                  "targets": 4
							},{
							    "render": function ( data, type, row ) {
							    	
							    	var template = _.template($("#itemListTemplate").html()),
							    		html = "", currency = row["currencyCode"]!==undefined?getCurrencySymbol(row['currencyCode']):'';
							    	
								    	$.each(data, function(index, value)	{
								    		html += template({item: value, currency: currency});
								    	});
							    	
							        return "<ol class='itemsList'>" + html + "</ol>";
							    },
							    "targets": 5
							}
			               
			           ];
		
			if(cont.find(".transactionsTable th.actions").length > 0) {
				columns.push({ "data": "_id"});
				columnDefs.push({
	                "render": function ( data, type, row ) {
	                	var html = "";
	                	if(row["RESPCODE"] === "01" && row["manuallyDeleted"]){
	                		html = "";
	                	}else if(row["RESPCODE"] === "01" && row["manualTransaction"]) {
	              			// manual payment delete button
	                		html = html + "<button class='manualTransactionDelBtn btn btn-link tooltip tooltip-left w-38' data-tooltip='Set as Void' data-id='"+row["_id"]+"'><i class='material-icons md-18'>delete</i></button>";
	 				   	}else if(row["RESPCODE"] !== "01" && row["RESPCODE"] !== "REFUND") {
	              		   if(["paytm", "instamojo", "paypal", "payumoney", "traknpay", "ccavenue", "paystack", "fedapay", "payubiz", "xendit", "shurjopay", "stripe"].indexOf(row["paymentGateway"]) > -1 || (row.paymentGateway === 'razorpay' && (row.TXNID.startsWith('pay_') || row['razorpay_order_id'] !== undefined))) {
	              			 html = html + "<button class='checkStatusBtn btn btn-link tooltip tooltip-left w-38' data-tooltip='Check Status' data-id='"+row["paymentGateway"]+"'><i class='material-icons md-18'>check_circle</i></button>";
	                   	   }
	 				   	}else if(row["RESPCODE"] === "01") {
	 					   // successful transactions
	 					     html = html + "<button class='refundBtn btn btn-link tooltip tooltip-left w-38' data-tooltip='Refund'><i class='material-icons md-18'>settings_backup_restore</i></button>";
	 				   	} else if(row.paymentGateway === 'razorpay' && row["RESPCODE"] === "REFUND" && row?.refundData?.status === "pending"){
							html = html + "<button class='checkStatusBtn btn btn-link tooltip tooltip-left w-38' data-tooltip='Check Status' data-id='"+row["paymentGateway"]+"'><i class='material-icons md-18'>check_circle</i></button>";
						}
	              	   	if(html === "") {
							var subadminRolesFlag = false;
							if(SPUSER.role=="sub-admin" && SPUSER.subAdminRoles.indexOf('sales')<0) {
								subadminRolesFlag = true;
							}
							
							if(!subadminRolesFlag){
		              	   		html = html + "<button class='changeStatusBtn btn btn-link tooltip tooltip-left w-38' data-tooltip='Change Status'><i class='material-icons md-18'>edit</i></button>";
							}
	              	   	}
	              	   	html = html + "<button class='commentsBtn btn btn-link tooltip tooltip-left w-38' data-tooltip='Comments'><span " + (row.comments!==undefined&&row.comments.length>0?"class='badge' data-badge='" + row.comments.length + "'":'') + "><i class='material-icons md-18'>mode_comment</i></span></button>";
	              	   	
	              	   	/*Edit Button*/
	              	   	if(cont.find(".transactionsTable th.actions.course-admin").length > 0)
	              	   	html = html + "<button class='editBtn btn btn-link tooltip tooltip-left w-38' data-tooltip='Edit Order'><i class='material-icons md-18'>edit_note</i></span></button>";
	              	   	
	              	   	/*History Button*/
	              	   	if(row["changeLogs"]){
	              	   		html = html + "<button class='changeLogBtn btn btn-link tooltip tooltip-left w-38' data-tooltip='Changelogs'><i class='material-icons md-18'>history</i></span></button>";
	              	   	}
	              	   	if(row["pickrrTrackingId"]!==undefined && row["pickrrTrackingId"]!==''){
	              	   		var trackurl = "https://www.pickrr.com/tracking/#/?tracking_id="+row["pickrrTrackingId"];
	              	   		html = html + "<a  target='_blank' href='"+ trackurl +"' class='TrackSuccBtn btn btn-link tooltip tooltip-left w-38' data-tooltip='Track'><i class='material-icons md-18'>track_changes</i></a>";
	              	   	}
	              		if(row["pickrrTrackingId"]!==undefined && row["pickrrTrackingId"]===''){
	              	   		html = html + "<button class='TrackErrBtn btn btn-link tooltip tooltip-left w-38' data-tooltip='Error'><i class='material-icons md-18'>track_changes</i></button>";
	              	   	}
						if(row["newtransactionPickrrResponseDataArray"]!==undefined){
	              	   		html = html + "<button class='newPickrrSuccBtn btn btn-link tooltip tooltip-left w-38' data-tooltip='Track'><i class='material-icons md-18'>track_changes</i></button>";
	              	   	}	              	   	return "<div class='text-right'>" + html + "</div>";
	                 },
	                 "targets": 6
	             });
				
				columnDefs[0].targets.push(6);
			}
		
		
			initDataTable(cont.find(".transactionsTable"), columns, columnDefs, true, "", "", {ssscustom: getFiltersData}, {"fnDrawCallback": function(e)	{
				//
				var json = cont.find(".transactionsTable table").DataTable().ajax.json();
            	
               	 cont.find(".itemsList").each(function() {
               		 $(this).find('li:gt(0)').hide().last()
	                	 	.after($('<a />').attr('href','#').text('Show All').click(function(e){
               			        var a = this;
               			        $(a).siblings('li:not(:visible)').fadeIn(function(){
               			         if ($(a).siblings('li:not(:visible)').length == 0) $(a).remove();   
               			        }); return false;
               			    })
               			);
               	 });
               	
               	if(json["successfulTransactionData"] === undefined) {
               		if(json.start === 0) {
                   		$("#successfulCount").html("-");
                   		$("#successfulAmount").html("-");
               		}
               		return false;
               	}
               	
               	$("#totalTransactions").html(json.total);
               	
               	if(json["successfulTransactionData"] !== null && !$.isEmptyObject(json["successfulTransactionData"]))	{
               		
               		var html = "", scount = 0, rate = $("#commissionAmount").data("rate");
               		
               		$.each(json["successfulTransactionData"], function(key, value) {
               			scount += value.count;
               			html = html + " | " + getCurrencySymbol(key) + value.amount;
               		});
               		
               		$("#successfulCount").html(scount);
	                	$("#successfulAmount").html(html.substring(3));
	                	if(rate !== undefined && rate !== null && !affiliateOldTransactions) {
	                		var chtml = "";
	                		$.each(json["successfulTransactionData"], function(key, value) {
	                   			chtml = chtml + " | " + getCurrencySymbol(key) + (value.amount*rate*0.01).toFixed(2);
	                   		});
		                	$("#commissionAmount").html(chtml.substring(3));
	                	}else {
	                		$("#commissionAmount").html("-");
	                	}
               	}else	{
               		$("#successfulCount").html(0);
	                	$("#successfulAmount").html(0);
	                	$("#commissionAmount").html("-");
               	}
			}});
	
	}
	
	function getFiltersData() {
		var d = {};
		cont.find("input[data-value], select[data-value]").each(function() {
        		if($.trim($(this).val()) !== "" && $(this).data("value") !== undefined)	{
            		d[$(this).data("value")] = $.trim($(this).val());
        		}
        	});
        	
        	d["timezoneOffset"] = new Date().getTimezoneOffset();
        	
        	if(affiliateOldTransactions) {
        		d["affOld"] = "true";
        }
            
        return d;
	}
	
	return {
		init: init
	};
	
})();
