// 建立響應式網頁設定
(function () {
  // 建立 viewport 標籤
  const viewport = document.createElement("meta");

  // 設定 viewport 標籤名稱
  viewport.name = "viewport";

  // 設定手機瀏覽器的縮放方式
  viewport.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";

  // 將 viewport 加入網頁 head
  document.head.appendChild(viewport);

  // 建立網頁樣式標籤
  const style = document.createElement("style");

  // 設定網頁樣式
  style.innerHTML = `
    html,
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #f4e285;
    }

    canvas {
      display: block;
      width: 100vw;
      height: 100vh;
      touch-action: none;
    }

    button {
      font-family: sans-serif;
    }
  `;

  // 將樣式加入網頁 head
  document.head.appendChild(style);
})();

// 宣告題目資料
const questions = [
  // 第一題
  {
    station: "市政府",
    correctLine: "板南線"
  },

  // 第二題
  {
    station: "南港",
    correctLine: "板南線"
  },

  // 第三題
  {
    station: "台北101／世貿",
    correctLine: "淡水信義線"
  },

  // 第四題
  {
    station: "象山",
    correctLine: "淡水信義線"
  },

  // 第五題
  {
    station: "龍山寺",
    correctLine: "板南線"
  }
];

// 宣告所有可使用的捷運路線
const allLines = [
  "板南線",
  "淡水信義線",
  "文湖線",
  "松山新店線",
  "中和新蘆線"
];

// 記錄目前題目編號
let currentQuestion = 0;

// 記錄答對題數
let score = 0;

// 記錄目前是否已經作答
let answered = false;

// 記錄使用者選擇的選項
let selectedOption = -1;

// 記錄答案是否正確
let answerIsCorrect = false;

// 記錄是否顯示結果畫面
let showResult = false;

// 記錄目前題目的選項
let options = [];

// 記錄每個選項的位置
let optionBoxes = [];

// 記錄內容面板位置與大小
let panelX = 0;
let panelY = 0;
let panelWidth = 0;
let panelHeight = 0;

// 記錄選項尺寸
let optionX = 0;
let optionWidth = 0;
let optionHeight = 0;
let optionGap = 0;
let optionStartY = 0;

// 記錄題目與選項文字大小
let questionFontSize = 0;
let optionFontSize = 0;
let smallFontSize = 0;

// 記錄下一題按鈕位置與大小
let nextButtonX = 0;
let nextButtonY = 0;
let nextButtonWidth = 0;
let nextButtonHeight = 0;

// 記錄重新開始按鈕位置與大小
let restartButtonX = 0;
let restartButtonY = 0;
let restartButtonWidth = 0;
let restartButtonHeight = 0;

// 記錄彩帶粒子
let confettiParticles = [];

// 記錄錯誤叉叉動畫
let wrongCrossEffects = [];

// 記錄上一次觸控時間
let lastTouchTime = 0;

// 記錄是否顯示全螢幕按鈕
let fullscreenButton;

// p5.js 初始化函式
function setup() {
  // 建立與瀏覽器視窗一樣大的畫布
  createCanvas(windowWidth, windowHeight);

  // 設定中文字型
  textFont("Noto Sans TC");

  // 設定矩形從左上角繪製
  rectMode(CORNER);

  // 預設不繪製外框
  noStroke();

  // 建立全螢幕按鈕
  fullscreenButton = createButton("進入全螢幕");

  // 設定全螢幕按鈕大小
  fullscreenButton.style("font-size", "16px");

  // 設定全螢幕按鈕內距
  fullscreenButton.style("padding", "8px 14px");

  // 設定全螢幕按鈕位置
  fullscreenButton.position(16, 16);

  // 設定全螢幕按鈕點擊事件
  fullscreenButton.mousePressed(toggleFullscreen);

  // 初始化題目
  initializeQuestion();

  // 計算響應式版面
  updateLayout();
}

// 切換全螢幕模式
function toggleFullscreen() {
  // 取得目前全螢幕狀態
  const currentState = fullscreen();

  // 切換全螢幕狀態
  fullscreen(!currentState);

  // 如果即將進入全螢幕，隱藏按鈕
  if (!currentState) {
    fullscreenButton.hide();
  } else {
    // 如果即將離開全螢幕，顯示按鈕
    fullscreenButton.show();
  }
}

// 當視窗大小變更時執行
function windowResized() {
  // 重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);

  // 重新計算響應式版面
  updateLayout();
}

// 計算響應式版面
function updateLayout() {
  // 取得螢幕寬高比例
  const screenRatio = width / height;

  // 判斷是否為手機直向畫面
  const isPortrait = height > width;

  // 設定面板寬度
  panelWidth = min(width * 0.92, 920);

  // 設定面板高度
  panelHeight = min(height * 0.88, 760);

  // 手機直向時縮小面板高度
  if (isPortrait && height < 720) {
    panelHeight = height * 0.94;
  }

  // 確保面板不超出畫面高度
  panelHeight = min(panelHeight, height - 20);

  // 計算面板水平位置
  panelX = (width - panelWidth) / 2;

  // 計算面板垂直位置
  panelY = (height - panelHeight) / 2;

  // 設定題目文字大小
  questionFontSize = constrain(
    min(width * 0.045, height * 0.055),
    20,
    42
  );

  // 手機直向時縮小題目字體
  if (isPortrait && height < 700) {
    questionFontSize = constrain(height * 0.038, 17, 28);
  }

  // 設定選項文字大小
  optionFontSize = constrain(
    min(width * 0.032, height * 0.042),
    16,
    30
  );

  // 手機直向時縮小選項文字
  if (isPortrait && height < 700) {
    optionFontSize = constrain(height * 0.027, 15, 22);
  }

  // 設定小型文字大小
  smallFontSize = constrain(
    min(width * 0.022, height * 0.03),
    14,
    24
  );

  // 設定選項寬度
  optionWidth = min(panelWidth * 0.82, 720);

  // 計算選項水平位置
  optionX = width / 2 - optionWidth / 2;

  // 設定選項高度
  optionHeight = max(optionFontSize * 1.9, 46);

  // 手機直向時縮小選項高度
  if (isPortrait && height < 700) {
    optionHeight = max(optionFontSize * 1.65, 42);
  }

  // 計算可使用的選項區域高度
  const availableOptionHeight = panelHeight * 0.48;

  // 計算四個選項之間的合理間距
  optionGap = (availableOptionHeight - optionHeight * 4) / 3;

  // 設定選項間距的最小值
  optionGap = max(optionGap, 8);

  // 手機小螢幕時進一步縮小間距
  if (isPortrait && height < 700) {
    optionGap = 8;
  }

  // 計算選項起始位置
  optionStartY = panelY + panelHeight * 0.29;

  // 設定下一題按鈕寬度
  nextButtonWidth = min(panelWidth * 0.38, 260);

  // 設定下一題按鈕高度
  nextButtonHeight = max(optionHeight, 44);

  // 計算下一題按鈕水平位置
  nextButtonX = width / 2 - nextButtonWidth / 2;

  // 計算下一題按鈕垂直位置
  nextButtonY = panelY + panelHeight - nextButtonHeight - panelHeight * 0.07;

  // 設定重新開始按鈕寬度
  restartButtonWidth = nextButtonWidth;

  // 設定重新開始按鈕高度
  restartButtonHeight = nextButtonHeight;

  // 計算重新開始按鈕水平位置
  restartButtonX = width / 2 - restartButtonWidth / 2;

  // 計算重新開始按鈕垂直位置
  restartButtonY = panelY + panelHeight * 0.67;

  // 重新計算選項位置
  calculateOptionBoxes();
}

// 計算所有選項的位置
function calculateOptionBoxes() {
  // 清除舊的選項位置資料
  optionBoxes = [];

  // 逐一建立四個選項的位置資料
  for (let i = 0; i < 4; i++) {
    // 計算選項垂直位置
    const y = optionStartY + i * (optionHeight + optionGap);

    // 將選項位置加入陣列
    optionBoxes.push({
      x: optionX,
      y: y,
      width: optionWidth,
      height: optionHeight,
      drawnY: y
    });
  }
}

// 初始化題目
function initializeQuestion() {
  // 設定尚未作答
  answered = false;

  // 清除選擇的選項
  selectedOption = -1;

  // 清除答案正確狀態
  answerIsCorrect = false;

  // 清除彩帶
  confettiParticles = [];

  // 清除叉叉
  wrongCrossEffects = [];

  // 取得正確路線
  const correctLine = questions[currentQuestion].correctLine;

  // 取得所有錯誤路線
  const incorrectLines = allLines.filter(
    line => line !== correctLine
  );

  // 將錯誤路線隨機排序
  shuffle(incorrectLines, true);

  // 建立四個選項
  options = [
    correctLine,
    incorrectLines[0],
    incorrectLines[1],
    incorrectLines[2]
  ];

  // 將四個選項隨機排序
  shuffle(options, true);

  // 確保版面資料同步更新
  updateLayout();
}

// p5.js 主要繪圖函式
function draw() {
  // 繪製背景顏色
  background("#f4e285");

  // 如果正在顯示結果畫面
  if (showResult) {
    // 繪製結果畫面
    drawResultScreen();
  } else {
    // 繪製測驗畫面
    drawQuizScreen();
  }

  // 更新彩帶動畫
  updateConfetti();

  // 更新錯誤叉叉動畫
  updateWrongCrosses();
}

// 繪製測驗畫面
function drawQuizScreen() {
  // 繪製內容面板
  fill("#f0f0c9");

  // 移除面板外框
  noStroke();

  // 繪製面板
  rect(
    panelX,
    panelY,
    panelWidth,
    panelHeight,
    24
  );

  // 設定文字置中
  textAlign(CENTER, CENTER);

  // 設定文字顏色
  fill("#000000");

  // 設定題號文字大小
  textSize(smallFontSize);

  // 顯示題號
  text(
    "第 " + (currentQuestion + 1) + " 題／共 " + questions.length + " 題",
    width / 2,
    panelY + panelHeight * 0.08
  );

  // 設定題目文字大小
  textSize(questionFontSize);

  // 顯示題目
  text(
    questions[currentQuestion].station + "站屬於哪一條捷運線？",
    width / 2,
    panelY + panelHeight * 0.17
  );

  // 每次繪製前重新計算選項位置
  calculateOptionBoxes();

  // 繪製四個選項
  for (let i = 0; i < 4; i++) {
    // 取得目前選項資料
    const box = optionBoxes[i];

    // 判斷是否為正確答案
    const isCorrect =
      options[i] === questions[currentQuestion].correctLine;

    // 設定選項上下跳動量
    let jumpOffset = 0;

    // 設定選項預設顏色
    let optionColor = "#f4a259";

    // 如果已經作答
    if (answered) {
      // 如果是正確答案
      if (isCorrect) {
        // 設定正確答案顏色
        optionColor = "#8cb369";

        // 答錯時讓正確答案上下跳動
        if (!answerIsCorrect) {
          jumpOffset = sin(frameCount * 0.22) * 10;
        }
      }

      // 如果是使用者選錯的選項
      if (!answerIsCorrect && i === selectedOption) {
        // 設定錯誤選項顏色
        optionColor = "#bc4b51";
      }
    }

    // 更新實際繪製的 Y 座標
    box.drawnY = box.y + jumpOffset;

    // 設定選項顏色
    fill(optionColor);

    // 繪製選項方塊
    rect(
      box.x,
      box.drawnY,
      box.width,
      box.height,
      12
    );

    // 設定選項文字顏色
    fill("#000000");

    // 設定選項文字大小
    textSize(optionFontSize);

    // 顯示選項文字
    text(
      options[i],
      width / 2,
      box.drawnY + box.height / 2
    );
  }

  // 如果已作答，顯示下一題按鈕
  if (answered) {
    // 繪製下一題按鈕
    drawNextButton();
  }
}

// 繪製下一題按鈕
function drawNextButton() {
  // 設定按鈕顏色
  fill("#f4a259");

  // 繪製按鈕
  rect(
    nextButtonX,
    nextButtonY,
    nextButtonWidth,
    nextButtonHeight,
    12
  );

  // 設定按鈕文字顏色
  fill("#000000");

  // 設定按鈕文字大小
  textSize(optionFontSize);

  // 判斷目前是否為最後一題
  if (currentQuestion === questions.length - 1) {
    // 顯示查看結果
    text(
      "查看結果",
      width / 2,
      nextButtonY + nextButtonHeight / 2
    );
  } else {
    // 顯示下一題
    text(
      "下一題",
      width / 2,
      nextButtonY + nextButtonHeight / 2
    );
  }
}

// 繪製結果畫面
function drawResultScreen() {
  // 繪製結果面板
  fill("#f0f0c9");

  // 繪製面板
  rect(
    panelX,
    panelY,
    panelWidth,
    panelHeight,
    24
  );

  // 設定文字置中
  textAlign(CENTER, CENTER);

  // 設定文字顏色
  fill("#000000");

  // 設定標題文字大小
  textSize(questionFontSize * 1.2);

  // 顯示結束文字
  text(
    "測驗結束！",
    width / 2,
    panelY + panelHeight * 0.28
  );

  // 設定成績文字大小
  textSize(questionFontSize);

  // 顯示答對題數
  text(
    "你答對了 " + score + "／" + questions.length + " 題",
    width / 2,
    panelY + panelHeight * 0.43
  );

  // 設定重新開始按鈕顏色
  fill("#f4a259");

  // 繪製重新開始按鈕
  rect(
    restartButtonX,
    restartButtonY,
    restartButtonWidth,
    restartButtonHeight,
    12
  );

  // 設定重新開始文字顏色
  fill("#000000");

  // 設定重新開始文字大小
  textSize(optionFontSize);

  // 顯示重新開始
  text(
    "重新開始",
    width / 2,
    restartButtonY + restartButtonHeight / 2
  );
}

// 處理滑鼠點擊
function mousePressed() {
  // 取得目前時間
  const currentTime = millis();

  // 如果剛剛已經觸控過，就避免瀏覽器再次觸發滑鼠事件
  if (currentTime - lastTouchTime < 400) {
    return false;
  }

  // 處理點擊位置
  handleClick(mouseX, mouseY);

  // 阻止瀏覽器預設行為
  return false;
}

// 處理觸控事件
function touchStarted() {
  // 記錄目前觸控時間
  lastTouchTime = millis();

  // 如果沒有觸控點，就結束處理
  if (touches.length === 0) {
    return false;
  }

  // 取得第一個觸控點
  const touchPoint = touches[0];

  // 處理觸控位置
  handleClick(touchPoint.x, touchPoint.y);

  // 阻止瀏覽器預設行為
  return false;
}

// 處理滑鼠與觸控點擊
function handleClick(x, y) {
  // 如果正在顯示結果畫面
  if (showResult) {
    // 判斷是否點擊重新開始按鈕
    if (
      x >= restartButtonX &&
      x <= restartButtonX + restartButtonWidth &&
      y >= restartButtonY &&
      y <= restartButtonY + restartButtonHeight
    ) {
      // 回到第一題
      currentQuestion = 0;

      // 將分數歸零
      score = 0;

      // 關閉結果畫面
      showResult = false;

      // 初始化題目
      initializeQuestion();
    }

    // 結果畫面處理結束
    return;
  }

  // 如果尚未作答
  if (!answered) {
    // 逐一檢查四個選項
    for (let i = 0; i < optionBoxes.length; i++) {
      // 取得目前選項
      const box = optionBoxes[i];

      // 判斷點擊是否落在選項內
      if (
        x >= box.x &&
        x <= box.x + box.width &&
        y >= box.y &&
        y <= box.y + box.height
      ) {
        // 記錄選擇的選項
        selectedOption = i;

        // 設定已經作答
        answered = true;

        // 判斷答案是否正確
        answerIsCorrect =
          options[i] === questions[currentQuestion].correctLine;

        // 如果答對
        if (answerIsCorrect) {
          // 增加分數
          score++;

          // 從選項左右兩側產生彩帶
          spawnConfetti(box);
        } else {
          // 從錯誤選項左右兩側產生叉叉
          spawnWrongCrosses(box);
        }

        // 重新繪製畫面
        redraw();

        // 結束點擊處理
        return;
      }
    }

    // 尚未作答時不處理其他區域
    return;
  }

  // 判斷是否點擊下一題按鈕
  if (
    x >= nextButtonX &&
    x <= nextButtonX + nextButtonWidth &&
    y >= nextButtonY &&
    y <= nextButtonY + nextButtonHeight
  ) {
    // 如果還有下一題
    if (currentQuestion < questions.length - 1) {
      // 進入下一題
      currentQuestion++;

      // 初始化下一題
      initializeQuestion();
    } else {
      // 最後一題完成後顯示結果
      showResult = true;

      // 清除特效
      confettiParticles = [];
      wrongCrossEffects = [];
    }

    // 重新繪製畫面
    redraw();
  }
}

// 產生彩帶效果
function spawnConfetti(box) {
  // 清除舊彩帶
  confettiParticles = [];

  // 產生 100 個彩帶粒子
  for (let i = 0; i < 100; i++) {
    // 隨機決定從左側或右側噴出
    const side = random() < 0.5 ? -1 : 1;

    // 設定起始 X 座標
    const startX =
      side === -1
        ? box.x
        : box.x + box.width;

    // 設定起始 Y 座標
    const startY = box.drawnY + box.height / 2;

    // 建立彩帶粒子
    confettiParticles.push({
      // 設定粒子 X 座標
      x: startX,

      // 設定粒子 Y 座標
      y: startY,

      // 設定水平速度
      velocityX: side * random(2, 7),

      // 設定垂直速度
      velocityY: random(-8, 1),

      // 設定粒子大小
      size: random(5, 12),

      // 設定旋轉角度
      angle: random(TWO_PI),

      // 設定旋轉速度
      rotationSpeed: random(-0.2, 0.2),

      // 設定粒子顏色
      particleColor: random([
        "#e63946",
        "#457b9d",
        "#2a9d8f",
        "#f4a261",
        "#8338ec",
        "#ffbe0b"
      ]),

      // 設定透明度
      alpha: 255
    });
  }
}

// 更新彩帶動畫
function updateConfetti() {
  // 逐一處理彩帶
  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    // 取得目前彩帶
    const particle = confettiParticles[i];

    // 加入重力
    particle.velocityY += 0.18;

    // 更新水平位置
    particle.x += particle.velocityX;

    // 更新垂直位置
    particle.y += particle.velocityY;

    // 更新旋轉角度
    particle.angle += particle.rotationSpeed;

    // 降低透明度
    particle.alpha -= 3;

    // 儲存畫布狀態
    push();

    // 移動到粒子位置
    translate(particle.x, particle.y);

    // 旋轉粒子
    rotate(particle.angle);

    // 取得粒子顏色
    const particleColor = color(particle.particleColor);

    // 設定粒子顏色與透明度
    fill(
      red(particleColor),
      green(particleColor),
      blue(particleColor),
      particle.alpha
    );

    // 移除外框
    noStroke();

    // 繪製彩帶
    rect(
      0,
      0,
      particle.size,
      particle.size * 0.45
    );

    // 還原畫布狀態
    pop();

    // 如果粒子已經消失，就移除
    if (
      particle.alpha <= 0 ||
      particle.y > height + 80
    ) {
      confettiParticles.splice(i, 1);
    }
  }
}

// 產生錯誤叉叉
function spawnWrongCrosses(box) {
  // 清除舊錯誤叉叉
  wrongCrossEffects = [];

  // 建立一個新的叉叉效果
  wrongCrossEffects.push({
    // 記錄開始時間
    startTime: millis(),

    // 記錄錯誤選項位置
    box: box,

    // 記錄叉叉資料
    crosses: [],

    // 記錄下一批產生時間
    nextSpawnTime: 0
  });
}

// 更新叉叉動畫
function updateWrongCrosses() {
  // 逐一處理叉叉效果
  for (const effect of wrongCrossEffects) {
    // 計算動畫經過時間
    const elapsed = millis() - effect.startTime;

    // 1.5 秒內分批產生叉叉
    if (
      elapsed < 1500 &&
      elapsed >= effect.nextSpawnTime
    ) {
      // 隨機決定本批叉叉數量
      const amount = floor(random(3, 7));

      // 建立本批叉叉
      for (let i = 0; i < amount; i++) {
        // 隨機決定叉叉出現在左側或右側
        const side = random() < 0.5 ? -1 : 1;

        // 設定叉叉水平位置
        const crossX =
          side === -1
            ? effect.box.x - random(20, 90)
            : effect.box.x + effect.box.width + random(20, 90);

        // 設定叉叉垂直位置
        const crossY =
          effect.box.drawnY +
          effect.box.height / 2 +
          random(-effect.box.height, effect.box.height);

        // 將叉叉加入陣列
        effect.crosses.push({
          // 設定叉叉 X 座標
          x: crossX,

          // 設定叉叉 Y 座標
          y: crossY,

          // 設定叉叉大小
          size: random(5, 11),

          // 設定叉叉出現時間
          bornTime: millis(),

          // 設定叉叉透明度
          alpha: 255
        });
      }

      // 設定下一批叉叉的出現時間
      effect.nextSpawnTime += 160;
    }

    // 逐一繪製叉叉
    for (const cross of effect.crosses) {
      // 計算叉叉存在時間
      const age = millis() - cross.bornTime;

      // 讓叉叉逐漸消失
      cross.alpha = map(age, 0, 1500, 255, 0);

      // 儲存畫布狀態
      push();

      // 設定叉叉顏色
      stroke(188, 75, 81, cross.alpha);

      // 設定叉叉線條粗細
      strokeWeight(3);

      // 繪製第一條斜線
      line(
        cross.x - cross.size,
        cross.y - cross.size,
        cross.x + cross.size,
        cross.y + cross.size
      );

      // 繪製第二條斜線
      line(
        cross.x - cross.size,
        cross.y + cross.size,
        cross.x + cross.size,
        cross.y - cross.size
      );

      // 還原畫布狀態
      pop();
    }

    // 移除已經消失的叉叉
    effect.crosses = effect.crosses.filter(
      cross => millis() - cross.bornTime < 1500
    );
  }

  // 移除已完成的叉叉效果
  wrongCrossEffects = wrongCrossEffects.filter(
    effect =>
      millis() - effect.startTime < 1500 ||
      effect.crosses.length > 0
  );
}