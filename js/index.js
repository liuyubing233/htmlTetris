(function () {
  // 获取窗口的宽高
  const WindowWidth = window.innerWidth
  const WindowHeight = window.innerHeight
  const NodeIndexBox = document.querySelector('.index-box') // 最外部的盒子
  const NodeCubeBox = document.querySelector('.cube-box') // 方块盒子渲染区域
  const NodeNextCubeBox = document.querySelector('.the-next-cube') // 下一个方块的显示盒子
  const NodeButtonStart = document.querySelector('#button-start') // 开始按钮
  const NodeButtonPause = document.querySelector('#button-pause') // 暂停继续按钮
  const NodeFractionNow = document.querySelector('.now-fraction') // 当前得分
  const NodeFractionMax = document.querySelector('.max-fraction') // 最高得分
  const NodeLevel = document.querySelector('.level-span') // 等级
  const NodeButtonRight = document.querySelector('.button-right')
  const NodeCubeBoxContent = document.querySelector('.cube-box-content') // 游戏运行填入盒子区域
  const NodeGameButtonBox = document.querySelector('.game-buttons') // 游戏按钮盒子

  // 如果视窗WindowWidth < WindowHeight / 1.8则将内容（NodeIndexBox）扩展到100%
  NodeIndexBox.style = WindowWidth < WindowHeight / 1.8
    ? `height: 100%; width: 100%;`
    : `height: ${WindowHeight}px; width: ${WindowHeight / 1.8}px; margin: 0 auto;`

  const _conWidth = NodeCubeBox.clientWidth // 定义绘制区域的宽度
  const _conHeight = _conWidth * 2 // 定义绘制区域的高度
  const _columns = 10 // 列数
  const _rows = _columns * 2 // 行数
  const _cubeWidth = _conWidth / _columns - 1 // 方块边长

  /* 下一个方块显示区域 样式获取绘制 start */
  const _nextWidth = NodeNextCubeBox.clientWidth
  const _nextColumns = 6
  const _nextRows = 6
  const _nextCubeWidth = _nextWidth / _nextColumns - 1
  /* 下一个方块显示区域 样式获取绘制 end */

  NodeButtonRight.style.width = NodeButtonRight.clientHeight + 'px'

  let cubeArray = new Array() // 方块数组
  let moveTime = 600 // 下落速度（moveTime ms 下落一次）
  let isSpeedUp = false // 是否已经加速
  let isSpeedUpTime = 0 // 加速按钮时间,解决一直点按暂停的问题
  let isLiftUpTime = 0 // 加速按钮抬起时间
  let buttonSpeedUpTime = 0 // 页面按钮点击加速时间
  let buttonSpeedUPTimeout = undefined
  let thisCube = undefined // 当前实心方块
  let nextCubeType = undefined // 下一个方块种类
  let interval = undefined // 定时
  let keyCanOperate = false // 键盘是否可以操作
  let gameOverRestart = false // 是否是游戏结束重新开始
  let level = 1 // 游戏等级
  let isPause = false // 是否暂停
  let isPauseMoveTime = 600 // 暂停时的下落速度

  // 游戏等级
  const LEVEL_ARRAY = [
    { level: 1, moveTime: 600, min: 0, max: 5000, },
    { level: 2, moveTime: 500, min: 5000, max: 10000, },
    { level: 3, moveTime: 400, min: 10000, max: 20000, },
    { level: 4, moveTime: 300, min: 20000, max: 40000, },
    { level: 5, moveTime: 200, min: 40000, max: 100000, },
    { level: 6, moveTime: 100, min: 100000, max: 200000, },
    { level: 7, moveTime: 50, min: 200000, max: Infinity, },
  ]

  // 方块种类OBJ
  const CUBE_TYPE = {
    0: CUBE_I,
    1: CUBE_T,
    2: CUBE_Z,
    3: CUBE_Z_MIRROR,
    4: CUBE_O,
    5: CUBE_L,
    6: CUBE_L_MIRROR,
  }

  // 按键方式OBJ
  const KEY_DOWN_CODE_TYPE = {
    37: () => KEY_DOWN_MOVE(-1), // 键盘左键 方块左移
    39: () => KEY_DOWN_MOVE(1), // 键盘右键 方块右移
    40: () => KEY_DOWN_SPEED_UP(), // 键盘下键 加速移动
    38: () => KEY_DOWN_ROTATE(1), // 键盘上键 方块顺时针旋转
    32: () => KEY_DOWN_DOWN(), // 键盘空格 方块快速下到底部
    80: () => KEY_DOWN_PAUSE(), // 键盘p键 暂停
  }

  // 按钮方式
  const BUTTON_DOWN_TYPE = {
    'code-to-bottom': () => KEY_DOWN_DOWN(),
    'code-rotate': () => KEY_DOWN_ROTATE(1),
    'code-left': () => KEY_DOWN_MOVE(-1),
    'code-right': () => KEY_DOWN_MOVE(1),
    'code-speed-up': () => BUTTON_SPEED_UP(),
    'button-pause': () => KEY_DOWN_PAUSE(),
    'button-start': () => GAME_START()
  }

  // 键盘抬起方式
  const KEY_UP_CODE_TYPE = {
    40: () => KEY_UP_SLOW_DOWN(), // 抬起下键 速度变慢
  }

  // 空心方块
  const CUBE_HOLLOW = (w, className) => {
    return `<div style="width: ${w}px;height: ${w}px;display: inline-block;" class="cube-hollow ${className || ''}"></div>`
  }

  // 实心方块
  const CUBE_SOLID = (w, className) => {
    return `<div style="width: ${w}px;height: ${w}px;display: inline-block;" class="cube-solid ${className || ''}"></div>`
  }

  // 游戏开始
  function GAME_START() {
    if (!keyCanOperate) {
      thisCube = undefined
      gameOverRestart && init()
      keyCanOperate = true
      NodeButtonStart.disabled = true
      NodeButtonPause.disabled = false
      moveTime = 600
      level = 1
      NodeLevel.innerText = 1
      produceCube()
      initInterval(600)
    }
  }

  // 键盘按键按下
  document.onkeydown = ({ keyCode }) => {
    if (keyCode === 80 && !NodeButtonPause.disabled) {
      KEY_DOWN_CODE_TYPE[keyCode].call(this)
    } else {
      keyCanOperate && KEY_DOWN_CODE_TYPE.hasOwnProperty(keyCode) && KEY_DOWN_CODE_TYPE[keyCode].call(this)
    }
  }
  // 键盘按键抬起
  document.onkeyup = ({ keyCode }) => {
    keyCanOperate && KEY_UP_CODE_TYPE.hasOwnProperty(keyCode) && KEY_UP_CODE_TYPE[keyCode].call(this)
  }

  // 页面按钮监听
  NodeGameButtonBox.onclick = (e) => {
    const idName = e.target.id || ''
    if (idName === 'button-pause' || idName === 'button-start') {
      BUTTON_DOWN_TYPE[idName].call(this)
    } else if (keyCanOperate) {
      BUTTON_DOWN_TYPE.hasOwnProperty(idName) && BUTTON_DOWN_TYPE[idName].call(this)
      navigator.vibrate(50)
    }
  }

  // 初始化定时器
  function initInterval(intervalTime) {
    interval = window.setInterval(() => {
      cubeDrop()
    }, intervalTime)
  }

  // 初始化
  function init() {
    initCubeArray()
    getNextCubeType()
    printCube()
    getMaxFraction()
    printNextCube()
  }
  init()

  // 获取最大得分
  function getMaxFraction() {
    const fraction = localStorage.getItem('maxFraction') || 0
    NodeFractionMax.innerText = fraction
  }

  // 方块绘制
  function printCube() {
    let strCubes = ''
    // 循环行数
    for (let i = 0; i < _rows; i++) {
      // 循环每行几列
      for (let j = 0; j < _columns; j++) {
        let k = 0
        if (thisCube !== undefined) {
          for (k = 0; k < thisCube.x.length; k++) {
            // 如果当前行等于生成方块的y
            // 如果当前列等于生成方块的x
            if (i === thisCube.y[k] && j === thisCube.x[k]) {
              // 跳出循环
              break
            }
          }
        }
        // 如果循环的k不等于x的长度
        if (thisCube !== undefined && k !== thisCube.x.length) {
          // 渲染实心方块
          strCubes += CUBE_SOLID(_cubeWidth, thisCube.className)
        } else {
          // 按照现有方块渲染
          strCubes += cubeArray[i][j]
        }
      }
      strCubes += `<br />`
    }
    NodeCubeBoxContent.innerHTML = strCubes
  }

  // 显示下一个方块
  function printNextCube() {
    let strCubes = ''
    const nextCube = nextCubeType !== undefined ? getCubeByType(nextCubeType) : undefined
    if (nextCube !== undefined) {
      // 修改样式显示
      for (let i = 0; i < nextCube.x.length; i++) {
        nextCube.x[i] = nextCube.x[i] - 2
        nextCube.y[i] = nextCube.y[i] + 4
      }
    }
    // 循环行数 同渲染方块运动页面
    for (let i = 0; i < _nextRows; i++) {
      // 循环每行几列
      for (let j = 0; j < _nextColumns; j++) {
        let k = 0
        if (nextCube !== undefined) {
          for (k = 0; k < nextCube.x.length; k++) {
            // 如果当前行等于生成方块的y
            // 如果当前列等于生成方块的x
            if (i === nextCube.y[k] && j === nextCube.x[k]) {
              // 跳出循环
              break
            }
          }
        }
        // 如果循环的k不等于x的长度
        if (nextCube !== undefined && k !== nextCube.x.length) {
          // 渲染实心方块
          strCubes += CUBE_SOLID(_nextCubeWidth, nextCube.className)
        } else {
          strCubes += CUBE_HOLLOW(_nextCubeWidth, 'cube-hollow-next')
        }
      }
      strCubes += `<br />`
    }
    NodeNextCubeBox.innerHTML = strCubes
  }

  // 初始化方块数组（全部为空心块）
  function initCubeArray() {
    for (let i = 0; i < _rows; i++) {
      cubeArray[i] = new Array()
      for (let j = 0; j < _columns; j++) {
        cubeArray[i][j] = CUBE_HOLLOW(_cubeWidth, 'cube-hollow-gaming') // 空心快
      }
    }
  }

  // 获取方块种类
  function getCubeByType(type) {
    const cube = new Object()
    cube.x = new Array() // 每个方块横向（x）位置
    cube.y = new Array() // 每个方块纵向（y）位置
    return CUBE_TYPE[type].call(this, cube)
  }

  // 在指定位置画方块
  function drawChat(x, y, s) {
    cubeArray[y][x] = s
  }

  // 删除指定位置方块 将指定位置方块替换为空心块
  function removeChat(x, y) {
    cubeArray[y][x] = CUBE_HOLLOW(_cubeWidth, 'cube-hollow-gaming')
  }

  // 获取指定位置方块
  function getChat(x, y) {
    return cubeArray[y][x]
  }

  // 判断指定位置方块是否是实心方块
  function chatIsSolid(x, y) {
    if (cubeArray[y] && cubeArray[y][x]) {
      return cubeArray[y][x].includes('cube-solid')
    } else {
      return false
    }
  }

  // 是否有碰撞 dx dy为偏移量 即移动的距离
  function isBump(dx, dy) {
    for (let i = 0; i < thisCube.x.length; i++) {
      // _columns = 10, x >= 0, x <= 9
      // 下一步运动左右超出
      // 下一步运动超出高度
      // 下一步运动存在实心方块
      if (thisCube.x[i] + dx < 0 || thisCube.x[i] + dx > _columns - 1 || thisCube.y[i] + dy >= _rows || chatIsSolid(thisCube.x[i] + dx, thisCube.y[i] + dy)) {
        return true
      }
    }
    return false
  }

  // 方块下落
  function cubeDrop() {
    isBump(0, 1) && cubeFixed()
    drop()
  }

  // 方块下落运动
  function drop() {
    if (isBump(0, 1)) {
      return false
    }
    for (let i = 0; i < thisCube.x.length; i++) {
      thisCube.y[i]++
    }
    printCube()
    return true
  }

  // 方块固定
  function cubeFixed() {
    for (let i = 0; i < thisCube.x.length; i++) {
      // 如果方块移动距离小于0 则游戏结束
      if (thisCube.y[i] < 0) {
        gameOver()
        return
      }
      drawChat(thisCube.x[i], thisCube.y[i], CUBE_SOLID(_cubeWidth, thisCube.className))
    }
    produceCube()
    eliminateLine()
  }

  // 检测一行是否全部是实心方块
  function eliminateLine() {
    let removeLineNum = 0
    for (let i = 0; i < cubeArray.length; i++) {
      let solidNum = 0
      for (let j = 0; j < cubeArray[i].length; j++) {
        chatIsSolid(j, i) && (solidNum += 1)
      }
      if (solidNum === cubeArray[i].length) {
        removeLine(i)
        removeLineNum++
      }
    }
    // 如果消除了行则开始积分
    // 积分规则为 行数*100*行数
    if (removeLineNum) {
      const fraction = 100 * removeLineNum * removeLineNum
      const nowFraction = +NodeFractionNow.innerText
      NodeFractionNow.innerText = nowFraction + fraction
      updateLevel(nowFraction + fraction)
    }
  }

  // 提升难度
  function updateLevel(fraction) {
    const levelObj = LEVEL_ARRAY[level]
    if (fraction >= levelObj.min && fraction < levelObj.max && level !== levelObj.level && moveTime !== levelObj.moveTime) {
      moveTime = levelObj.moveTime
      level = levelObj.level
      NodeLevel.innerText = levelObj.level
      window.clearInterval(interval)
      initInterval(levelObj.moveTime)
    }
  }

  // 删除一行 y为行坐标
  function removeLine(y) {
    // 截取掉删除的行
    cubeArray.splice(y, 1)
    const colArr = new Array()
    for (let j = 0; j < _columns; j++) {
      colArr[j] = CUBE_HOLLOW(_cubeWidth, 'cube-hollow-gaming') // 空心快
    }
    // 在前面插入空白方块
    cubeArray.unshift(colArr)
  }

  // 产生方块
  function produceCube() {
    thisCube = getCubeByType(nextCubeType)
    getNextCubeType()
    printNextCube()
  }

  // 随机获取下一次方块种类
  function getNextCubeType() {
    const randomType = Math.round(Math.random() * 6)
    if (nextCubeType !== randomType) {
      nextCubeType = randomType
    } else {
      getNextCubeType()
      return
    }
  }

  // 游戏结束
  function gameOver() {
    keyCanOperate = false
    gameOverRestart = true
    window.clearInterval(interval)
    thisCube = GAME_OVER_CUBES()
    printCube()
    NodeButtonPause.disabled = true
    NodeButtonStart.disabled = false
    NodeButtonStart.innerText = '重新开始'
    const fraction = +NodeFractionNow.innerText
    const fractionMax = localStorage.getItem('maxFraction') || 0
    if (fraction > fractionMax) {
      localStorage.setItem('maxFraction', fraction)
      NodeFractionMax.innerText = fraction
    }
  }

  // 键盘操作 方块横移 左-1 右1
  function KEY_DOWN_MOVE(moveX) {
    !isBump(moveX, 0) && move(moveX)
    printCube()
  }

  // 方块横移
  function move(moveX) {
    for (let i = 0; i < thisCube.x.length; i++) {
      thisCube.x[i] += moveX
    }
  }

  // 键盘操作 暂停 继续
  function KEY_DOWN_PAUSE() {
    if (isPause) {
      isPause = false
      keyCanOperate = true
      NodeButtonPause.innerText = '暂停'
      moveTime = isPauseMoveTime
      initInterval(isPauseMoveTime)
    } else {
      isPause = true
      keyCanOperate = false
      NodeButtonPause.innerText = '继续'
      isPauseMoveTime = moveTime
      window.clearInterval(interval)
    }
  }

  // buttonSpeedUpTime
  // 按钮操作 点击加速
  function BUTTON_SPEED_UP() {
    const nowTime = +new Date()
    if (nowTime > buttonSpeedUpTime + 200) {
      window.clearInterval(interval)
      initInterval(moveTime >= 100 ? 100 : moveTime / 2)
      buttonSpeedUPTimeout && clearTimeout(buttonSpeedUPTimeout)
      buttonSpeedUPTimeout = setTimeout(() => {
        window.clearTimeout(buttonSpeedUPTimeout)
        window.clearInterval(interval)
        initInterval(moveTime)
      }, 200)
    }
  }

  // isSpeedUpTime
  // 键盘操作 移动加速
  function KEY_DOWN_SPEED_UP() {
    if (!isSpeedUp) {
      isSpeedUp = true
      const nowTime = +new Date()
      if (nowTime > isSpeedUpTime + 200) {
        window.clearInterval(interval)
        initInterval(moveTime / 2)
      }
      isSpeedUpTime = nowTime
    }
  }

  // isLiftUpTime
  // 键盘抬起 减速
  function KEY_UP_SLOW_DOWN() {
    if (isSpeedUp) {
      isSpeedUp = false
      const nowTime = +new Date()
      if (nowTime > isLiftUpTime + 200) {
        window.clearInterval(interval)
        initInterval(moveTime)
      }
      isLiftUpTime = nowTime
    }
  }

  // 键盘操作 方块下到底部
  function KEY_DOWN_DOWN() {
    while (drop()) { }
    cubeFixed()
  }

  // 键盘操作 方块旋转 顺时针1 逆时针-1
  function KEY_DOWN_ROTATE(r) {
    if (thisCube.center === -1) {
      // 中心点是-1时不能旋转
      return
    }
    rotate(r)
    // 如果旋转后发生碰撞则转回去
    isBump(0, 0) && rotate(-r)
    printCube()
  }

  // 方块旋转
  function rotate(r) {
    // 根据中心点选取中心
    const rX = thisCube.x[thisCube.center]
    const rY = thisCube.y[thisCube.center]
    for (let i = 0; i < thisCube.x.length; i++) {
      // 旋转前的方块位置
      const nX = thisCube.x[i]
      const nY = thisCube.y[i]
      if (r === 1) {
        // 顺时针 计算四元方程组
        thisCube.x[i] = rX + rY - nY
        thisCube.y[i] = nX + rY - rX
      } else {
        // 逆时针
        thisCube.x[i] = nY + rX - rY
        thisCube.y[i] = rX + rY - nX
      }
    }
  }

  // 以下为方块种类
  /**
   * I型
   * ■■■■
   */
  function CUBE_I(cube) {
    for (let i = 0; i <= 3; i++) {
      cube.x[i] = _columns / 2 + i - 2
      cube.y[i] = -1
    }
    cube.center = 1 // 方块的旋转中心
    cube.className = 'cube-I'
    return cube
  }

  /**
   * T型
   *  ■
   * ■■■
   */
  function CUBE_T(cube) {
    for (let i = 0; i < 3; i++) {
      cube.x[i] = _columns / 2 - 1 + i
      cube.y[i] = -1
    }
    cube.x[3] = _columns / 2 // T型顶部x位置
    cube.y[3] = -2 // T型顶部y位置
    cube.center = 1 // 方块的旋转中心
    cube.className = 'cube-T'
    return cube
  }

  /**
   * Z型
   * ■■
   *  ■■
   */
  function CUBE_Z(cube) {
    for (let i = 0; i <= 3; i++) {
      if (i < 2) {
        cube.x[i] = _columns / 2 + i
        cube.y[i] = -1
      } else {
        cube.x[i] = _columns / 2 + i - 3
        cube.y[i] = -2
      }
    }
    cube.center = 0 // 方块的旋转中心
    cube.className = 'cube-Z'
    return cube
  }

  /**
   * 镜像Z型
   *  ■■
   * ■■
   */
  function CUBE_Z_MIRROR(cube) {
    for (let i = 0; i <= 3; i++) {
      if (i < 2) {
        cube.x[i] = _columns / 2 + i - 1
        cube.y[i] = -1
      } else {
        cube.x[i] = _columns / 2 + i - 2
        cube.y[i] = -2
      }
    }
    cube.center = 1 // 方块的旋转中心
    cube.className = 'cube-Z-mirror'
    return cube
  }

  /**
   * O型
   * ■■
   * ■■
   */
  function CUBE_O(cube) {
    for (let i = 0; i <= 3; i++) {
      if (i < 2) {
        cube.x[i] = _columns / 2 + i - 1
        cube.y[i] = -1
      } else {
        cube.x[i] = _columns / 2 + i - 3
        cube.y[i] = -2
      }
    }
    cube.center = -1 // 0型不能旋转
    cube.className = 'cube-O'
    return cube
  }

  /**
   * L型
   *   ■
   * ■■■
   */
  function CUBE_L(cube) {
    for (let i = 0; i < 3; i++) {
      cube.x[i] = _columns / 2 + i - 1
      cube.y[i] = -1
    }
    cube.x[3] = _columns / 2 + 1
    cube.y[3] = -2
    cube.center = 1 // 方块的旋转中心
    cube.className = 'cube-L'
    return cube
  }

  /**
   * 镜像L型
   * ■
   * ■■■
   */
  function CUBE_L_MIRROR(cube) {
    for (let i = 0; i < 3; i++) {
      cube.x[i] = _columns / 2 + i - 1
      cube.y[i] = -1
    }
    cube.x[3] = _columns / 2 - 1
    cube.y[3] = -2
    cube.center = 1 // 方块的旋转中心
    cube.className = 'cube-L-mirror'
    return cube
  }

  // game over 显示块
  function GAME_OVER_CUBES() {
    const cube = new Object()
    cube.x = new Array()
    cube.y = new Array()
    cube.center = -1
    cube.className = 'game-over-cubes'
    // G 14个 0~13
    for (let i = 0; i <= 13; i++) {
      if (i <= 3) {
        cube.x[i] = i
        cube.y[i] = 0
      }
      if (i >= 10) {
        cube.x[i] = 13 - i
        cube.y[i] = 4
      }
      if (i >= 4 && i <= 6) {
        cube.x[i] = 0
        cube.y[i] = i - 3
      }
      if (i >= 7 && i <= 8) {
        cube.x[i] = 3
        cube.y[i] = i - 5
      }
    }
    cube.x[9] = 2
    cube.y[9] = 2

    // A 12个 14 ~ 25
    for (let i = 14; i <= 21; i++) {
      if (i >= 14 && i <= 17) {
        cube.x[i] = 23 - i
        cube.y[i] = 0
      }
      if (i >= 18 && i <= 21) {
        cube.x[i] = 27 - i
        cube.y[i] = 2
      }
    }
    cube.x[22] = 6
    cube.y[22] = 1
    cube.x[23] = 6
    cube.y[23] = 3
    cube.x[24] = 9
    cube.y[24] = 1
    cube.x[25] = 9
    cube.y[25] = 3

    // M 14个 26~39
    for (let i = 26; i <= 39; i++) {
      if (i >= 26 && i <= 30) {
        cube.x[i] = 30 - i
        cube.y[i] = 6
      }
      if (i >= 31 && i <= 33) {
        cube.x[i] = 0
        cube.y[i] = 40 - i
      }
      if (i >= 34 && i <= 36) {
        cube.x[i] = 2
        cube.y[i] = 43 - i
      }
      if (i >= 37 && i <= 39) {
        cube.x[i] = 4
        cube.y[i] = 46 - i
      }
    }

    // E 13个 40~52
    for (let i = 40; i <= 50; i++) {
      if (i >= 40 && i <= 43) {
        cube.x[i] = 49 - i
        cube.y[i] = 5
      }
      if (i >= 44 && i <= 46) {
        cube.x[i] = 52 - i
        cube.y[i] = 7
      }
      if (i >= 47 && i <= 50) {
        cube.x[i] = 56 - i
        cube.y[i] = 9
      }
    }
    cube.x[51] = 6
    cube.y[51] = 6
    cube.x[52] = 6
    cube.y[52] = 8

    // o 9个 53~60
    for (let i = 53; i <= 58; i++) {
      if (i >= 53 && i <= 55) {
        cube.x[i] = 56 - i
        cube.y[i] = 11
      }
      if (i >= 56 && i <= 58) {
        cube.x[i] = 59 - i
        cube.y[i] = 13
      }
    }
    cube.x[59] = 1
    cube.y[59] = 12
    cube.x[60] = 3
    cube.y[60] = 12

    // v 5个 61~65
    for (let i = 61; i <= 64; i++) {
      if (i >= 61 && i <= 62) {
        cube.x[i] = 6
        cube.y[i] = 73 - i
      }
      if (i >= 63 && i <= 64) {
        cube.x[i] = 8
        cube.y[i] = 75 - i
      }
    }
    cube.x[65] = 7
    cube.y[65] = 13

    // E 13个 66~78
    for (let i = 66; i <= 76; i++) {
      if (i >= 66 && i <= 69) {
        cube.x[i] = 69 - i
        cube.y[i] = 15
      }
      if (i >= 70 && i <= 72) {
        cube.x[i] = 72 - i
        cube.y[i] = 17
      }
      if (i >= 73 && i <= 76) {
        cube.x[i] = 76 - i
        cube.y[i] = 19
      }
    }
    cube.x[77] = 0
    cube.y[77] = 16
    cube.x[78] = 0
    cube.y[78] = 18

    // R 13个 79~91
    for (let i = 79; i <= 89; i++) {
      if (i >= 79 && i <= 83) {
        cube.x[i] = 6
        cube.y[i] = 98 - i
      }
      if (i >= 84 && i <= 85) {
        cube.x[i] = 92 - i
        cube.y[i] = 15
      }
      if (i >= 86 && i <= 87) {
        cube.x[i] = 86 + 8 - i
        cube.y[i] = 17
      }
      if (i >= 88 && i <= 89) {
        cube.x[i] = 9
        cube.y[i] = 17 + 88 - i
      }
    }
    cube.x[90] = 8
    cube.y[90] = 18
    cube.x[91] = 9
    cube.y[91] = 19
    return cube
  }
})()