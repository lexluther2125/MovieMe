var catBtns = [];
var netflixCategories = [];
var sortedList = [];
var choice = [];
var randomMovie = "";
var movieChoice = "";
var movieInfo = "";
var btnselection = "";
var netflixResponse = [];
var moviePicked = "";

$(document).ready(function() {

    GrabUrlFromStorage();

    var config = {
        apiKey: "AIzaSyDdSc475_ROupGHmwtJupWsAsBfrmBgyYs",
        authDomain: "netflix-project.firebaseapp.com",
        databaseURL: "https://netflix-project.firebaseio.com",
        projectId: "netflix-project",
        storageBucket: "",
        messagingSenderId: "243336765650"
    };
    firebase.initializeApp(config);
    var database = firebase.database();

    grabSearch(movieChoice);

    $("#clickBtn").on("click", function() {
        event.preventDefault();
        var inputGenerated = $("#generated").val();
        var movieTitle = "https://netflixroulette.net/api/api.php?actor=" + inputGenerated;

        if (movieTitle !== '' || typeof movieTitle !== 'undefined') {
            $.ajax({
                url: movieTitle,
                method: "GET"
            }).done(function(response) {
                netflixResponse = response;
                netflixCategories = [];

                console.log(response);

                //loop over the netflix objects to grab and store the categories
                for (var i = 0; i < response.length; i++) {
                    netflixCategories.push(response[i].category);
                }

                $.each(netflixCategories, function(i, el) {
                    if ($.inArray(el, sortedList) === -1) sortedList.push(el);
                });

                if (sortedList.length > 0) {

                    renderButtons(sortedList);
                    //render the category buttons
                }
            }).fail(function() {
                ShowSnackBar(); // show error message
            });
        }

    });

    // Snackbar
    function ShowSnackBar() {
        var x = document.getElementById("snackbar")
        x.className = "show";
        setTimeout(function() { x.className = x.className.replace("show", ""); }, 3000);
    }

    function GetChoice(category) {

        var choices = $.grep(netflixResponse, function(movie, index) {

            //change sorted list to whatever the front-end input is.
            return movie.category == category[0].innerText;
        });

        return choices;
    }

    //Find movie by url
    function GetMovie(url, movie) {
        $.ajax({
            url: url,
            method: "GET"
        }).done(function(response) {
            console.log(response);

            if (response.Response !== 'False') {

                var dib = $("")

                $("#actor-info").html("Actors: " + response.Actors);
                $("#plot").html("Plot: " + response.Plot);
                $(".artwork").attr("src", response.Poster);
                $(".rating").html("Rated: " + response.Rated);
                $(".movie-name").html(response.Title);
                $("#release-date").html("Released: " + response.Released);
                $("#runtime").html("Runtime: " + response.Runtime);
                $("#director-info").html("Director: " + response.Director);
                $("#rotten-score").html(response.Ratings[1].Value);
                $("#imdb-score").html(response.Ratings[0].Value);
            } else {
                $("#error").html("This movie information is unavailable! We have generated a trailer for your viewing pleasure!");
            }
            //alert the user if you want
        });

        console.log(movieChoice);

        $.ajax({
            url: "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + movieChoice + " trailer" + "&key=AIzaSyB8g6i8y1SPFbIcJw9flTwk7VEFXYWA5MY",
            context: document.body
        }).done(function(response) {
            console.log(response);

            var videoId = response.items[1].id.videoId;


            var embedCode = "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/" + videoId + "\" frameborder=\"0\" allowfullscreen></iframe>";

            console.log(embedCode);

            $('#trailer').html(embedCode);
        });
    }

    //Function which creates the buttons
    function renderButtons(sortedList) {

        // Deleting the movies prior to adding new movies
        // (this is necessary otherwise you will have repeat buttons)
        //$("#clickBtn").hide()

        // Looping through the array of movies
        for (var i = 0; i < sortedList.length; i++) {
            // Then dynamicaly generating buttons for each movie in the array
            // This code $("<button>") is all jQuery needs to create the beginning and end tag. (<button></button>)

            var a = $("<button>");
            // Adding a class of movie to our button

            a.text(sortedList[i]);

            switch (sortedList[i]) {
                case "Action & Adventure":
                    sortedList[i] = "Action"
                    break;
                case "Independent Movies":
                    sortedList[i] = "Independent"
                    break;
                case "TV Shows":
                    sortedList[i] = "TV"
                    break;
                case "Foreign Movies":
                    sortedList[i] = "Foreign"
                    break;
                case "Cult Movies":
                    sortedList[i] = "Cult"
                    break;
                case "Faith & Spirituality":
                    sortedList[i] = "Faith"
                    break;
                case "Children & Family Movies":
                    sortedList[i] = "Family"
                    break;
                case "Classic Movies":
                    sortedList[i] = "Classic"
                    break;
                case "Oscar-winning Movies":
                    sortedList[i] = "Oscar"
                    break;
                case "Romantic Movies":
                    sortedList[i] = "Romantic"
                    break;
                case "Sci-Fi & Fantasy":
                    sortedList[i] = "Fantasy"
                    break;
                case "Horror Movies":
                    sortedList[i] = "Horror"
                default:
                    sortedList[i] = sortedList[i];
            }

            a.addClass(sortedList[i]);

            // Adding a data-attribute
            a.attr("data-name", sortedList[i]);
            // Providing the initial button text

            // Adding the button to the buttons-view div
            $("#select").html("Select a Genre");
            $("#buttons-view").append(a);

            catBtns.push(a);
        }

        //
        for (var i = 0; i < catBtns.length; i++) {

            //when you click one of the category buttons
            $("body").on("click", "." + catBtns[i][0].className, function(event) {

                //category that was selected
                var category = $(event.target);

                //pass category into the get movie choice function
                var movies = GetChoice(category);

                console.log(movies);

                // highlight the button
                $(this).toggleClass('clicked');

                //now choose a movie at random
                var selectedMovieUrl = GetMovieRandom(movies);

                //SESSION STORAGE THE URL
                localStorage.setItem("movieURL", selectedMovieUrl);


                // now lets really go get that shit
                GetMovie(selectedMovieUrl);

                $("#movieMeBtn").show();
            });

        }
    }

    //chooses a random movie
    function GetMovieRandom(movies) {

        var random = Math.floor((Math.random() * movies.length) + 1);

        randomMovie = movies[random - 1];

        movieChoice = randomMovie.show_title;

        var removeSpaces = "https://www.omdbapi.com/?t=" + movieChoice + "&apikey=40e9cece";

        sendSearchDB(movieChoice);

        //SESSION STORAGE THE URL
        localStorage.setItem("movie", movieChoice);

        movieInfo = encodeURI(removeSpaces);

        return movieInfo;

    }
    //
    function GrabUrlFromStorage() {

        var movieUrl = localStorage.getItem("movieURL");
        movieChoice = localStorage.getItem("movie");

        console.log(movieChoice);

        if (movieUrl !== null && typeof movieUrl !== "undefined") {
            // this where your get movie call should go
            GetMovie(movieUrl);
        }

        localStorage.removeItem("movieURL");
        //localStorage.removeItem("movie");
    }

    //firebase call for last searches
    function sendSearchDB(selection) {


        console.log(selection);

        database.ref().push({
            movieName: selection
        });
    }

    function grabSearch() {

        database.ref().orderByChild("dateAdded").limitToLast(10).on("child_added", function(childResponse, prevChildKey) {
            console.log(childResponse);

            moviePicked = childResponse.val().movieName;
            console.log(moviePicked);
            $("#previous").prepend("<tr><td>" + moviePicked + "</td></td");
        });
    }

});
