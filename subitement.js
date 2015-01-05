var video = $("#video")[0];
video.playbackRate= 0.5;
video.defaultPlaybackRate= 0.5;

var KEY_BACKSPACE=8;
var KEY_PAGEDOWN=34;
var KEY_PAUSE=19;
var KEY_ENTER=13;

var KEY_LEFT=37;
var KEY_UP=38;
var KEY_RIGHT=39;
var KEY_DOWN=40;

var KEY_F2=113;
var KEY_F3=114;
var KEY_F4=115;


function evaluatePressure() {
	if (!video.paused) {
		if (bscriterion.getPressure()+speedcriterion.getPressure()>10000) {
			video.pause();
		}
	}
}


text.keydown(function(event) {
	switch (event.which) {
		case KEY_PAGEDOWN:
		case KEY_F4:
			if (video.paused) {
				video.play();
			}
			return false;
		case KEY_PAUSE:
		case KEY_F3:
			if (!video.paused) {
				video.pause();
			}
			return false;
	}
});