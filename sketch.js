let capture;
let facemesh;
let handpose;
let predictions = [];
let hands = [];
let earrings = [];
let currentStyle = 1; // 預設顯示第一款

function preload() {
  // 根據要求載入指定的手勢對應耳環圖片
  earrings[0] = loadImage('pic/acc1_ring.png');    // 手勢 1
  earrings[1] = loadImage('pic/acc2_pearl.png');   // 手勢 2
  earrings[2] = loadImage('pic/acc3_tassel.png');  // 手勢 3
  earrings[3] = loadImage('pic/acc4_jade.png');    // 手勢 4
  earrings[4] = loadImage('pic/acc5_phoenix.png'); // 手勢 5
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  // 設定擷取影像的尺寸為全螢幕寬高的 50%
  capture.size(windowWidth * 0.5, windowHeight * 0.5);
  // 隱藏預設產生的 HTML5 視訊元件，只在畫布上繪製
  capture.hide();

  // 初始化 FaceMesh 模型
  facemesh = ml5.facemesh(capture, modelReady);
  // 當偵測到臉部特徵時，更新 predictions 陣列
  facemesh.on("predict", results => {
    predictions = results;
  });

  // 初始化 Handpose 模型
  handpose = ml5.handpose(capture, () => console.log("手勢辨識模型已就緒"));
  handpose.on("predict", results => {
    hands = results;
  });
}

function modelReady() {
  console.log("模型準備就緒！");
}

function draw() {
  // 設定背景顏色
  background('#e7c6ff');

  let vWidth = width * 0.5;
  let vHeight = height * 0.5;

  push();
  // 將座標中心移至畫布中央
  translate(width / 2, height / 2);
  // 進行水平翻轉（scale 的第一個參數為 -1）
  scale(-1, 1);
  // 繪製影像，起始座標需向左上方偏移影像寬高的一半以達成置中
  image(capture, -vWidth / 2, -vHeight / 2, vWidth, vHeight);

  // 偵測手勢並更新耳環款式
  updateCurrentStyle();

  // 如果辨識到臉部特徵，則繪製耳垂位置
  if (predictions.length > 0) {
    let keypoints = predictions[0].scaledMesh;
    // FaceMesh 索引說明：234 接近右耳耳垂區域，454 接近左耳耳垂區域
    let rightEarlobe = keypoints[234];
    let leftEarlobe = keypoints[454];

    // 設定圖片繪製模式為中心
    imageMode(CENTER);
    
    // 根據目前的款式編號取得圖片 (陣列索引從 0 開始，所以要減 1)
    let img = earrings[currentStyle - 1];
    let earringSize = 50;
    image(img, rightEarlobe[0] - vWidth / 2, rightEarlobe[1] - vHeight / 2, earringSize, earringSize);
    image(img, leftEarlobe[0] - vWidth / 2, leftEarlobe[1] - vHeight / 2, earringSize, earringSize);

    // 恢復預設繪圖模式（避免影響其他 image 呼叫）
    imageMode(CORNER);
  }
  pop();
}

function updateCurrentStyle() {
  if (hands.length > 0) {
    let count = 0;
    let landmarks = hands[0].landmarks;

    // 判斷 4 根手指（食指、中指、無名指、小指）是否伸直
    if (landmarks[8][1] < landmarks[6][1]) count++;  // 食指
    if (landmarks[12][1] < landmarks[10][1]) count++; // 中指
    if (landmarks[16][1] < landmarks[14][1]) count++; // 無名指
    if (landmarks[20][1] < landmarks[18][1]) count++; // 小指

    // 判斷大拇指：比較指尖到手掌基部 (landmark 0) 的距離
    let dTip = dist(landmarks[4][0], landmarks[4][1], landmarks[0][0], landmarks[0][1]);
    let dKnuckle = dist(landmarks[2][0], landmarks[2][1], landmarks[0][0], landmarks[0][1]);
    if (dTip > dKnuckle) count++;

    // 如果手指數量在 1~5 之間，就更新目前款式（若手拿開則維持最後一次的樣式）
    if (count >= 1 && count <= 5) {
      currentStyle = count;
    }
  }
}

function windowResized() {
  // 當瀏覽器視窗大小改變時，同步更新畫布大小
  resizeCanvas(windowWidth, windowHeight);
}