/*
 * manage the editor controls (a block of editable divs, 1 for each subtitle line)
 */
var text = $("#text");




function Editor() {
	this.SEPARATORS=" .,;\"!?&|/[]{}()";
	
	this.CHARTYPE_NONE=-1;
	this.CHARTYPE_WORD=0;
	this.CHARTYPE_SEPARATOR=1;
	
	// vertical position of "which line is the selected line"
	this.getLinePosition=function() {
		var currentnode=$(document.activeElement);
		return $("#text .line .textline").index(currentnode);
	};
	this.getLineCount=function() {
		return $("#text .line").size();
	};
	
	// horizontal position of the input caret on a single line
	this.getCharPosition=function() {
		var currentnode=$(document.activeElement);
		if ($("#text .line .textline").index(currentnode)>=0)
			return currentnode.caret();
		else
			return -1;
	};
	this.setCharPosition=function(position) {
		var currentnode=$(document.activeElement);
		if ($("#text .line .textline").index(currentnode)>=0) {
			currentnode.caret(position);
		}
	};
	this.setCharPositionFirst=function() {
		this.setCharPosition(0);
	};
	this.setCharPositionLast=function() {
		this.setCharPosition(-1);
	};
	
	
	this.getCharCount=function() {
		var currentnode=$(document.activeElement);
		if ($("#text .line .textline").index(currentnode)>=0)
			return currentnode.text().length;
		else
			return -1;
	};
	
	this.cleanuptext=function(text) {
		return text.replace("/(<([^>]+)>)/ig","");
	};
	
	// managing lines
	this.addline=function() {
		var element="<div class=\"line\"><span class=\"timecode\"></span><div class=\"textline\" contenteditable=\"true\"></div><div class=\"charcount\"></div></div>";
		var lineposition=this.getLinePosition();
		if (lineposition<0) {
			$("#text").append(element);
		} else {
			$("#text .line:nth-child("+(lineposition+1)+")").after(element);
		}
		lineposition++;
		$("#text .line:nth-child("+(lineposition+1)+") .textline").get(0).focus();
	};
	
	// remove the current line, merging it with the previous one if appropriate
	this.removeline=function() {
		var lineposition=this.getLinePosition();
		if (lineposition<0) {
			console.log("Error: trying to remove a \"negative\" line index");
			return;
		}
		var previousline=$("#text .line:nth-child("+(lineposition)+") .textline");
		var currentline=$("#text .line:nth-child("+(lineposition+1)+") .textline");

		var length=previousline.text().length;
		var extraspace="";
		if (currentline.text()!="") {
			if (currentline.text().charAt(0)!=" "
				&& currentline.text().charAt(0)!="."
				&& currentline.text().charAt(0)!=","
				)
				extraspace=" ";
			previousline.html(previousline.text()+extraspace+currentline.text());
		}
		
		currentline=$("#text .line:nth-child("+(lineposition+1)+")").remove();
		console.log("caret position:"+(length +extraspace.length)+ " / newtext:"+previousline.html());
	};
	
	this.getCharType=function(c) {
		if (this.SEPARATORS.indexOf(c)>=0) {
			return this.CHARTYPE_SEPARATOR;
		}
		return this.CHARTYPE_WORD;
	};
	
	this.format=function() {
		function randomString(length) {
			var chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		    var result = '';
		    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
		    return result;
		}
		
		var inputline=$("#text .line:nth-child("+(this.getLinePosition()+1)+") .textline").get(0);

		if (!inputline)
			return;
		
		var outputline=inputline.cloneNode(false);
		
		inputnode=inputline.firstChild;
		if (!inputnode)
			return;
		
		var previoustype=this.CHARTYPE_NONE;
		var currenttype;
		var outputnode=null;
		var outputtext="";
console.log("--------------------");
		// loop for each node
		do {
			var nodeburned=false;
			var inputtext=inputnode.textContent;
			// loop for each character
			for (var i=0, len=inputtext.length; i<len; i++) {
				c=inputtext[i];
				currenttype=this.getCharType(c);
				if (currenttype!=previoustype) {
					// publish the output node
					if (outputnode!=null) {
						outputnode.textContent=outputtext;
						outputline.insertBefore(outputnode, null);
console.log("commited word: "+outputtext);
					}
					// init a new output node
					outputtext="";
					if (currenttype==this.CHARTYPE_SEPARATOR) {
						outputnode=document.createTextNode("");
					} else {
						outputnode=document.createElement("span");
						if (nodeburned) {
							outputnode.setAttribute("id", inputnode.getAttribute("id"));
							nodeburned=true;
						} else {
							outputnode.setAttribute("id", "word-"+randomString(10));
						}
						outputnode.setAttribute("class", "word");
						outputnode.setAttribute("data-wordinputtime", "17.11");
						outputnode.setAttribute("data-wordpressure", "500");
					}
					previoustype=currenttype;
				}
				outputtext+=c;
			}
		} while (inputnode=inputnode.nextSibling);
		if (outputnode!=null) {
			outputnode.textContent=outputtext;
			outputline.insertBefore(outputnode, null);
			inputline.parentNode.replaceChild(outputline, inputline);

console.log("commited last word: "+outputtext);
		}
		
		/*
		do {
			if (currentnode.textContent=="" && line.childNodes.length>1)
				currentnode.parentNode.removeChild(nextnode);
		} while (currentnode=currentnode.nextSibling);
		
		// join adjacent #text nodes
		currentnode=line.firstChild;
		while (currentnode.nextSibling) {
			nextnode=currentnode.nextSibling;
			if (currentnode.nodeName=="#text" && nextnode.nodeName=="#text") {
				currentnode.textContent=currentnode.textContent+nextnode.textContent;
				nextnode.parentNode.removeChild(nextnode);
			}
		
			currentnode=currentnode.nextSibling;
		}*/
		
		
		
		a=1;
		
	};
	
	// emulate a classic textarea behavior by handling key events of multiple lines
	// even if it's more work, the advantage is we can display additional info for each line
	// (estimated timecode, number of character...)
	
	// keypressed is for control characters
	// we want to handle them before they are typed, sometime they need to be overridden
	$(document).keypress($.proxy(function(event) {
		// when not typing anything for a long time, do not count it as slow typing
		// might be we are playing speechless part or we caught up...
		switch (event.keyCode) {
		case KEY_ENTER:
			this.addline();
			event.preventDefault();
			break;
		case KEY_BACKSPACE:
			console.log("cp"+this.getCharPosition() + "/lc"+this.getLineCount());
			if (this.getCharPosition()==0 && this.getLineCount()>0) {
				this.removeline();
				event.preventDefault();
			}
			break;
		case KEY_UP:
			var lineposition=this.getLinePosition();
			if (lineposition==0)
				break;
			if (lineposition>0)
				$("#text .line:nth-child("+(lineposition)+") .textline").get(0).focus();
			else
				$("#text .line:first-child .textline").get(0).focus();
			event.preventDefault();
			break;
		case KEY_DOWN:
			var lineposition=this.getLinePosition();
			if (lineposition>=this.getLineCount()-1)
				break;
			if (lineposition>=0)
				$("#text .line:nth-child("+(lineposition+2)+") .textline").get(0).focus();
			else
				$("#text .line:last-child .textline").get(0).focus();
			event.preventDefault();
			break;

		case KEY_LEFT:
			var lineposition=this.getLinePosition();
			var charposition=this.getCharPosition();

			if (!document.activeElement) {
				$("#text .line:first-child .textline").get(0).focus();
				this.setCharPositionFirst();
				event.preventDefault();
				break;
			}
			if (lineposition==0 || charposition!=0)
				break;
			if (lineposition>0) {
				$("#text .line:nth-child("+(lineposition)+") .textline").get(0).focus();
				this.setCharPositionLast();
				event.preventDefault();
			}
			break;
		case KEY_RIGHT:
			var lineposition=this.getLinePosition();
			var charposition=this.getCharPosition();

			console.log("line"+lineposition+"/char:"+charposition);
			if (!document.activeElement) {
				$("#text .line:last-child .textline").get(0).focus();
				this.setCharPositionLast();
				event.preventDefault();
				break;
			}
			if (lineposition>=this.getLineCount()-1 || charposition!=this.getCharCount())
				break;
			if (lineposition>=0) {
				$("#text .line:nth-child("+(lineposition+2)+") .textline").get(0).focus();
				this.setCharPositionFirst();
				event.preventDefault();
			}
			break;
		}
	}, this));
	
	// keyup is for handling printable characters. Generally we want to process the text after they have been added
	$(document).keyup($.proxy(function(event) {
		// when not typing anything for a long time, do not count it as slow typing
		// might be we are playing speechless part or we caught up...
		this.format();
		
	}, this));
	
	// initialize with a first line
	this.addline();
}


Editor.prototype.constructor = Editor.constructor;
var editor=new Editor();