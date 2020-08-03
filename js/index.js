(function () {

  const indexBox = document.querySelector('.index-box')
  const tetrisContent = document.querySelector('.tetris-content')
  const conWidth = 300
  const conHeight = conWidth * 2
  tetrisContent.style = `width: ${conWidth}px; height: ${conHeight}px`

  const cubeMoveBox = document.createElement('div')
  cubeMoveBox.className = 'cube-move-box'

  // 竖向分割线
  const verticalNum = 12
  const lineGap = conWidth / (verticalNum + 1)
  for (var i = 0; i < verticalNum; i++) {
    const vertical = document.createElement('div')
    vertical.className = 'vertical'
    vertical.style = `top: 0; left: ${lineGap * (i + 1)}px`
    cubeMoveBox.appendChild(vertical)
  }

  // 横向分割线
  const horizontalNum = (conHeight / lineGap) - 1
  for (var i = 0; i < horizontalNum; i++) {
    const vertical = document.createElement('div')
    vertical.className = 'horizontal'
    vertical.style = `top: ${lineGap * (i + 1)}px; left: 0px`
    cubeMoveBox.appendChild(vertical)
  }
  console.log(conHeight / lineGap)


  tetrisContent.appendChild(cubeMoveBox)

  // const allVertical = document.querySelectorAll('.vertical')
  // console.log(allVertical)
  // allVertical.forEach((div, index) => {
  //   div.style = `top: 0; left: ${(conWidth / 13) * (index + 1)}px`
  // })






  // const cubeI = document.createElement('div')
  function cubeI() {
    const cube = document.createElement('div')


    return cube
  }




})()