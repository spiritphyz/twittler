/** data_generator --------------------------------------------- */
// set up data structures
window.streams = {};
streams.home = [];
streams.users = {};
streams.users.shawndrost = [];
streams.users.sharksforcheap = [];
streams.users.mracus = [];
streams.users.douglascalhoun = [];
window.users = Object.keys(streams.users);

// utility function for adding tweets to our data structures
var addTweet = function(newTweet){
  var username = newTweet.user;
  streams.users[username].push(newTweet);
  streams.home.push(newTweet);
};

// utility function
var randomElement = function(array){
  var randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

// random tweet generator
var opening = ['just', '', '', '', '', 'ask me how i', 'completely', 'nearly', 'productively', 'efficiently', 'last night i', 'the president', 'that wizard', 'a ninja', 'a seedy old man'];
var verbs = ['drank', 'drunk', 'deployed', 'got', 'developed', 'built', 'invented', 'experienced', 'fought off', 'hardened', 'enjoyed', 'developed', 'consumed', 'debunked', 'drugged', 'doped', 'made', 'wrote', 'saw'];
var objects = ['my', 'your', 'the', 'a', 'my', 'an entire', 'this', 'that', 'the', 'the big', 'a new form of'];
var nouns = ['cat', 'koolaid', 'system', 'city', 'worm', 'cloud', 'potato', 'money', 'way of life', 'belief system', 'security system', 'bad decision', 'future', 'life', 'pony', 'mind'];
var tags = ['#techlife', '#burningman', '#sf', 'but only i know how', 'for real', '#sxsw', '#ballin', '#omg', '#yolo', '#magic', '', '', '', ''];

var randomMessage = function(){
  return [randomElement(opening), randomElement(verbs), randomElement(objects), randomElement(nouns), randomElement(tags)].join(' ');
};

// generate random tweets on a random schedule
var generateRandomTweet = function(){
  var tweet = {};
  tweet.user = randomElement(users);
  tweet.message = randomMessage();
  tweet.created_at = new Date();
  addTweet(tweet);
};

for(var i = 0; i < 10; i++){
  generateRandomTweet();
}

// Redefined in timers.js to capture timer ID
// var scheduleNextTweet = function(){
//   generateRandomTweet();
//   $('body').append('generated a tweet<br />');
//   setTimeout(scheduleNextTweet, Math.random() * 5000);
// };
// scheduleNextTweet();

// utility function for letting students add "write a tweet" functionality
// (note: not used by the rest of this file.)
var writeTweet = function(message){
  if(!visitor){
    throw new Error('set the global visitor property!');
  }
  var tweet = {};
  tweet.user = visitor;
  tweet.message = message;
  addTweet(tweet);
};

/** timers ----------------------------------------------------- */
var generateRandomTweetTimeoutID;
var updateTweetCounterID;

var counter = function(lastPosition) {
  return {
    get function() {
      return lastPosition;
    },
    set function(newPosition) {
      lastPosition = newPosition;
    }
  };
};

var updateTweetCounter = function() {
  var currHomeLen = streams.home.length;
  var counterDiff;
  var ending = '';
  var lastMsg = $('#liveCounter').html();

  if (currHomeLen > counter.lastPosition) {
    counterDiff = currHomeLen - counter.lastPosition;
    ending = counterDiff === 1 ? "tweet" : "tweets";
    $counter = $('#liveCounter');
    $counter.detach();
    $counter.text('Load ' + counterDiff + ' new ' + ending);
    if (!lastMsg) {
      $counter.fadeIn();
    }
    $('#tweetCounter').append($counter);
  }
  updateTweetCounterID = setTimeout(
    updateTweetCounter, 950
  );
};
updateTweetCounter();

var scheduleNextTweet = function(){
  generateRandomTweet();
  generateRandomTweetTimeoutID = setTimeout(
    scheduleNextTweet, Math.random() * 5000
  );
};
scheduleNextTweet();

// Stop the auto-generated tweets after 3 minutes
var cancelScheduleNextTweet = function() {
  setTimeout(function() {
    clearTimeout(generateRandomTweetTimeoutID);
  }, 180000);
};
cancelScheduleNextTweet();

// Stop the counter updates after 3 minutes
var cancelUpdateTweetCounter = function() {
  setTimeout(function() {
    clearTimeout(updateTweetCounterID);
  }, 190000);
};
cancelUpdateTweetCounter();

/* behavior ---------------------------------------------------- */
$(document).ready(function() {
  // Set up helper functions
  var clearWall = function() {
    $('#tweetWall').html('');
  };

  var tweetToWall = function() {
    var source = this.sourceStream;
    var tweet = this.tweetObj;
    var $tweetMsg;
    var $user, $userPic;
    var $tweetTime, relativeTime;
    var $tweetSection, $leftDiv, $rightDiv;

    // Print section at top of wall
    $tweetSection = $('<section></section>');
    $tweetSection.addClass('tweetContainer');
    $('#tweetWall').prepend($tweetSection);

    // Create left column
    $leftDiv = $('<div></div>');
    $leftDiv.addClass('left');

    // Print user picture
    $userPic = $('<canvas></canvas>');
    $userPic.addClass('userPic');
    $userPic.attr({
      'width': '90',
      'height': '90'
    });
    $userPic.jdenticon( md5(tweet.user) );
    $leftDiv.append($userPic);
    $leftDiv.append('<br />');

    // Print user
    $user = $('<a></a>');
    $user.attr({
      'href': '#',
      'user': tweet.user,
      'class': 'username'
    });
    $user.text('@' + tweet.user);
    $leftDiv.append($user);

    // Print posting date
    relativeTime = moment(tweet.created_at).fromNow();
    $tweetTime = $('<p></p>');
    $tweetTime.addClass('date');
    $tweetTime.text(relativeTime);
    $leftDiv.append($tweetTime);

    $tweetSection.append($leftDiv);

    // Create right column
    $rightDiv = $('<div></div>');
    $rightDiv.addClass('right');

    // Print message
    $tweetMsg = $('<div></div>');
    $tweetMsg.text(tweet.message);
    $tweetMsg.addClass('tweetMessage');
    $rightDiv.append($tweetMsg);

    // Update counter's last position
    counter.lastPosition = streams.home.length;

    $tweetSection.hide();
    $tweetSection.append($rightDiv);
    $tweetSection.fadeIn(800);
  };

  var printAllTweets = function(start, finish) {
    // Since tweetToWall() adds tweets at the top position,
    // this effectively shows tweets in reverse chronological order.
    var source = this.sourceStream;
    start = start || 0;
    finish = finish || source.length;

    for (var i = start; i < finish; i += 1) {
      this.tweetObj = source[i];
      this.tweetToWall();
    }
  };

  // Define parent class
  var MasterBird = {
    clearWall: clearWall,
    tweetToWall: tweetToWall,
    printAllTweets: printAllTweets
  };

  // Define child classes
  var userBird = Object.create(MasterBird);
  userBird.sourceStream = streams.home;

  var visitorBird = Object.create(MasterBird);
  streams.users.visitor = [];
  visitorBird.sourceStream = streams.users.visitor;

  // Print first wall of tweets
  userBird.printAllTweets();

  // Refresh new tweets counter
  $('#tweetCounter').on('click', '#liveCounter', function(event) {
    event.preventDefault();
    userBird.sourceStream = streams.home;
    userBird.printAllTweets(counter.lastPosition);
    $('#liveCounter').html('');
  });

  // Show tweets only from one user
  $('#tweetWall').on('click', '.username', function(event) {
    event.preventDefault();
    userBird.sourceStream = streams.users[ $(this).attr('user') ];
    userBird.clearWall();
    userBird.printAllTweets();
  });

  // Add tweets from all users
  $('#updateAllOnHeadline').on('click', function(event) {
    event.preventDefault();
    userBird.sourceStream = streams.home;
    $('#liveCounter').html('');
    userBird.clearWall();
    userBird.printAllTweets();
  });

  // Add tweets from visitor
  $('#postButton').on('click', function(event) {
    var tweet = {};
    tweet.user = 'visitor';
    tweet.message = $('#inputField').val();
    tweet.created_at = new Date();
    addTweet(tweet);

    event.preventDefault();
    visitorBird.tweetObj = streams.users.visitor[
      streams.users.visitor.length - 1
    ];
    visitorBird.tweetToWall();
    $('#inputField').val('');
  });

  // Clear input field
  $('#inputField').on('click', function(event) {
    event.preventDefault();
    $(this).val('');
  });
});