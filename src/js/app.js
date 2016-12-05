import 'babel-polyfill';

global.app = function () {

	let page_id = 0;							// current page index
	let page = [      							// array of page
		'#maelstrom',
		'#overview',
		'#about',
		'#projects',
		'#people',
		'#apply'
	];

	let people_id = 0;
	let people_cycle = null;
	let people_bg = [
		'assets/img/empathetic.png',
		'assets/img/genuine.png',
		'assets/img/open.png',
		'assets/img/curious.png',
		'assets/img/bold.png',
	];
	
	let scroll_cooldown = 1000; 								// 1 second cooldown for mousescroll
	let scroll_threshold = 30;									// ignore smaller scroll events
	let page_cooldown = 700; 									// .7 second cooldown for default page
	let page_last_ts = new Date().getTime()-page_cooldown;		// last scroll timestamp

	/**
	 * CSS preload #people cycle images
	 */
	let preloadPeopleBgs = function() {
		let background = "";
		for (let i = 0; i < people_bg.length; i++) background += "url("+people_bg[i]+"),";
		background = background.slice(0, -1);
		$('#people-preload').css("background-image", background);
	}

	/**
	 * Call function after page loads
	 * Simon Willison's addLoadEvent
	 * http://blog.simonwillison.net/post/57956760515/addloadevent
	 */
	let addLoadEvent = function(func) {
		let oldonload = window.onload;
		if (typeof window.onload != 'function') {
			window.onload = func;
		} else {
			window.onload = function() {
				if (oldonload) {
					oldonload();
				}
				func();
			}
		}
	}

	/**
	 * CSS preload after page load
	 */
	addLoadEvent(preloadPeopleBgs);

	/**
	 * Stop interval for #people page
	 */
	let stopPeopleCycle = function() {
		clearInterval(people_cycle);
		people_cycle = null;
	}

	/**
	 * Start interval for #people page
	 */
	let startPeopleCycle = function() {
		if (people_cycle != null) return;

		people_cycle = setInterval(function() {
			$(".swap-elem:nth-child("+(people_id+1)+")").toggleClass('target');
			people_id = (people_id + 1) % people_bg.length;
			$('#people').css("background-image", "url(" + people_bg[people_id] + ")");
			$(".swap-elem:nth-child("+(people_id+1)+")").toggleClass('target');
		}, 3000);
	}

	/**
	 * Navs to next page
	 */
	let nextPage = function() {
		if (page_id < page.length-1) {
			let new_id = page_id+1;
			goToPage(new_id);
		}
	}

	/**
	 * Navs to prev page
	 */
	let prevPage = function() {
		if (page_id > 0) {
			let new_id = page_id-1;
			goToPage(new_id);
		}
	}

	/**
	 * Checks if past cooldown
	 */
	let isPageCooldown = function(cooldown_ts) {
		let current_ts = new Date().getTime();
		if ((current_ts - page_last_ts) < cooldown_ts) return false;
		return true;
	}

	/**
	 * Switch to given page id
	 */
	let goToPage = function(new_id) {
		if (new_id == page_id) return false;

		// #people page init
		if (new_id == 4) {
			startPeopleCycle();
		} else if (page_id == 4) {
			stopPeopleCycle();
		}

		let new_page = page[new_id];
		let old_page = page[page_id];
		let new_nav = $('#nav').children()[new_id];
		let old_nav = $('#nav').children()[page_id];

		// Nav bar
		$(new_nav).addClass('target');
		$(old_nav).removeClass('target');

		// Nasty page transition logic
		// page IN transition is slower, page OUT transition is faster
		// Accomplishes this by using intermediate class called 'old-target'
		$(old_page).addClass('old-target'); 		// Make old page text fade away quickly, background stays to avoid flash
		$(new_page).addClass('target');				// New page begins to fade in slowly
		setTimeout(function() {						// After new page completely faded in, reset old page classes
			$(old_page).removeClass('target');
			$(old_page).removeClass('old-target');
		}, page_cooldown);

		// update scroll globals
		page_id = new_id;
		page_last_ts = new Date().getTime();
	}

	/**
	 * Event for mouse scrolling
	 */
	$('body').mousewheel(function(e) {
		let scroll_value = e.deltaY;
		if (!isPageCooldown(scroll_cooldown) || scroll_value>scroll_threshold) return; // ignore if on cooldown or if too small
		
		if (scroll_value < 0) {
			nextPage();
		} else {
			prevPage();
		}
	});

	/**
	 * Event for keyboard scrolling
	 */
	$(document).keydown(function(e){
		if (!isPageCooldown(page_cooldown)) return; // ignore if on cooldown

		if (e.keyCode == 38) {
			prevPage();
		} else if (e.keyCode == 40) {
			nextPage();
		}
	});

	/**
	 * Landing page arrow listener
	 */
	$('#arrow-link').click(function(e) {
		nextPage();
	});

	/**
	 * Nav bar listener
	 */
	$('.nav-link').click(function(e) {   
		if (!isPageCooldown(page_cooldown)) return;  // ignore if on cooldown

		e.preventDefault();
		let new_id = $('.nav-link').index($(this));
		goToPage(new_id);
	});

	if (Hammer) {
		let element = document.getElementById('body');
		let hammertime = new Hammer(element);
		hammertime.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
		hammertime.on('swipeup', function(e) {
			console.log(1);
			nextPage();
		});
		hammertime.on('swipedown', function(e) {
			console.log(2);
			prevPage();
		});
	}
};

global.app();

