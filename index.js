const input = document.getElementById("inputValue");
const postDiv = document.getElementById("post");
const container = document.getElementById("container");
const loader = document.getElementById("loader");
let elem = document.getElementById('reset_timer');

let query = "";
let page = 1;
let isLoading = true;
let isNewQuery = true;
let timerId;
let throttleTimer;
let timeLeft = 30;

//Check query params 
window.onload = () => {
    input.value = "reactjs";
    query = "reactjs";

    let searchState = window.location.search.split("=");
    if (window.location.search.includes("query") && searchState.length > 0) {
        input.value = searchState[1];
        query = searchState[1];
    }

    fetchNews();

}

const debounceFunction = function (func, delay) {
    // Cancels the setTimeout method execution
    clearTimeout(timerId)

    // Executes the func after delay time.
    timerId = setTimeout(func, delay)
}


// Throttle function: Input as function which needs to be throttled and delay is the time interval in milliseconds
const throttleFunction = function (func, delay) {

    // If setTimeout is already scheduled, no need to do anything
    if (throttleTimer) {
        return
    }
    // Schedule a setTimeout after delay seconds
    throttleTimer = setTimeout(function () {
        func();

        // Once setTimeout function execution is finished, throttleTimer = undefined so that in <br>
        // the next scroll event function execution can be scheduled by the setTimeout
        throttleTimer = undefined;
    }, delay)
}

const countdown = () => {
    if (timeLeft == 0) {
        // clearTimeout(refreshTimerId);
        isNewQuery = null; //just refresh
        fetchNews();
    } else {
        elem.innerHTML = "Auto refresh in " + timeLeft + ' seconds';
        timeLeft--;
    }
}

const refreshTimerId = setInterval(countdown, 1000);



//Create dynamic div
const mapArticleData = (articleArray) => {
    return (
        articleArray.map(article => {
            return (
                `<div class='grid-item' >
						<div class='image-wrapper'>
							<img 
								src=${article.urlToImage ? article.urlToImage : 'https://www.seattlefish.com/wp-content/themes/seattlefish/img/placeholder.png'}
								class='grid-image'
							/>
						</div>
						<div class="pl-1">
							<div class='grid-title'>
								<p>${article.title}</p>
							</div>
							<div>
								<p>${article.author ? article.author : ''}</p>
                            </div>
                            
						</div>
					</div>`
            )
        })
    )
}


//Fetch news
const fetchNews = () => {
    if (input.value !== query.trim()) return; //return if try to run empty space
    isLoading = true;
    timeLeft = 30;
    container.style.opacity = "0.5";
    loader.style.visibility = "visible";
    //update page if its come from throttle
    if (isNewQuery === false) {
        page++;
    }
    const url = `https://newsapi.org/v2/everything?q=${input.value}&apiKey=363d26dd3d664d199ca63adc371e22aa&pageSize=10&page=${page}`;
    fetch(url)
        .then(
            function (response) {
                isLoading = false;
                container.style.opacity = "1";
                loader.style.visibility = "hidden";
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                    postDiv.innerHTML = "";
                    response.json().then(data => {
                        postDiv.innerHTML = data.message;
                    })

                    return;
                }

                // Examine the text in the response
                response.json().then(function (data) {
                    countdown();
                    const { articles } = data;
                    if (isNewQuery) {
                        postDiv.innerHTML = "";
                    }
                    if (articles.length === 0) {
                        postDiv.innerHTML = "No result found";
                        return;
                    }
                    const postArray = mapArticleData(articles);
                    postDiv.innerHTML += postArray.join('') || " ";
                });
            }
        )
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
        });
}



//HandleScroll function
const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        isNewQuery = false;
        throttleFunction(fetchNews, 300)
    }
}
//All event listener
window.addEventListener("scroll", handleScroll);

//Track input change
input.addEventListener('keyup', function () {
    isNewQuery = true;
    query = input.value;
    debounceFunction(fetchNews, 100)
});
