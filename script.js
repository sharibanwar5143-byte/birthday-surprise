/* =========================================
   SURPRISE DATA SYSTEM
   ========================================= */

   /* =========================================
   PRELOAD IMPORTANT BIRTHDAY BACKGROUNDS
   ========================================= */

function preloadBirthdayImages() {

    const images = [
        "birthday-tree.png",
        "cake-background.png",
        "reasons-background.png",
        "heart-balloon.png",
        "pink-glowing-butterfly.png",
        "birthday-tree.png"
    ];

    images.forEach(function (src) {

        const img = new Image();

        img.decoding = "async";
        img.loading = "eager";

        img.src = src;

    });
}

preloadBirthdayImages();



/* =========================================
   SUPABASE CONNECTION
   ========================================= */

const SUPABASE_URL =
    "https://myzbmxzzggbojhwbuncu.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_kuR_1pYnVMJmOsLSXEiajg_oQ4_HD36";

window.supabaseClient = null;

if (window.supabase) {

    window.supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

} else {

    console.error(
        "Supabase library did not load."
    );

}

function getSurpriseId() {

    return new URLSearchParams(
        window.location.search
    ).get("id");

}

function getBirthdayData() {

    let id = getSurpriseId();

    /* If the URL has no ID, use the latest created surprise */
    if (!id) {
        id = localStorage.getItem("lastSurpriseId");
    }

    if (!id) {
        console.log("No surprise ID found");
        return {};
    }

    const key = "birthday_" + id;

    const saved = localStorage.getItem(key);

    console.log("Loading surprise:", key);
    console.log("Saved data:", saved);

    if (!saved) {
        console.log("No data found for this surprise ID");
        return {};
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        console.error("Could not read birthday data:", error);
        return {};
    }
}

async function uploadMediaFile(file, path) {

    const { data, error } =
        await window.supabaseClient
            .storage
            .from("birthday-media")
            .upload(path, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
            });

    if (error) {
        console.error("Media upload error:", error);
        throw error;
    }

    const { data: publicData } =
        window.supabaseClient
            .storage
            .from("birthday-media")
            .getPublicUrl(data.path);

    return publicData.publicUrl;
}

function formatBirthdayDate(input) {

    let value = input.value.replace(/\D/g, "");

    if (value.length > 2) {
        value =
            value.substring(0, 2) +
            " / " +
            value.substring(2, 4);
    }

    input.value = value;
}

function askCreatorPassword() {

    document
        .getElementById("creatorPasswordBox")
        .classList.add("show");

    document
        .getElementById("creatorPassword")
        .focus();
}


function verifyCreatorPassword() {

    const password =
        document
            .getElementById("creatorPassword")
            .value;

    const error =
        document
            .getElementById("creatorPasswordError");

    if (password === "Shadraforever") {

        error.textContent = "";

        document
            .getElementById("creatorPasswordBox")
            .classList.remove("show");

        document
            .getElementById("creatingSurpriseLoader")
            .classList.add("show");

        createSurprise().catch(function (err) {

            console.error(
                "CREATE SURPRISE ERROR:",
                err
            );

            document
                .getElementById("creatingSurpriseLoader")
                .classList.remove("show");

            alert(
                "Something went wrong while creating the surprise.\n\n" +
                err.message
            );

        });

    } else {

        error.textContent =
            "💕 Wrong password. Please try again.";

        document
            .getElementById("creatorPassword")
            .value = "";
    }
}

async function createSurprise() {
      if (!window.supabaseClient) {

    document
        .getElementById("creatingSurpriseLoader")
        .classList.remove("show");

    alert(
        "Supabase is not connected. Please check your internet connection."
    );

    return;
      }
    const songFile = document.getElementById("favoriteSong").files[0];

    const birthdayData = {
        recipient: document.getElementById("recipientName").value,
        age: document.getElementById("age").value,
      birthdayDate: document.getElementById("birthdayDate").value,
        sender: document.getElementById("senderName").value,
        

        reason1: document.getElementById("reason1").value,
        reason2: document.getElementById("reason2").value,
        reason3: document.getElementById("reason3").value,
        reason4: document.getElementById("reason4").value,
        reason5: document.getElementById("reason5").value,

        letter: document.getElementById("loveLetter").value,
        song: "",
songStartTime:
    document.getElementById("songStartTime").value,
memory1: "",
memoryCaption1: document.getElementById("memoryCaption1").value,
memory2: "",
memoryCaption2: document.getElementById("memoryCaption2").value,
memory3: "",
memoryCaption3: document.getElementById("memoryCaption3").value,
memory4: "",
memoryCaption4: document.getElementById("memoryCaption4").value,
memory5: "",
memoryCaption5: document.getElementById("memoryCaption5").value
    };


  const mediaFolderId =
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8);

 if (songFile) {

    birthdayData.song =
        await uploadMediaFile(
            songFile,
            mediaFolderId + "/favorite-song-" + songFile.name
        );
 }

for (let i = 1; i <= 5; i++) {

    const photoFile =
        document.getElementById(
            "memoryPhoto" + i
        ).files[0];

    if (photoFile) {

        birthdayData["memory" + i] =
            await uploadMediaFile(
                photoFile,
                mediaFolderId +
                "/memory-" +
                i +
                "-" +
                photoFile.name
            );
    }
}

   const surpriseId =
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 8);

localStorage.setItem(
    "birthday_" + surpriseId,
    JSON.stringify(birthdayData)
);

    /* SAVE SURPRISE TO SUPABASE */

    const { error } = await supabaseClient
        .from("birthday_surprises")
        .insert({
            id: surpriseId,
            data: birthdayData
        });

    if (error) {
        console.error("Supabase save error:", error);

        alert(
            "Could not create online surprise. Please try again."
        );

        return;
    }

    console.log(
        "Surprise successfully saved online:",
        surpriseId
    );

localStorage.setItem(
    "lastSurpriseId",
    surpriseId
);

  document
    .getElementById("creatingSurpriseLoader")
    .classList.remove("show");

    document.getElementById("result").innerHTML = `

    <p>🎉 Surprise created!</p>

    <p>Your surprise link:</p>

    <div class="surprise-link-box">

        <input
            type="text"
            id="generatedSurpriseLink"
            value="${window.location.origin + window.location.pathname.replace('index.html', '')}surprise.html?id=${surpriseId}"
            readonly
        >

        <button
            onclick="copySurpriseLink()"
        >
            📋 Copy Link
        </button>

    </div>

    <button
        onclick="previewSurprise()"
        class="preview-surprise-button"
    >
        Preview Surprise 🎁
    </button>
`;
}

function fileToDataURL(file) {
    return new Promise(function(resolve, reject) {

        const reader = new FileReader();

        reader.onload = function(event) {

            const img = new Image();

            img.onload = function() {

                const maxWidth = 900;
                const maxHeight = 900;

                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {

                    const ratio = Math.min(
                        maxWidth / width,
                        maxHeight / height
                    );

                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );

                const compressedImage =
                    canvas.toDataURL("image/jpeg", 0.75);

                resolve(compressedImage);
            };

            img.onerror = function() {
                reject(new Error("Could not load image"));
            };

            img.src = event.target.result;
        };

        reader.onerror = function() {
            reject(reader.error);
        };

        reader.readAsDataURL(file);
    });
}

function previewSurprise() {

    const surpriseId =
        localStorage.getItem("lastSurpriseId");

    if (!surpriseId) {
        alert("Please create a surprise first.");
        return;
    }

    window.location.href =
        "surprise.html?id=" + surpriseId;
}

function copySurpriseLink() {

    const link =
        document.getElementById(
            "generatedSurpriseLink"
        );

    link.select();

    navigator.clipboard.writeText(link.value);

    alert("💕 Surprise link copied!");
}


function blowCake() {
    const flames = document.querySelectorAll(".real-flame");

    flames.forEach(function(flame) {
        flame.classList.add("flame-out");
    });

    const button = document.querySelector(".cake-button");

    if (button) {
        button.disabled = true;
        button.textContent = "✨ Wish made ✨";
    }

    /* Show the cake knife after the candles go out */
    setTimeout(function() {
        const knife = document.getElementById("cakeKnife");

        if (knife) {
            knife.classList.add("show");
        }
    }, 700);
}


    

  function cutCake() {
    const knifePanel = document.getElementById("cakeKnife");
    const cake = document.querySelector(".chocolate-cake");

    if (!knifePanel || !cake) return;
    if (knifePanel.dataset.cutting === "true") return;

    knifePanel.dataset.cutting = "true";

    const cakeRect = cake.getBoundingClientRect();

    /* Hide the old tap panel */
    knifePanel.style.opacity = "0";
    knifePanel.style.pointerEvents = "none";

    /* Create the real cutting knife */
    const knife = document.createElement("div");
    knife.className = "front-cutting-knife";

    knife.innerHTML = `
        <div class="front-knife-blade">
            <div class="front-knife-shine"></div>
        </div>

        <div class="front-knife-guard"></div>

        <div class="front-knife-handle">
            <div class="front-knife-heart">♥</div>
        </div>
    `;

    document.body.appendChild(knife);

    /*
       Knife starts in front of the screen.
       Handle is closest to the viewer.
       Sharp blade points toward the cake.
    */

    const knifeX =
        cakeRect.left + cakeRect.width / 2;

    const startY =
        cakeRect.bottom + 45;

    const cakeTop =
        cakeRect.top + 10;

    knife.style.left = knifeX + "px";
    knife.style.top = startY + "px";

    /* Start moving the knife toward the cake */
    requestAnimationFrame(function () {
        knife.classList.add("front-knife-cutting");
    });

    /*
       The blade tip reaches the cake here.
       Cake splitting happens at the same moment.
    */
    setTimeout(function () {
        createRealCakeCut(cake);
    }, 900);

    /* Cake confetti after the cut */
    setTimeout(function () {
        createCakeConfetti();
    }, 1250);

    /* Remove knife */
    setTimeout(function () {
        knife.remove();
    }, 1800);

/* Continue to balloons AFTER cake cutting is completely finished */
setTimeout(function () {
    const cakeScreen = document.getElementById("cakeScreen");

    if (cakeScreen) {
        cakeScreen.style.display = "none";
        cakeScreen.style.visibility = "hidden";
    }

    goToBalloons();
}, 2100);
  }


function createRealCakeCut(cake) {

    if (!cake) {
        return;
    }

    const rect = cake.getBoundingClientRect();

    /* =====================================
       CREATE SPLIT CONTAINER
       ===================================== */

    const split = document.createElement("div");

    split.className = "real-cake-split";

    split.style.left = rect.left + "px";
    split.style.top = rect.top + "px";
    split.style.width = rect.width + "px";
    split.style.height = rect.height + "px";
    split.style.zIndex = "9999";


    /* =====================================
       LEFT CAKE PIECE
       ===================================== */

    const leftCake = cake.cloneNode(true);

    leftCake.className =
        "cake-half cake-half-left";

    leftCake.style.width =
        rect.width + "px";

    leftCake.style.height =
        rect.height + "px";


    /* =====================================
       RIGHT CAKE PIECE
       ===================================== */

    const rightCake = cake.cloneNode(true);

    rightCake.className =
        "cake-half cake-half-right";

    rightCake.style.width =
        rect.width + "px";

    rightCake.style.height =
        rect.height + "px";

  


    /* =====================================
       KEEP UPPER CAKE LAYER
       ON BOTH PIECES
       ===================================== */

    const leftUpper =
        leftCake.querySelector(".upper-layer");

    const rightUpper =
        rightCake.querySelector(".upper-layer");

    if (leftUpper) {
        leftUpper.style.visibility = "visible";
        leftUpper.style.opacity = "1";
        leftUpper.style.display = "block";
    }

    if (rightUpper) {
        rightUpper.style.visibility = "visible";
        rightUpper.style.opacity = "1";
        rightUpper.style.display = "block";
    }


    /* =====================================
       KEEP CHOCOLATE TOP
       ON BOTH PIECES
       ===================================== */

    const leftTop =
        leftCake.querySelector(".choco-top");

    const rightTop =
        rightCake.querySelector(".choco-top");

    if (leftTop) {
        leftTop.style.visibility = "visible";
        leftTop.style.opacity = "1";
    }

    if (rightTop) {
        rightTop.style.visibility = "visible";
        rightTop.style.opacity = "1";
    }


    /* =====================================
       ADD BOTH PIECES
       ===================================== */

    split.appendChild(leftCake);
    split.appendChild(rightCake);

    document.body.appendChild(split);


    /* =====================================
       HIDE ORIGINAL CAKE
       ===================================== */

    cake.style.display = "none";


    /* =====================================
       START YOUR EXISTING ANIMATION
       ===================================== */

    requestAnimationFrame(function () {

        split.classList.add(
            "cake-really-split"
        );

    });


    /* =====================================
       REMOVE OLD CUT LINE
       ===================================== */

    setTimeout(function () {

        const oldLine =
            cake.querySelector(".cake-cut-line");

        if (oldLine) {
            oldLine.remove();
        }

    }, 50);


    /* =====================================
       REMOVE SPLIT
       ===================================== */

    setTimeout(function () {

        split.remove();

    }, 1200);
}


function createCakeConfetti() {
    const colors = [
        "#ff5ca8",
        "#ffd166",
        "#7cf5ff",
        "#b88cff",
        "#ff8f70",
        "#ffffff"
    ];

    for (let i = 0; i < 140; i++) {
        const piece = document.createElement("span");

        piece.className = "cake-confetti";

        piece.style.left = Math.random() * 100 + "vw";

piece.style.background =
    colors[Math.floor(Math.random() * colors.length)];

piece.style.animationDelay =
    Math.random() * 1.2 + "s";

piece.style.width =
    (5 + Math.random() * 9) + "px";

piece.style.height =
    (7 + Math.random() * 14) + "px";

piece.style.transform =
    "rotate(" + Math.random() * 360 + "deg)";
      piece.style.setProperty(
    "--random-x",
    Math.random()
);
        document.body.appendChild(piece);

        setTimeout(function() {
            piece.remove();
        }, 3000);
    }
}

function goToBalloons() {

    const cake =
        document.getElementById("cakeScreen");

    const hope =
        document.getElementById("hopeScreen");

    const balloons =
        document.getElementById("balloonScreen");

    if (cake) {
        cake.style.display = "none";
    }

    if (hope) {
        hope.style.display = "none";
    }

    if (balloons) {

        balloons.style.display = "flex";

        balloons.style.visibility =
            "visible";

        startBalloonFireworks();
    }

    window.scrollTo(0, 0);
}


function popBalloon(balloon, number) {
    const data = getBirthdayData();

    const reasons = [
        data.reason1 || "You're an amazing person 💕",
        data.reason2 || "You make every day brighter ☀️",
        data.reason3 || "You make life more beautiful 💖",
        data.reason4 || "You always know how to make me smile 😊",
        data.reason5 || "You are simply unforgettable 🤍"
    ];

    if (balloon.classList.contains("popped")) {
        return;
    }

  createFlowerBlast(balloon);

    balloon.classList.add("popped");

    const reasonBox = document.getElementById("balloonReason");

    if (reasonBox) {
        reasonBox.textContent = reasons[number - 1];
        reasonBox.classList.remove("show");

        void reasonBox.offsetWidth;

        reasonBox.classList.add("show");
    }

    const poppedCount =
        document.querySelectorAll(".birthday-balloon.popped").length;

    if (poppedCount === 5) {
    setTimeout(function () {
        if (reasonBox) {
            reasonBox.textContent = "…and a thousand more reasons ✨";
        }

        setTimeout(function () {
            goToMemoryLane();
        }, 1200);

    }, 4000);
}

/* CLOSE popBalloon */
}

function goToMemoryLane() {

    const balloons =
        document.getElementById("balloonScreen");

    const memory =
        document.getElementById("memoryScreen");

    const magic =
        document.getElementById("birthdayMagic");

    /* HIDE BALLOONS */
    if (balloons) {
        balloons.style.display = "none";
        balloons.style.visibility = "hidden";
    }

    /* HIDE FIREWORKS */
    if (magic) {
        magic.style.display = "none";
        magic.style.visibility = "hidden";
    }

    /* SHOW MEMORY LANE */
    if (memory) {
        memory.style.display = "flex";
        memory.style.visibility = "visible";
        memory.style.opacity = "1";
        memory.style.zIndex = "999999";

        renderMemoryLane();
    }

    document.body.style.overflow = "auto";

    window.scrollTo(0, 0);
}
/* =========================================================
   3D INFLATED FOIL BALLOON LETTERS
   ========================================================= */

function createFoilBalloonWord(text, elementId) {

    const container = document.getElementById(elementId);

    if (!container) return;

    container.innerHTML = "";

    const value = String(text || "YOU").toUpperCase();

    const colors = [
        ["#ff1685", "#ff9ed2", "#a90050"],
        ["#7435e8", "#d0aaff", "#350b8a"],
        ["#00aee8", "#9cecff", "#00618e"],
        ["#f4b900", "#fff0a0", "#a45b00"]
    ];

    for (let i = 0; i < value.length; i++) {

        if (value[i] === " ") continue;

        const canvas = document.createElement("canvas");

        canvas.width = 180;
        canvas.height = 210;

        canvas.className = "balloon-canvas-letter";

        const ctx = canvas.getContext("2d");

        const c = colors[i % colors.length];

        const letter = value[i];

        /* -----------------------------------------
           SHADOW
        ----------------------------------------- */

        ctx.save();

        ctx.translate(90, 120);

        ctx.font =
            "900 145px Arial Black, Impact, Arial";

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.shadowColor = "rgba(0,0,0,.55)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 14;

        ctx.fillStyle = "#28051d";

        ctx.fillText(letter, 0, 0);

        ctx.restore();


        /* -----------------------------------------
           MAIN BALLOON
        ----------------------------------------- */

        ctx.save();

        ctx.translate(90, 108);

        ctx.font =
            "900 145px Arial Black, Impact, Arial";

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const gradient =
            ctx.createRadialGradient(
                -35,
                -55,
                5,
                10,
                10,
                125
            );

        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(.08, c[1]);
        gradient.addColorStop(.28, c[0]);
        gradient.addColorStop(.62, c[0]);
        gradient.addColorStop(.82, c[2]);
        gradient.addColorStop(1, "#250018");

        ctx.fillStyle = gradient;

        /* thick inflated outside */

        ctx.lineWidth = 18;

        ctx.strokeStyle = c[2];

        ctx.lineJoin = "round";

        ctx.strokeText(letter, 0, 0);

        /* white outer rim */

        ctx.lineWidth = 7;

        ctx.strokeStyle =
            "rgba(255,255,255,.9)";

        ctx.strokeText(letter, 0, 0);

        /* actual balloon surface */

        ctx.fillStyle = gradient;

        ctx.shadowColor =
            "rgba(255,255,255,.3)";

        ctx.shadowBlur = 5;

        ctx.fillText(letter, 0, 0);

        ctx.restore();


        /* -----------------------------------------
           LARGE SPECULAR HIGHLIGHT
        ----------------------------------------- */

        ctx.save();

        ctx.translate(90, 108);

        ctx.font =
            "900 145px Arial Black, Impact, Arial";

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.globalCompositeOperation =
            "source-atop";

        const shine =
            ctx.createLinearGradient(
                -70,
                -80,
                60,
                80
            );

        shine.addColorStop(
            0,
            "rgba(255,255,255,.75)"
        );

        shine.addColorStop(
            .15,
            "rgba(255,255,255,.28)"
        );

        shine.addColorStop(
            .35,
            "rgba(255,255,255,0)"
        );

        shine.addColorStop(
            .72,
            "rgba(255,255,255,.15)"
        );

        shine.addColorStop(
            1,
            "rgba(255,255,255,0)"
        );

        ctx.fillStyle = shine;

        ctx.fillText(letter, 0, 0);

        ctx.restore();


        /* -----------------------------------------
           BALLOON CREASE / REFLECTION
        ----------------------------------------- */

        ctx.save();

        ctx.translate(90, 108);

        ctx.globalAlpha = .55;

        ctx.strokeStyle = "white";

        ctx.lineWidth = 3;

        ctx.beginPath();

        ctx.moveTo(-42, -48);

        ctx.quadraticCurveTo(
            -20,
            -68,
            2,
            -55
        );

        ctx.stroke();

        ctx.restore();


        /* -----------------------------------------
           TINY LIGHT REFLECTION
        ----------------------------------------- */

        ctx.save();

        ctx.globalAlpha = .8;

        const smallShine =
            ctx.createRadialGradient(
                55,
                55,
                1,
                55,
                55,
                18
            );

        smallShine.addColorStop(
            0,
            "rgba(255,255,255,.9)"
        );

        smallShine.addColorStop(
            1,
            "rgba(255,255,255,0)"
        );

        ctx.fillStyle = smallShine;

        ctx.beginPath();

        ctx.ellipse(
            55,
            55,
            7,
            18,
            -.4,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();


        /* -----------------------------------------
           RANDOM BALLOON MOVEMENT
        ----------------------------------------- */

        canvas.style.setProperty(
            "--balloon-rotation",
            ((Math.random() * 7) - 3.5) + "deg"
        );

        canvas.style.setProperty(
            "--balloon-delay",
            (Math.random() * 1.5) + "s"
        );

        container.appendChild(canvas);
    }
}

function setupCakeFoilBalloons() {

    const data =
    getBirthdayData();

    const recipient =
        data.recipient || "YOU";

    createFoilBalloonWord(
        "HAPPY",
        "balloonHappy"
    );

    createFoilBalloonWord(
        "BIRTHDAY",
        "balloonBirthday"
    );

    createFoilBalloonWord(
        recipient,
        "balloonName"
    );
}

/* =====================================================
   NEW FIX — LOAD REAL BALLOON IMAGES
   ===================================================== */

function loadBeautifulSideBalloons() {

    const left = document.querySelector(".foil-heart-left");
    const right = document.querySelector(".foil-heart-right");

    if (!left || !right) return;

    const balloonImages = [
        "https://www.pngkey.com/png/detail/960-9608432_sapphire-blue-heart-shaped-18-foil-decorator-balloon.png",
        "https://www.pngkey.com/png/detail/917-9170305_dark-purple-heart-shaped-18-foil-decorator-balloon.png"
    ];

    document.querySelectorAll(".real-side-balloon").forEach(function(img, index) {

        img.src = balloonImages[index % 2];

        img.onerror = function() {
            console.log("Balloon image could not load:", img.src);
            img.style.display = "none";
        };
    });
}

/* =========================================================
   NEW — REALISTIC 3D BALLOON SIDES
   ========================================================= */

function createRealisticBalloonSides() {

    /* Don't create duplicates */
    if (document.querySelector(".realistic-balloon-cluster")) return;

    const colors = ["pink", "purple", "gold", "blue"];

    ["left", "right"].forEach(function(side) {

        const cluster = document.createElement("div");

        cluster.className =
            "realistic-balloon-cluster " + side;

        colors.forEach(function(color, index) {

            const balloon = document.createElement("div");

            balloon.className =
                "real-heart-balloon " +
                color +
                " b" +
                (index + 1);

            const point = document.createElement("div");
            point.className = "balloon-point";

            const shine = document.createElement("div");
            shine.className = "balloon-shine";

            balloon.appendChild(point);
            balloon.appendChild(shine);

            cluster.appendChild(balloon);
        });

        const ribbon1 = document.createElement("div");
        ribbon1.className = "balloon-ribbon r1";

        const ribbon2 = document.createElement("div");
        ribbon2.className = "balloon-ribbon r2";

        cluster.appendChild(ribbon1);
        cluster.appendChild(ribbon2);

        document.getElementById("cakeScreen").appendChild(cluster);
    });
}

function renderMemoryLane() {

    const data =
    getBirthdayData();

    const area =
        document.getElementById("memoryPhotoArea");

    if (!area) return;

    area.innerHTML = "";

    const rotations = [
        "-4deg",
        "3.5deg",
        "-2.5deg",
        "3deg",
        "-3deg"
    ];

    let photoCount = 0;

    for (let i = 1; i <= 5; i++) {

        const photo =
            data["memory" + i];

        const caption =
            data["memoryCaption" + i] || "";

        if (photo) {

            const card =
                document.createElement("div");

            card.className =
                "memory-polaroid";

            card.style.setProperty(
                "--memory-rotation",
                rotations[photoCount]
            );

            const img =
                document.createElement("img");

            img.src = photo;

            img.alt =
                "Memory " + i;

            const text =
                document.createElement("p");

            text.textContent =
                caption;

            card.appendChild(img);
            card.appendChild(text);

            area.appendChild(card);

            photoCount++;
        }
    }

    if (photoCount === 0) {

        area.innerHTML = `
            <div class="memory-placeholder">
                📸
                <span>
                    Your memories will appear here
                </span>
            </div>
        `;
    }
}


/* =========================================
   OLD SCRATCH-TO-OPEN SEAL
   ========================================= */

let sealScratchStarted = false;
let sealScratchDistance = 0;
let lastScratchX = 0;
let lastScratchY = 0;
let sealScratchReady = false;

function setupSealScratch() {

    const seal = document.querySelector(".heart-seal");

    if (!seal) return;

    if (sealScratchReady) return;

    sealScratchReady = true;

    seal.addEventListener("pointerdown", function(event) {

        if (
            seal.classList.contains("seal-broken") ||
            seal.classList.contains("seal-damaged")
        ) {
            return;
        }

        sealScratchStarted = true;
        sealScratchDistance = 0;

        lastScratchX = event.clientX;
        lastScratchY = event.clientY;

        try {
            seal.setPointerCapture(event.pointerId);
        } catch (e) {}

        seal.classList.add("being-scratched");

        event.preventDefault();
    });

    seal.addEventListener("pointermove", function(event) {

        if (!sealScratchStarted) return;

        const dx =
            event.clientX - lastScratchX;

        const dy =
            event.clientY - lastScratchY;

        const distance =
            Math.sqrt(
                dx * dx + dy * dy
            );

        if (distance < 1) return;

        sealScratchDistance += distance;

        lastScratchX = event.clientX;
        lastScratchY = event.clientY;

        createWaxScratch(
            event.clientX,
            event.clientY,
            dx,
            dy
        );

        seal.style.transform =
            "translate(-50%, -50%) rotate(" +
            (-2 + (Math.random() * 1.5 - .75)) +
            "deg)";

        /*
           After enough rubbing,
           break the seal.
        */

        if (sealScratchDistance >= 120) {

            sealScratchStarted = false;

            seal.classList.remove(
                "being-scratched"
            );

            seal.classList.add(
                "seal-damaged"
            );

            setTimeout(
                breakSeal,
                550
            );
        }

        event.preventDefault();
    });

    seal.addEventListener(
        "pointerup",
        stopSealScratch
    );

    seal.addEventListener(
        "pointercancel",
        stopSealScratch
    );
}


function stopSealScratch() {

    sealScratchStarted = false;

    const seal =
        document.querySelector(
            ".heart-seal"
        );

    if (seal) {

        seal.classList.remove(
            "being-scratched"
        );

        seal.style.transform =
            "translate(-50%, -50%) rotate(-2deg)";
    }
}


/* =========================================
   SMALL SCRATCH MARKS
   ========================================= */

function createWaxScratch(
    x,
    y,
    dx,
    dy
) {

    const mark =
        document.createElement("span");

    mark.className =
        "wax-scratch-mark";

    mark.textContent = "✦";

    mark.style.left =
        x + "px";

    mark.style.top =
        y + "px";

    mark.style.transform =
        "rotate(" +
        Math.random() * 360 +
        "deg)";

    document.body.appendChild(mark);

    setTimeout(
        function() {
            mark.remove();
        },
        700
    );
}


/* =========================================
   BREAK SEAL
   ========================================= */

function breakSeal() {
    const seal = document.querySelector(".heart-seal");
    const envelope = document.querySelector(".new-envelope");

    if (!seal || !envelope) return;

    if (seal.classList.contains("seal-broken")) return;

    seal.classList.remove("seal-damaged");
    seal.classList.add("seal-broken");

    setTimeout(function () {

        /* OPEN ENVELOPE */
        envelope.classList.add("envelope-opening");
        envelope.classList.add("envelope-opened");
        setTimeout(function () {
    startLetterWriting();
}, 2600);
        const instruction = document.querySelector(".seal-instruction");

if (instruction) {
    instruction.style.opacity = "0";
    instruction.style.visibility = "hidden";
    instruction.style.pointerEvents = "none";
}

        /* OPEN TOP FLAP DIRECTLY */
        const flap = envelope.querySelector(".new-envelope-top");

        if (flap) {
            flap.style.transform =
                "perspective(700px) rotateX(180deg)";
            flap.style.transformOrigin = "top center";
            flap.style.zIndex = "5";
        }

        /* HIDE SEAL */
        seal.style.opacity = "0";
        seal.style.pointerEvents = "none";

        /* BRING LETTER OUT */
        const letter = envelope.querySelector(".hidden-letter");

        if (letter) {
            letter.style.opacity = "1";
            letter.style.transform = "translateY(-110px)";
            letter.style.transition =
                "transform 1.4s cubic-bezier(.2,.8,.2,1), opacity .5s ease";
        }

    }, 700);
}

function goToLoveLetter() {
    const memory = document.getElementById("memoryScreen");
    const love = document.getElementById("loveLetterScreen");
    const data = getBirthdayData();

    if (memory) {
        memory.style.display = "none";
        memory.style.visibility = "hidden";
    }

    if (love) {
        love.style.display = "flex";
        love.style.visibility = "visible";
        love.style.opacity = "1";

        window.scrollTo(0, 0);

        const sender = document.getElementById("sealSender");
if (sender) {
    sender.textContent = data.sender || "Someone";
}

        // Reset the OLD scratch system
        sealScratchStarted = false;
        sealScratchDistance = 0;
        lastScratchX = 0;
        lastScratchY = 0;

        const seal = document.querySelector(".heart-seal");

        if (seal) {
            seal.classList.remove(
                "being-scratched",
                "seal-damaged",
                "seal-broken"
            );

            seal.style.transform =
                "translate(-50%, -50%) rotate(-2deg)";
        }

        const instruction =
            document.querySelector(".seal-instruction span");

        if (instruction) {
            instruction.textContent =
                "Scratch the seal to open 💕";
        }

        setupSealScratch();
    }
}




/* =========================================================
   AUTOMATIC HANDWRITTEN LETTER
   ========================================================= */

let letterWritingStarted = false;

function startLetterWriting() {

    const letterBox =
        document.getElementById("letterWriting");

    const loveScreen =
        document.getElementById("loveLetterScreen");

    if (!letterBox || !loveScreen) {
        return;
    }

    const data =
        getBirthdayData();

    const message =
        data.letter || "This is my special letter for you ❤️";

    loveScreen.classList.add("letter-revealed");

    /* Remove scratch instruction */
    const instruction =
        loveScreen.querySelector(".seal-instruction");

    if (instruction) {
        instruction.remove();
    }

    /* Remove heart seal */
    const seal =
        loveScreen.querySelector(".heart-seal");

    if (seal) {
        seal.remove();
    }

    /* Add scrolling room */
    let scrollSpace =
        loveScreen.querySelector(".letter-scroll-space");

    if (!scrollSpace) {

        scrollSpace =
            document.createElement("div");

        scrollSpace.className =
            "letter-scroll-space";

        loveScreen.appendChild(scrollSpace);
    }

    /* Hide Continue button while writing */
    const continueButton =
        document.getElementById("letterContinueButton");

    if (continueButton) {
        continueButton.style.display = "none";
    }

    letterBox.textContent = "";

    let index = 0;

    function moveCurrentLineToCenter() {

        const textNode =
            letterBox.firstChild;

        if (!textNode) return;

        const range =
            document.createRange();

        try {

            const lastPosition =
                textNode.textContent.length;

            if (lastPosition === 0) return;

            range.setStart(
                textNode,
                lastPosition - 1
            );

            range.setEnd(
                textNode,
                lastPosition
            );

            const character =
                range.getBoundingClientRect();

            const screen =
                loveScreen.getBoundingClientRect();

            const characterCenter =
                character.top +
                character.height / 2;

            const screenCenter =
                screen.top +
                loveScreen.clientHeight / 2;

            const difference =
                characterCenter - screenCenter;

            loveScreen.scrollTop += difference;

        } catch (e) {
            /* Ignore layout timing errors */
        }
    }

    function writeNext() {

        if (index < message.length) {

            letterBox.textContent +=
                message.charAt(index);

            index++;

            requestAnimationFrame(function () {
                moveCurrentLineToCenter();
            });

            setTimeout(writeNext, 60);

        } else {

            /* ===================== */
            /* ADD SIGNATURE */
            /* ===================== */

            const signature =
                document.createElement("div");

            signature.textContent =
                "With Love, " +
                (data.sender || "Someone");

            signature.style.marginTop = "28px";
            signature.style.fontFamily =
                '"Segoe Print","Bradley Hand",cursive';
            signature.style.fontSize = "18px";
            signature.style.lineHeight = "1.6";
            signature.style.color = "#651b25";

            letterBox.appendChild(signature);

            /* Scroll to signature */
            setTimeout(function () {

                signature.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }, 500);

          setTimeout(function () {
    const button = document.getElementById("letterContinueButton");

    if (button) {
        button.style.display = "block";
        button.style.opacity = "1";
        button.style.visibility = "visible";
        button.style.pointerEvents = "auto";
    }
}, 1200);

            /* ===================== */
            /* SHOW CONTINUE BUTTON */
            /* ===================== */

            setTimeout(function () {

                const button =
                    document.getElementById(
                        "letterContinueButton"
                    );

                if (button) {
                    button.style.display = "block";
                    button.style.opacity = "1";
                }

            }, 1000);
        }
    }

    /* Start writing after letter appears */
    setTimeout(function () {

        loveScreen.scrollTop = 0;

        writeNext();

    }, 300);
}

function removeLetterInstructions() {

    /* Remove scratch instruction */
    const scratchInstruction =
        document.querySelector(".seal-instruction");

    if (scratchInstruction) {
        scratchInstruction.style.display = "none";
    }

    /* Remove the "something special..." message */
    const allElements =
        document.querySelectorAll("#loveLetterScreen *");

    allElements.forEach(function (element) {

        const text =
            element.textContent.trim();

        if (
            text === "Something special is waiting inside..." ||
            text.includes("Something special is waiting inside...")
        ) {
            element.style.display = "none";
        }

    });
}

/* ============================= */
/* FINAL GIFT — ONE LAST THING */
/* ============================= */

function goToFinalGift() {

    const letterScreen =
        document.getElementById("loveLetterScreen");

    const finalScreen =
        document.getElementById("finalGiftScreen");

    if (!letterScreen || !finalScreen) return;


    /* Prevent double tap */

    if (letterScreen.dataset.transitioning === "true") {
        return;
    }

    letterScreen.dataset.transitioning = "true";


    /* Birthday name */

    const data =
        getBirthdayData();

    const name =
        data.recipient || "Birthday Star";

    const nameBox =
        document.getElementById("finalBirthdayName");

    if (nameBox) {
        nameBox.textContent = name;
    }


    /* -------------------------------------------------
       PREPARE FINAL SCREEN
       ------------------------------------------------- */

    finalScreen.style.display = "flex";
    finalScreen.style.visibility = "visible";
    finalScreen.style.opacity = "0";
    finalScreen.style.pointerEvents = "none";
    finalScreen.style.zIndex = "501";


    /* Keep letter above final screen initially */

    letterScreen.style.zIndex = "502";


    /* Restart animations */

    letterScreen.classList.remove(
        "letter-final-leaving"
    );

    finalScreen.classList.remove(
        "one-last-thing-arriving"
    );

    void letterScreen.offsetWidth;
    void finalScreen.offsetWidth;


    /* -------------------------------------------------
       START TRANSITION
       ------------------------------------------------- */

    letterScreen.classList.add(
        "letter-final-leaving"
    );

    finalScreen.classList.add(
        "one-last-thing-arriving"
    );


    /* -------------------------------------------------
       FINISH
       ------------------------------------------------- */

    setTimeout(function () {

        letterScreen.style.display = "none";
        letterScreen.style.visibility = "hidden";
        letterScreen.style.pointerEvents = "none";

        letterScreen.style.opacity = "";
        letterScreen.style.transform = "";
        letterScreen.style.filter = "";
        letterScreen.style.zIndex = "";

        finalScreen.style.opacity = "";
        finalScreen.style.transform = "";
        finalScreen.style.filter = "";
        finalScreen.style.zIndex = "";

        finalScreen.style.visibility = "visible";
        finalScreen.style.pointerEvents = "auto";

        letterScreen.classList.remove(
            "letter-final-leaving"
        );

        finalScreen.classList.remove(
            "one-last-thing-arriving"
        );

        letterScreen.dataset.transitioning = "false";

        window.scrollTo(0, 0);

    }, 1600);
}

/* OPEN THE FINAL GIFT */

function openFinalGift() {

    const data =
        getBirthdayData();

    const stage =
        document.querySelector(".real-gift-stage");

    const intro =
        document.getElementById("finalIntro");

    const reveal =
        document.getElementById("finalReveal");

    const tapText =
        document.querySelector(".final-tap-text");

    const light =
        document.getElementById("giftOpeningLight");

    const bunny =
        document.getElementById("giftBunnyMagic");

    const sparkles =
        document.getElementById("giftOpeningSparkles");

    const finalName =
        document.getElementById("finalBirthdayName");


    if (finalName) {
        finalName.textContent =
            data.recipient || "YOU";
    }


    if (!stage) {
        return;
    }


    /* STOP DOUBLE OPEN */

    if (stage.classList.contains("gift-opened")) {
        return;
    }


    /* =========================
       OPEN GIFT
       ========================= */

  stage.classList.add("gift-opened");

const magicLight =
    document.getElementById("giftOpeningLight");

const magicBunny =
    document.getElementById("giftBunnyMagic");

const magicSparkles =
    document.getElementById("giftOpeningSparkles");

/* ✨ LIGHT FIRST */
setTimeout(function () {
    if (magicLight) {
        magicLight.classList.add("magic-show");
    }
}, 100);

/* 🐰 BUNNY SECOND */
setTimeout(function () {

    const bunny =
        document.getElementById("giftBunnyMagic");

    if (bunny) {
        bunny.style.display = "block";
        bunny.style.visibility = "visible";
        bunny.style.opacity = "1";
        bunny.classList.add("magic-show");
    }

}, 850);

/* 💖 SPARKLES THIRD */
setTimeout(function () {
    if (magicSparkles) {
        magicSparkles.classList.add("magic-show");
    }
}, 1100);


    /* =========================
       HIDE TAP TEXT
       ========================= */

    if (tapText) {
        tapText.style.opacity = "0";
        tapText.style.visibility = "hidden";
    }


  
    /* =========================
       🎊 PAPER SHOWER
       ========================= */

    setTimeout(function () {

        if (typeof createFinalConfetti === "function") {
            createFinalConfetti();
        }

    }, 100);


    /* =========================
       🎆 FINAL SCREEN
       ========================= */

    setTimeout(function () {

        if (intro) {
            intro.classList.add("final-intro-hidden");
        }

        if (reveal) {
            reveal.classList.add("final-reveal-show");
        }

        if (typeof startFinalFireworks === "function") {
            startFinalFireworks();
        }

    }, 3000);

}

let finalFireworksRunning = false;
let finalFireworkTimer = null;

function startFinalFireworks() {

    if (finalFireworksRunning) return;

    finalFireworksRunning = true;
  document.body.style.overflow = "hidden";

    // Start several immediately
    for (let i = 0; i < 5; i++) {
        setTimeout(function () {
            createFinalFirework();
        }, i * 180);
    }

    // Keep creating fireworks continuously
    finalFireworkTimer = setInterval(function () {
        createFinalFirework();
    }, 480);
}


function createFinalFirework() {

    const colors = [
        "#ff2f92",
        "#ff4d4d",
        "#ffd43b",
        "#35e8ff",
        "#7dff5c",
        "#a66cff",
        "#ff7be5",
        "#ffffff",
        "#ff9f43",
        "#5effd0"
    ];

    const burst = document.createElement("div");

    burst.className = "final-firework";

    burst.style.left =
        (8 + Math.random() * 84) + "vw";

    burst.style.top =
        (7 + Math.random() * 50) + "vh";

    burst.style.setProperty(
        "--firework-color",
        colors[Math.floor(Math.random() * colors.length)]
    );

    // Different fireworks have different sizes
    const size =
        0.7 + Math.random() * 1.3;

    burst.style.transform =
        "translate(-50%, -50%) scale(" + size + ")";

    // More colourful particles
    const particleCount =
        28 + Math.floor(Math.random() * 18);

    for (let i = 0; i < particleCount; i++) {

        const spark = document.createElement("span");

        spark.className =
            "final-firework-particle";

        spark.style.setProperty(
            "--angle",
            (i * (360 / particleCount)) + "deg"
        );

        spark.style.setProperty(
            "--distance",
            (55 + Math.random() * 75) + "px"
        );

        spark.style.setProperty(
            "--spark-size",
            (3 + Math.random() * 4) + "px"
        );

        burst.appendChild(spark);
    }

    document.body.appendChild(burst);

    setTimeout(function () {
        burst.remove();
    }, 1800);
}

function createFinalConfetti() {

    const colors = [
        "#ff4fa3",
        "#ffd166",
        "#7cf5ff",
        "#a78bfa",
        "#ff7b72",
        "#ffffff",
        "#7dffb2",
        "#ff9f43",
        "#ff6bd6",
        "#6ee7ff"
    ];

    const stage = document.querySelector(".real-gift-stage");

    if (!stage) return;

    const rect = stage.getBoundingClientRect();

    /* Start from the gift opening */
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height * 0.48;

    for (let i = 0; i < 220; i++) {

        const piece = document.createElement("span");

        piece.className = "gift-paper-piece";

        piece.style.left = startX + (Math.random() * 70 - 35) + "px";
        piece.style.top = startY + (Math.random() * 25 - 12) + "px";

        piece.style.background =
            colors[Math.floor(Math.random() * colors.length)];

        piece.style.width =
            (6 + Math.random() * 10) + "px";

        piece.style.height =
            (8 + Math.random() * 16) + "px";

        piece.style.setProperty(
            "--paper-x",
            (Math.random() * 500 - 250) + "px"
        );

        piece.style.setProperty(
            "--paper-y",
            (-220 - Math.random() * 280) + "px"
        );

        piece.style.setProperty(
            "--paper-rotate",
            (Math.random() * 1080 - 540) + "deg"
        );

        piece.style.animationDelay =
            (Math.random() * 0.45) + "s";

        document.body.appendChild(piece);

        setTimeout(function () {
            piece.remove();
        }, 5000);
    }
}

function replayBirthday() {

    /* Remove temporary effects */
    document.querySelectorAll(
        ".final-firework, .gift-paper-piece, .cake-confetti, .heart-rain, .heart-particle"
    ).forEach(function (item) {
        item.remove();
    });

    /* Stop final fireworks */
    if (typeof finalFireworkTimer !== "undefined" && finalFireworkTimer) {
        clearInterval(finalFireworkTimer);
        finalFireworkTimer = null;
    }

    if (typeof finalFireworksRunning !== "undefined") {
        finalFireworksRunning = false;
    }

    /* Reload the surprise page completely */
    window.location.reload();
}
/* =========================================
   PREVIEW SLIDER
========================================= */

const track = document.getElementById("previewTrack");
const nextPreview = document.querySelector(".preview-btn.next");
const prevPreview = document.querySelector(".preview-btn.prev");
const previewDots = document.querySelectorAll(".preview-dots .dot");

if (track && nextPreview && prevPreview && previewDots.length) {

    function updatePreviewDots() {

        const index = Math.round(
            track.scrollLeft / track.clientWidth
        );

        previewDots.forEach(function(dot, i) {
            if (i === index) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }

    nextPreview.onclick = function() {
        track.scrollBy({
            left: track.clientWidth,
            behavior: "smooth"
        });
    };

    prevPreview.onclick = function() {
        track.scrollBy({
            left: -track.clientWidth,
            behavior: "smooth"
        });
    };

    track.addEventListener("scroll", function() {
        updatePreviewDots();
    });

    previewDots.forEach(function(dot, i) {
        dot.onclick = function() {
            track.scrollTo({
                left: track.clientWidth * i,
                behavior: "smooth"
            });
        };
    });

    updatePreviewDots();
}

/* =========================================
   TREE — FIVE HANGING BIRTHDAY PRAYERS
   ========================================= */

function createHeartTree() {

    const area = document.getElementById("treeMemoryPhotos");

    if (!area) {
        console.log("treeMemoryPhotos not found");
        return;
    }

    area.innerHTML = "";

    const prayers = [
        "🌸 May you always have a reason to smile.",
        "💖 May your heart always be surrounded by love.",
        "✨ May all your dreams slowly turn into reality.",
        "🦋 May you always find happiness wherever life takes you.",
        "🌙 May this new year of your life bring you peace, success, and beautiful memories."
    ];

    prayers.forEach(function(prayer, index) {

        const frame = document.createElement("div");

        frame.className =
            "tree-memory-photo prayer-" + (index + 1);

        const text = document.createElement("div");

        text.className = "tree-prayer-text";

        text.textContent = prayer;

        frame.appendChild(text);

        area.appendChild(frame);
    });

    console.log("Five birthday prayers created ❤️");
}

document.addEventListener("DOMContentLoaded", function() {
    createHeartTree();
});

/* =====================================================
   🎂 MAGICAL CAKE SCREEN ANIMATIONS
   ===================================================== */

function startCakeMagic() {

    const layer = document.getElementById("cakeMagicLayer");

    if (!layer) return;

    /* Prevent duplicate animations */
    if (layer.dataset.started === "true") return;

    layer.dataset.started = "true";


    /* =================================================
       ⭐ STATIC TWINKLING STARS
       ================================================= */

    for (let i = 0; i < 14; i++) {

        const star = document.createElement("div");

        star.className = "cake-twinkle";

        star.style.left =
            (5 + Math.random() * 90) + "%";

        star.style.top =
            (5 + Math.random() * 65) + "%";

        star.style.animationDelay =
            (-Math.random() * 3) + "s";

        layer.appendChild(star);
    }


    /* =================================================
       ✨ SMALL SPARKLES
       ================================================= */

    for (let i = 0; i < 25; i++) {

        const sparkle = document.createElement("div");

        sparkle.className = "cake-sparkle";

        sparkle.style.left =
            (3 + Math.random() * 94) + "%";

        sparkle.style.top =
            (5 + Math.random() * 85) + "%";

        sparkle.style.animationDelay =
            (-Math.random() * 2) + "s";

        layer.appendChild(sparkle);
    }


    /* =================================================
       🌟 FLOATING STARS
       ================================================= */

    for (let i = 0; i < 10; i++) {

        const star = document.createElement("div");

        star.className = "cake-floating-star";

        star.textContent =
            Math.random() > .5 ? "✦" : "✧";

        star.style.left =
            (5 + Math.random() * 90) + "%";

        star.style.top =
            (15 + Math.random() * 70) + "%";

        star.style.animationDelay =
            (-Math.random() * 3) + "s";

        layer.appendChild(star);
    }


    /* =================================================
       💫 LIGHT ORBS
       ================================================= */

    for (let i = 0; i < 4; i++) {

        const orb = document.createElement("div");

        orb.className = "cake-light-orb";

        orb.style.left =
            (Math.random() * 90) + "%";

        orb.style.top =
            (10 + Math.random() * 70) + "%";

        orb.style.animationDelay =
            (-Math.random() * 5) + "s";

        layer.appendChild(orb);
    }


    /* =================================================
       💖 CONTINUOUS FLOATING HEARTS
       ================================================= */

    setInterval(function () {

        const heart =
            document.createElement("div");

        heart.className =
            "cake-floating-heart";

        const hearts = [
            "💖",
            "💕",
            "💗",
            "💓",
            "💞",
            "♥"
        ];

        heart.textContent =
            hearts[
                Math.floor(
                    Math.random() * hearts.length
                )
            ];

        heart.style.left =
            (5 + Math.random() * 90) + "%";

        heart.style.fontSize =
            (14 + Math.random() * 13) + "px";

        heart.style.animationDuration =
            (6 + Math.random() * 5) + "s";

        layer.appendChild(heart);

        setTimeout(function () {
            heart.remove();
        }, 12000);

    }, 700);


    /* =================================================
       🎆 HEART FIREWORKS
       ================================================= */

    function createCakeFirework() {

        const centerX =
            15 + Math.random() * 70;

        const centerY =
            15 + Math.random() * 45;

        const count = 14;

        for (let i = 0; i < count; i++) {

            const particle =
                document.createElement("div");

            particle.className =
                "cake-firework";

            particle.style.left =
                centerX + "%";

            particle.style.top =
                centerY + "%";

            const angle =
                (Math.PI * 2 * i) / count;

            const distance =
                35 + Math.random() * 45;

            particle.style.setProperty(
                "--fx",
                Math.cos(angle) * distance + "px"
            );

            particle.style.setProperty(
                "--fy",
                Math.sin(angle) * distance + "px"
            );

            particle.style.animationDelay =
                (Math.random() * .15) + "s";

            layer.appendChild(particle);

            setTimeout(function () {
                particle.remove();
            }, 2200);
        }
    }


    /* First fireworks */
    setTimeout(createCakeFirework, 800);

    setTimeout(createCakeFirework, 2400);

    setTimeout(createCakeFirework, 4200);


    /* Continue fireworks */
    setInterval(function () {

        createCakeFirework();

    }, 3000);
}

/* Start cake magic when cake screen becomes visible */

const cakeScreenObserver =
    new MutationObserver(function () {

        const cake =
            document.getElementById("cakeScreen");

        if (!cake) return;

        const visible =
            cake.style.display !== "none" &&
            getComputedStyle(cake).display !== "none";

        if (visible) {
            startCakeMagic();
        }

    });

cakeScreenObserver.observe(
    document.body,
    {
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"]
    }
);



function createFlowerBlast(balloon) {

    const screen = document.getElementById("balloonScreen");

    if (!screen || !balloon) return;

    const blast = document.createElement("div");

    blast.className = "flower-blast";

    const screenRect = screen.getBoundingClientRect();
    const balloonRect = balloon.getBoundingClientRect();

    const x =
        balloonRect.left +
        balloonRect.width / 2 -
        screenRect.left;

    const y =
        balloonRect.top +
        balloonRect.height / 2 -
        screenRect.top;

    blast.style.left = x + "px";
    blast.style.top = y + "px";

    /*
       Lots of flowers + petals + hearts + sparkles
    */

    const flowers = [
        "🌸",
        "🌸",
        "🌺",
        "🌷",
        "🌹",
        "💮",
        "🌼",
        "🌸",
        "🌷",
        "🌺"
    ];

    const extras = [
        "💖",
        "💕",
        "✦",
        "✧",
        "✨",
        "❀"
    ];

    const items = flowers.concat(extras);

    for (let i = 0; i < 32; i++) {

        const item = document.createElement("span");

        item.className = "flower-blast-item";

        item.textContent =
            items[Math.floor(Math.random() * items.length)];

        const angle =
            Math.random() * Math.PI * 2;

        const distance =
            45 + Math.random() * 105;

        item.style.setProperty(
            "--x",
            Math.cos(angle) * distance + "px"
        );

        item.style.setProperty(
            "--y",
            Math.sin(angle) * distance + "px"
        );

        item.style.setProperty(
            "--size",
            (13 + Math.random() * 15) + "px"
        );

        item.style.setProperty(
            "--delay",
            (Math.random() * .12) + "s"
        );

        blast.appendChild(item);
    }

    screen.appendChild(blast);

    setTimeout(function () {
        blast.remove();
    }, 1600);
}
