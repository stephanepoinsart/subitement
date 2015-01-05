/*
 * manage the video playing rhythm by determining if the author is under pressure or not
 */

function AbstractCriterion() {
	this.pressure=0;
	if (!this.name)
		this.name="AbstractCriterion";
	$("#criterionDebug").append("<div class=\"criterionLine\">"+this.name+": <span id=\""+this.name+"CriterionDisplay\"></span></div>");
	
	
	this.getPressure=function() {
		return this.pressure;
	};
	
	this.resetPressure=function() {
		this.pressure=0;
	};
	
	this.display=function() {
		$("#"+this.name+"CriterionDisplay").text(Math.round(this.pressure));
	};
};

/**
 * BSCriterion : monitor backspace pressure
 */
 
function BSCriterion() {
	this.name="Backspace";
	AbstractCriterion.call(this);
	
	$("#text").keydown($.proxy(function(event) {
		var pvalue;
		//console.log("keydown: "+ event.which);
		if (event.which==KEY_BACKSPACE) {
			pvalue=1500;
		} else {
			if (video.paused) {
				pvalue=this.pressure/15;
			} else {
				pvalue=this.pressure/8;
			}
		}
		this.pressure=(this.pressure+pvalue)*0.85-10;
		if (this.pressure<0)
			this.pressure=0;
		evaluatePressure();
		this.display();
	}, this));
}

/*
BSCriterion.prototype = Object.create(AbstractCriterion.prototype);
BSCriterion.prototype.constructor = BSCriterion.constructor;
*/
/**
 * RegularPauseCriterion : Ensure at least 1 low pressure time every 6 seconds of video
 */
function RegularPauseCriterion() {
	this.name="Time";
	AbstractCriterion.call(this);
	this.lastlowpressure=video.currentTime;
	
	/*var interval=*/setInterval($.proxy(function() {
		if (this.lastlowpressure+10<video.currentTime && bscriterion.getPressure()+speedcriterion.getPressure()>1000) {
			this.pressure=10000;
			evaluatePressure();
			this.display();
			this.pressure=0;
		} else {
			this.display();
		}
	}, this),500);
	$("video").on("seeked", $.proxy(function(event) {
		this.lastlowpressure=video.currentTime;
	}, this));
	$("video").on("play", $.proxy(function(event) {
		this.lastlowpressure=video.currentTime;
	}, this));
}
/*
RegularPauseCriterion.prototype = Object.create(AbstractCriterion.prototype);
RegularPauseCriterion.prototype.constructor = RegularPauseCriterion.constructor;
*/


/**
 * SpeedCriterion : if you type too slow, pause the video
 */
function SpeedCriterion() {
	this.name="Speed";
	AbstractCriterion.call(this);
	this.lastlowpressure=video.currentTime;
	this.lowpressurechars=text.text().length;
	this.requiredcps=30;
	this.lastactivity=0;
	this.totalinactivity=0;

	
	/*var interval=*/setInterval($.proxy(function() {
		var duration=video.currentTime-this.lastlowpressure-this.totalinactivity;
		if (video.currentTime-this.lastactivity>1) {
			duration-=video.currentTime-this.lastactivity;
		}
		var chardelay=(duration*this.requiredcps)-text.text().length+this.lowpressurechars;
		console.log("cd: "+Math.round(chardelay)+" / len now:"+text.text().length + "/ len low:"+this.lowpressurechars+"/"+text.text());
		if (chardelay>12) {
			this.pressure=(chardelay-12)*100;
		} else {
			this.pressure=0;
		}
		evaluatePressure();
		this.display();
	}, this),500);
	$("video").on("seeked", $.proxy(function(event) {
		this.lastlowpressure=this.lastactivity=video.currentTime;
		this.lowpressurechars=text.text().length;
		this.pressure=0;
		this.totalinactivity=0;
	}, this));
	$("video").on("play", $.proxy(function(event) {
		this.lastlowpressure=this.lastactivity=video.currentTime;
		this.lowpressurechars=text.text().length;
		this.pressure=0;
		this.totalinactivity=0;
	}, this));
	$("#text").keydown($.proxy(function(event) {
		// when not typing anything for a long time, do not count it as slow typing
		// might be we are playing speechless part or we caught up...
		if (video.currentTime-this.lastactivity>1) {
			this.totalinactivity=video.currentTime-this.lastactivity;
		}
		this.lastactivity=video.currentTime;
	}, this));
	

}
/*
SpeedCriterion.prototype = Object.create(AbstractCriterion.prototype);
SpeedCriterion.prototype.constructor = SpeedCriterion.constructor;



// instances
var text = $("#text");

var bscriterion=new BSCriterion();
var regularpausecriterion=new RegularPauseCriterion();
var speedcriterion=new SpeedCriterion();
*/