import 'babel-polyfill';

global.app = function () {

	// #people cycle
	let words = [
		'empathetic?',
		'genuine?',
		'open?',
		'curious?',
		'bold?'
	];
	let images = [
		'assets/img/empathetic.png',
		'assets/img/genuine.png',
		'assets/img/open.png',
		'assets/img/curious.png',
		'assets/img/bold.png'
	];
	let people = [
		['Teresa Ibarra', 'Frontend Developer', 'From San Francisco, US',],
		['Kei Yumino', 'Visual Designer', 'From Shizokuo, Japan'],
		['Nathalie Martin', 'Researcher', 'From Seattle, US',],
		['Sanghyun Lee', 'Researcher', 'From Seoul, Korea'],
		['Chloe Poulter', 'UX Designer', 'From London, UK'],
	];

	let i = 0;
	let people_cycle = null;

	let stopPeopleCycle = function() {
		clearInterval(people_cycle);
		people_cycle = null;
	}

	let startPeopleCycle = function() {
		if (people_cycle != null) {
			return;
		}
		people_cycle = setInterval(function() {
			i = (i + 1) % words.length;
			// background 
			$('#people').css("background-image", "url(" + images[i = (i + 1) % images.length] + ")");
			// character traits
			$('#swap-word').fadeOut(function() {
				$(this).html(words[i]);
			}).fadeIn();
			// people description
			$('#swap-name').fadeOut(function() {
				$(this).html(people[i][0]);
			}).fadeIn();
			$('#swap-role').fadeOut(function() {
				$(this).html(people[i][1]);
			}).fadeIn();
			$('#swap-loc').fadeOut(function() {
				$(this).html(people[i][2]);
			}).fadeIn();
		}, 3000);
	}


	// site navigation
	let pages = [       // array of pages
		'#maelstrom',
		'#overview',
		'#about',
		'#projects',
		'#people',
		'#apply'
	];

	let page_id = 0;						// current page index

	let scroll_time = new Date().getTime();	// last scroll timestamp
	let scroll_cooldown = 1000; 			// 1 seconds in between mousewheel events
	let arrow_cooldown = 500; 				// .5 seconds in between keydown events

	let scroll_count = 0;     				// scroll event counter
	let scroll_threshold = 30;				// minimum delta Y to register scroll event

	/**
	 * Switch to given page id
	 */
	let scrollPage = function(new_id) {
		if (new_id == page_id) return false;

		// people page switching
		if (new_id == 4) {
			startPeopleCycle();
		} else if (page_id == 4) {
			stopPeopleCycle();
		}

		let new_page = pages[new_id];
		let old_page = pages[page_id];
		let new_nav = $('#nav').children()[new_id];
		let old_nav = $('#nav').children()[page_id];

		$(new_nav).addClass('target');
		$(old_nav).removeClass('target');

		$(new_page).addClass('target');
		setTimeout(function(){
			$(old_page).removeClass('target');
		}, 100);

		page_id = new_id;
		scroll_count = 0;
		scroll_time = new Date().getTime();
	}

	/**
	 * Navs to next page
	 */
	let nextPage = function() {
		if (page_id < pages.length-1) {
			let new_id = page_id+1;
			scrollPage(new_id);
		}
	}

	/**
	 * Navs to prev page
	 */
	let prevPage = function() {
		if (page_id > 0) {
			let new_id = page_id-1;
			scrollPage(new_id);
		}
	}

	/**
	 * Checks if past cooldown
	 */
	let pastCooldown = function(cooldown) {
		let current_time = new Date().getTime();
		if ((current_time - scroll_time) < cooldown) return false;
		return true;
	}

	// scroll setup
	$('body').mousewheel(function(e) {
		// ignore smaller movements
		let scroll_value = e.deltaY;
		if (Math.abs(scroll_value) < scroll_threshold) return;

		// ignore if not past cooldown
		if (!pastCooldown(scroll_cooldown)) return;
		
		// scrolls
		if (scroll_value < 0) {
			nextPage();
		} else {
			prevPage();
		}
	});

	// arrow setup
	$('#arrow-link').click(function(e) {
		nextPage();
	});

	// nav setup
	$('.nav-link').click(function(e) {   
		e.preventDefault();
		let new_id = $('.nav-link').index($(this));
		scrollPage(new_id);
	});

	// key binding for up and down arrows
	$(document).keydown(function(e){
		if (!pastCooldown(arrow_cooldown)) return;

		if (e.keyCode == 38) {
			prevPage();
		} else if (e.keyCode == 40) {
			nextPage();
		}
	});
};

global.app();

