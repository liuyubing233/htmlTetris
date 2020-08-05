/**
 * 底部按钮样式设置js
 */
(function () {
  const NodeButtonCenter = document.querySelector('.button-center') // 操作按钮盒子
  const NodeButtonTop = document.querySelector('#button-top div')
  const NodeButtonLeft = document.querySelector('#button-left div')
  const NodeButtonRight = document.querySelector('#button-right div')
  const NodeButtonDown = document.querySelector('#button-down div')
  const NodeButtonSpace = document.querySelector('#button-space div')

  /* 操作按钮盒子样式 start */
  NodeButtonCenter.style.width = NodeButtonCenter.clientHeight + 'px'
  /* 操作按钮盒子样式 end */
  const buttonWidth = NodeButtonCenter.clientHeight / 3

  NodeButtonTop.style = `width: 0;height: 0;border-left: ${buttonWidth / 2}px solid transparent;border-right: ${buttonWidth / 2}px solid transparent;border-bottom: ${buttonWidth}px solid red;`
  NodeButtonLeft.style = `width: 0;height: 0;border-top: ${buttonWidth / 2}px solid transparent;border-right: ${buttonWidth}px solid red;border-bottom: ${buttonWidth / 2}px solid transparent;`
  NodeButtonRight.style = `width: 0;height: 0;border-top: ${buttonWidth / 2}px solid transparent;border-left: ${buttonWidth}px solid red;border-bottom: ${buttonWidth / 2}px solid transparent;`
  NodeButtonDown.style = `width: 0;height: 0;border-left: ${buttonWidth / 2}px solid transparent;border-right: ${buttonWidth / 2}px solid transparent;border-top: ${buttonWidth}px solid red;`
  NodeButtonSpace.style = `width: ${buttonWidth}px;height: ${buttonWidth}px; background: red;`

})()