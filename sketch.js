let capture;
let facemesh;
let predictions = [];
let earringImg;

function preload() {
  // 載入耳環圖片
  earringImg = loadImage('pic/acc1_ring.png');
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

  // 如果辨識到臉部特徵，則繪製耳垂位置
  if (predictions.length > 0) {
    let keypoints = predictions[0].scaledMesh;
    // FaceMesh 索引說明：234 接近右耳耳垂區域，454 接近左耳耳垂區域
    let rightEarlobe = keypoints[234];
    let leftEarlobe = keypoints[454];

    // 設定圖片繪製模式為中心
    imageMode(CENTER);
    // 繪製耳環圖片，最後兩個參數 (40, 40) 可以調整耳環的大小
    let earringSize = 50; 
    image(earringImg, rightEarlobe[0] - vWidth / 2, rightEarlobe[1] - vHeight / 2, earringSize, earringSize);
    image(earringImg, leftEarlobe[0] - vWidth / 2, leftEarlobe[1] - vHeight / 2, earringSize, earringSize);
    // 恢復預設繪圖模式（避免影響其他 image 呼叫）
    imageMode(CORNER);
  }
  pop();
}

function windowResized() {
  // 當瀏覽器視窗大小改變時，同步更新畫布大小
  resizeCanvas(windowWidth, windowHeight);
}