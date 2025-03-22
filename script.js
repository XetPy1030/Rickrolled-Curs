function startJumpingText({
    elementId,
    maxDelay = 1,
    maxDuration = 1,
}) {
    const text = document.getElementById(elementId);
    const letters = text.textContent.split("");

    text.textContent = "";

    letters.forEach((letter, index) => {
        const span = document.createElement("span");
        span.textContent = letter;
        span.classList.add("jumping-letter");

        // Добавляем случайную задержку для каждой буквы
        span.style.animationDelay = `${Math.random() * maxDelay}s`;

        // Добавляем случайное изменение скорости анимации
        span.style.animationDuration = `${0.5 + Math.random() * maxDuration}s`;

        text.appendChild(span);
    });
}

function randomFlicker() {
    const randomTime = Math.random() * 1000; // Случайное время между 0 и 1000 мс
    const randomOpacity = Math.random() * 0.5 + 0.5; // Случайная прозрачность между 0.5 и 1

    const light = document.getElementById("game-screen");
    light.style.opacity = randomOpacity;

    setTimeout(randomFlicker, randomTime);
}

document.getElementById("startButton").addEventListener("click", function () {
    const backgroundMusic = document.getElementById("backgroundMusic");
    backgroundMusic.play().then(() => {
        document.getElementById("startButton").classList.add("hidden");


        setTimeout(() => {
            document.getElementById("start-screen").style.display = "none";
            const gameScreen = document.getElementById("game-screen");
            gameScreen.style.display = "block";

            startJumpingText({
                elementId: "welcome-text",
                maxDelay: 1,
                maxDuration: 1,
            });

            randomFlicker();
        }, 3000);
    });
});

document.getElementById("curseButton").addEventListener("click", function () {
    const smehMusic = document.getElementById("smehMusic");
    smehMusic.play();

    const candleMusic = document.getElementById("candleMusic");
    candleMusic.play();

    // Скрываем кнопку и показываем "ритуал"
    document.getElementById("curseButton").style.display = "none";
    document.getElementById("ritual").style.display = "block";

    // Запускаем обратный отсчет
    let countdown = 10;
    const countdownElement = document.getElementById("countdown");
    const countdownInterval = setInterval(() => {
        countdownElement.textContent = `Ритуал начался... ${countdown}`;
        countdown--;

        if (countdown < 0) {
            clearInterval(countdownInterval);

            const whiteOverlay = document.getElementById("whiteOverlay");
            whiteOverlay.style.opacity = 1;

            setTimeout(() => {
                // Перенаправляем на рикролл
                // window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
                document.getElementById("rickroll-screen").style.display = "block";
                document.getElementById("rickroll-video-element").play();

                whiteOverlay.style.opacity = 0;
            }, 4000);
        }
    }, 1000);
});

document.getElementById("easterEgg1Text").addEventListener("click", function () {
    document.getElementById("easterEgg1Image").style.display = "block";
    setTimeout(() => {
        document.getElementById("easterEgg1Image").style.display = "none";
    }, 3000);
});

// document.getElementById("easterEgg1Image").addEventListener("click", function () {
//     window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
// });

let clickCount = 0;
let lastClickTime = 0;
document.getElementById("cursed-curs-title").addEventListener("click", function () {
    const currentTime = new Date().getTime();
    
    // Reset count if more than 2 seconds between clicks
    if (currentTime - lastClickTime > 2000) {
        clickCount = 0;
    }
    
    clickCount++;
    lastClickTime = currentTime;

    // Toggle colors
    const title = document.getElementById("cursed-curs-title");
    if (clickCount === 1) {
        title.classList.add("cursed-click-1");
    } else if (clickCount === 2) {
        title.classList.remove("cursed-click-1");
        title.classList.add("cursed-click-2");
    } else if (clickCount === 3) {
        title.classList.remove("cursed-click-2");
        startJumpingText({
            elementId: "cursed-curs-title",
            maxDelay: 0.5,
            maxDuration: 0.2,
        });
        title.classList.add("cursed-click-3");
        document.getElementById("gameCanvas").style.display = "block";
        startGame();
    }
});
