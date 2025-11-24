const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let contador = 0;
let fase = "subiu";
let ultimaClassificacao = "";

function calcularAngulo(A, B, C) {
    const AB = [A.x - B.x, A.y - B.y];
    const CB = [C.x - B.x, C.y - B.y];
    const dot = AB[0]*CB[0] + AB[1]*CB[1];
    const magAB = Math.sqrt(AB[0]**2 + AB[1]**2);
    const magCB = Math.sqrt(CB[0]**2 + CB[1]**2);
    let ang = Math.acos(dot / (magAB * magCB));
    return ang * 180 / Math.PI;
}

let pose;
let Vision;
let FilesetResolver;
let PoseLandmarker;

// 🔥 IMPORTAÇÃO DO BUNDLE MEDIAPIPE (MODELO NOVO)
(async () => {
    const mp = await window.Module;
    Vision = mp.Vision;
    FilesetResolver = mp.FilesetResolver;
    PoseLandmarker = mp.PoseLandmarker;

    iniciar();
})();

async function iniciar() {
    const resolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    pose = await PoseLandmarker.createFromOptions(resolver, {
        baseOptions: {
            modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task"
        },
        runningMode: "video",
        numPoses: 1
    });

    iniciarCamera();
}

async function iniciarCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
    });

    video.srcObject = stream;

    video.onloadeddata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        detectar();
    };
}

async function detectar() {
    const r = await pose.detectForVideo(video, performance.now());

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (r.landmarks && r.landmarks.length > 0) {
        const lm = r.landmarks[0];
        const l = (i) => ({
            x: lm[i].x * canvas.width,
            y: lm[i].y * canvas.height
        });

        const quadE = l(23), quadD = l(24);
        const joeE  = l(25), joeD  = l(26);
        const torE  = l(27), torD  = l(28);
        const ombE  = l(11), ombD  = l(12);

        const angE = calcularAngulo(quadE, joeE, torE);
        const angD = calcularAngulo(quadD, joeD, torD);

        const inclinacao = calcularAngulo(ombE, quadE, torE);

        const valgoE = joeE.x < quadE.x - 30;
        const valgoD = joeD.x > quadD.x + 30;

        const avancE = joeE.y > torE.y - 20;
        const avancD = joeD.y > torD.y - 20;

        let alertas = [];
        if (inclinacao < 40) alertas.push("Coluna inclinada!");
        if (valgoE || valgoD) alertas.push("Knee valgus detectado!");
        if (avancE || avancD) alertas.push("Joelhos avançando demais!");

        // Detectar a fase do agachamento
        if (angE < 90 && angD < 90) fase = "agachou";

        if (angE > 160 && angD > 160 && fase === "agachou") {
            contador++;
            fase = "subiu";

            if (inclinacao < 40 || valgoE || valgoD)
                ultimaClassificacao = "Corrigir postura";
            else if (angE > 120 || angD > 120)
                ultimaClassificacao = "Regular";
            else if (angE > 100 || angD > 100)
                ultimaClassificacao = "Bom";
            else
                ultimaClassificacao = "Ótimo";
        }

        document.getElementById("output").innerHTML =
            `Agachamentos: ${contador}<br>` +
            `Ângulo E: ${angE.toFixed(0)}° | D: ${angD.toFixed(0)}°`;

        document.getElementById("alertas").innerHTML = alertas.join("<br>");
        document.getElementById("classificacao").innerHTML = ultimaClassificacao;
    }

    requestAnimationFrame(detectar);
}