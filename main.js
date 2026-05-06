// A1: 500 words, fre: 0.002  || A2: 1000 words, fre: 0.001 || B1: 2000 word, fre: 0.0005 
// || B2: 4000, fre: 0.0002 || C1: 8000, fre: 0.000077 || C2: All
import data from './data.json' with { type: 'json' };

const NIVEAU = Object.freeze({ // Level Enum
    A1: 0.002,
    A2: 0.001,
    B1: 0.0005,
    B2: 0.0002,
    C1: 0.000077,
    C2: 0.00002
});

const MODE = Object.freeze({ // Mode Enum
    ARTICLE: 0,
    PLURAL: 1,
    BOTH: 2
});

const TIMER = Object.freeze({
    NO_TIMER: false,
    TIMER: true
});

let scoreArticle = 0;
let scorePlural = 0;
let word_fre = NIVEAU.A1;
let drill_mode = MODE.ARTICLE;
let enable_timer = TIMER.NO_TIMER;
let ongoing = false, submitted = false;
let filtered = Object.values(data);
transition_ui(false);

document.getElementById("mySubmit").onclick = function() { 
    if (ongoing) { submitted = true }

}
document.getElementById("articleInputBox").addEventListener("keypress", function(event) {
    if (event.key === "Enter" && ongoing) { submitted = true }
});
document.getElementById("pluralInputBox").addEventListener("keypress", function(event) {
    if (event.key === "Enter" && ongoing) { submitted = true }
});

document.getElementById("startButton").onclick = function() {
    ongoing = true;
    driller();
    
} //Refresh page

document.getElementById("resetButton").onclick = function() {
    ongoing = false
    transition_ui(false);
} 

const dropdownLevel = document.getElementById("dropdownLevel");
const optionsLevel = document.getElementById("optionsLevel");
const optionsMode = document.getElementById("optionsMode");
const optionsTimer = document.getElementById("optionsTimer");
const dropdownItems = document.querySelectorAll(".menu-item");

// Toggle dropdown menu visibility
dropdownLevel.addEventListener("click", () => {
    if (optionsLevel.style.display === "block") {
        optionsLevel.style.display = "none";
    } else {
        optionsLevel.style.display = "block";
    }
});

document.getElementById("dropdownMode").addEventListener("click", () => {
    if (optionsMode.style.display === "block") {
        optionsMode.style.display = "none";
    } else {
        optionsMode.style.display = "block";
    }
});

document.getElementById("dropdownTimer").addEventListener("click", () => {
    if (optionsTimer.style.display === "block") {
        optionsTimer.style.display = "none";
    } else {
        optionsTimer.style.display = "block";
    }
});

// Update the dropdown text and close the menu on item click
dropdownItems.forEach((item) => {
    item.addEventListener("click", () => {
        optionsLevel.style.display = "none";
        optionsMode.style.display = "none";
        optionsTimer.style.display = "none";
    });
});

// Close dropdown menu if clicked outside
document.addEventListener("click", (event) => {
    if (!event.target.closest(".dropdownLevelDiv")) {
        optionsLevel.style.display = "none";
    }
    if (!event.target.closest(".dropdownModeDiv")) {
        optionsMode.style.display = "none";

    }
    if (!event.target.closest(".dropdownTimerDiv")) {
        optionsTimer.style.display = "none";
    }
});


document.getElementById("niveau-a1").onclick = function() {
    document.getElementById("dropdownLevel").textContent = "Level: A1";
    word_fre = NIVEAU.A1
}
document.getElementById("niveau-a2").onclick = function() {
    document.getElementById("dropdownLevel").textContent = "Level: A2";
    word_fre = NIVEAU.A2
}
document.getElementById("niveau-b1").onclick = function() {
    document.getElementById("dropdownLevel").textContent = "Level: B1";
    word_fre = NIVEAU.B1
}
document.getElementById("niveau-b2").onclick = function() {
    document.getElementById("dropdownLevel").textContent = "Level: B2";
    word_fre = NIVEAU.B2
}
document.getElementById("niveau-c1").onclick = function() {
    document.getElementById("dropdownLevel").textContent = "Level: C1";
    word_fre = NIVEAU.C1
}
document.getElementById("niveau-c2").onclick = function() {
    document.getElementById("dropdownLevel").textContent = "Level: C2";
    word_fre = NIVEAU.C2
}

document.getElementById("mode-article").onclick = function() {
    document.getElementById("dropdownMode").textContent = "Mode: Article";
    drill_mode = MODE.ARTICLE;
}
document.getElementById("mode-plural").onclick = function() {
    document.getElementById("dropdownMode").textContent = "Mode: Plural";
    drill_mode = MODE.PLURAL;
}
document.getElementById("mode-both").onclick = function() {
    document.getElementById("dropdownMode").textContent = "Mode: Both";
    drill_mode = MODE.BOTH;
}

document.getElementById("timer-disable").onclick = function() {
    document.getElementById("dropdownTimer").textContent = "Timer: Disabled";
    enable_timer = TIMER.NO_TIMER;
}
document.getElementById("timer-enable").onclick = function() {
    document.getElementById("dropdownTimer").textContent = "Timer: Enabled";
    enable_timer = TIMER.TIMER;
}

//Countdown timer
var secondsLeft = 30, secondsDisplayed, minutesDisplayed;
var timerId;
modifyTimer(0); //Initialize Timer UI
    
function countdown() {
    if (secondsLeft == 0) { 
        let text = "";
        if (drill_mode != 1) { text += `${dict_to_article(filtered[rand_i]["gender"])} ${filtered[rand_i]["lemma"]}`}
        if (drill_mode == 2) { text += ' | '; }
        if (drill_mode > 0) { text += `die ${filtered[rand_i]["cases"]["nominative"]["plural"]}` }

        document.getElementById("currentWordDisplay").textContent = text;
        
        document.getElementById("errorDisplay").textContent = "Game Over! Good job. You're doing well.";
        document.getElementById("articleInputBox").style.display = "none";
        document.getElementById("pluralDiv").style.display = "none";
        document.getElementById("mySubmit").style.display = "none";
        ongoing = false; 
        
    }
    else { modifyTimer(-1); }
}

function modifyTimer(time) {
    secondsLeft += time;
    //Refresh timer UI
    minutesDisplayed = (Math.floor(secondsLeft / 60)).toString();
    secondsDisplayed = (secondsLeft % 60).toString();
    if (secondsDisplayed < 10) { secondsDisplayed = `0${secondsDisplayed}` }
    document.getElementById("timer").innerHTML = minutesDisplayed + ":" + secondsDisplayed;
}

let rand_i = 0;

async function driller() {
    transition_ui(true);
    scoreArticle = 0, scorePlural = 0

    filtered = Object.values(data).filter(item => item["frequency"] > word_fre).filter(item => item["translations"]["en"] != "");

    if(enable_timer === TIMER.TIMER) {
        secondsLeft = 30
        document.getElementById("timer").style.display = "block";
        clearTimeout(timerId);
        timerId = setInterval(countdown, 1000);
        document.getElementById("timer").innerHTML = minutesDisplayed + ":" + secondsDisplayed;
    }

    if (drill_mode == MODE.ARTICLE) {
        document.getElementById("scoreDisplay").textContent = `${scoreArticle}`;
        document.getElementById("articleInputBox").style.display = "block";
    } else if (drill_mode == MODE.PLURAL) {
        document.getElementById("scoreDisplay").textContent = `${scorePlural}`;
        document.getElementById("pluralDiv").style.display = "block";
    } else {
        document.getElementById("scoreDisplay").textContent = `A:${scoreArticle} | P:${scorePlural}`;
        document.getElementById("articleInputBox").style.display = "block";
        document.getElementById("pluralDiv").style.display = "block";
    }

    while(ongoing) {
        rand_i = Math.floor(Math.random() * filtered.length); // Find a random word
        
        let helper_article = "";
        if (drill_mode == MODE.PLURAL) { 
            helper_article = dict_to_article(filtered[rand_i]["gender"]); 
            document.getElementById("pluralInputBox").focus();
        } else {
            document.getElementById("articleInputBox").focus();
        }
        document.getElementById("translations").textContent = filtered[rand_i]["translations"]["en"][0];
        document.getElementById("currentWordDisplay").textContent = `${helper_article} ${filtered[rand_i]["lemma"]}`;
        
        await waitUserInput();
        submitted = false;

        let final_text = "";
        
        // Check answers
        if ((document.getElementById("articleInputBox").value).toLowerCase().trim() === dict_to_article(filtered[rand_i]["gender"])) {
            modifyTimer(2);
            scoreArticle++;
        } else {
            if (drill_mode != 1) { final_text += `${dict_to_article(filtered[rand_i]["gender"])} ${filtered[rand_i]["lemma"]}`}
            if (drill_mode == 2) { final_text += ' | '; }
        }

        if ((document.getElementById("pluralInputBox").value).toLowerCase().trim() === (filtered[rand_i]["cases"]["nominative"]["plural"]).toLowerCase()) {
            modifyTimer(5);
            scorePlural++;
        } else {
            if (drill_mode > 0) { final_text += `die ${filtered[rand_i]["cases"]["nominative"]["plural"]}` }
        }

        
        document.getElementById("errorDisplay").textContent = final_text;
        
        document.getElementById("articleInputBox").value = "";
        document.getElementById("pluralInputBox").value = "";
        if (drill_mode == MODE.ARTICLE) {
        document.getElementById("scoreDisplay").textContent = `${scoreArticle}`;
        } else if (drill_mode == MODE.PLURAL) {
            document.getElementById("scoreDisplay").textContent = `${scorePlural}`;
        } else {
            document.getElementById("scoreDisplay").textContent = `A:${scoreArticle} | P:${scorePlural}`;
        }
    }
}

 

function transition_ui(ingame) { // Show and    
    if (ingame === true) {
        document.getElementById("startButton").style.display = "none";
        document.getElementById("dropdownLevel").style.display = "none";
        document.getElementById("dropdownMode").style.display = "none";
        document.getElementById("dropdownTimer").style.display = "none";
        document.getElementById("title").style.display = "none";

        document.getElementById("scoreDisplay").style.display = "block";
        document.getElementById("currentWordDisplay").style.display = "block";
        document.getElementById("errorDisplay").style.display = "block";

        document.getElementById("mySubmit").style.display = "block";
        document.getElementById("resetButton").style.display = "block";
    }
    else {
        
        document.getElementById("startButton").style.display = "block";
        document.getElementById("dropdownLevel").style.display = "block";
        document.getElementById("dropdownMode").style.display = "block";
        document.getElementById("dropdownTimer").style.display = "block";
        document.getElementById("title").style.display = "block";

        document.getElementById("scoreDisplay").style.display = "none";
        document.getElementById("currentWordDisplay").style.display = "none";
        document.getElementById("articleInputBox").style.display = "none";
        document.getElementById("pluralDiv").style.display = "none";
        document.getElementById("mySubmit").style.display = "none";
        document.getElementById("resetButton").style.display = "none";
        document.getElementById("timer").style.display = "none";
        document.getElementById("errorDisplay").style.display = "none";
    }
}


// -------------- Helpers --------------

function dict_to_article(dict_gender) {
    switch (dict_gender) {
        case "m": return "der"; break;
        case "f": return "die"; break;
        case "n": return "das"; break;
        default: console.log("Something has gone very wrong."); return "der"; break;
    }
}


async function waitUserInput() {
    while (submitted === false) await timeout(50)
}

async function timeout(ms) {
    return new Promise(res => setTimeout(res, ms))
}
