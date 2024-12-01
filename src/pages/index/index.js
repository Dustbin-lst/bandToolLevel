import sensor from "@system.sensor"
export default {
  // 页面级组件的数据模型，影响传入数据的覆盖机制：private内定义的属性不允许被覆盖
  private: {
    pointX: 0,
    pointY: 0,
    deg: "0°", //显示角度
    vDeg: 0, //棒子的角度
    time: "09:28",
    start_angle: 0, //进度条起始角度
    angle_nagative: false, //角度是否为负数
    angle: 0, //进度条的长度
    isVertical: false
  },

  onInit() {
    //更新时间
    const now = new Date()
        this.time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        setTimeout(() => setInterval(() => {
          const now = new Date()
            this.time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        }, 1000), 1000 - Date.now() % 1000)
    sensor.subscribeAccelerometer({
      interval: "ui",
      callback: ({x, y, z}) => {
        //把重力传感器数据转成显示数据
        const g = x ** 2 + y ** 2 + z ** 2
        if (g > 150) {
          this.deg = "OverLoad"
          return
        }
        this.pointX = (x / Math.sqrt(g)) * 240 + 233
        this.pointY = (-y / Math.sqrt(g)) * 240 + 233
        const tdeg = deg(Math.acos(Math.abs(z) / Math.sqrt(g)))
        if (tdeg < 60) {
          this.start_angle = 0
          this.deg = Math.round(tdeg) + "°"
          this.angle = 0
          this.isVertical = false
        } else {
          this.isVertical = true
          const vDeg = Math.atan2(x, y)
          this.vDeg = deg(vDeg)
          if (vDeg > -Math.PI / 4 && vDeg <= Math.PI / 4) {
            this.start_angle = 0
            this.angle_nagative = vDeg > 0
            this.angle = Math.abs(vDeg) * 12.5
            this.deg = Math.round(Math.abs(this.vDeg)) + "°"
          } else if (vDeg > Math.PI / 4 && vDeg <= (Math.PI / 4) * 3) {
            this.start_angle = 90
            this.angle_nagative = vDeg - Math.PI / 2 > 0
            this.angle = Math.abs(vDeg - Math.PI / 2) * 12.5
            this.deg = Math.round(Math.abs(this.vDeg - 90)) + "°"
          } else if ((vDeg > (-Math.PI / 4) * 3) & (vDeg <= -Math.PI / 4)) {
            this.start_angle = 270
            this.angle_nagative = vDeg + Math.PI / 2 > 0
            this.angle = Math.abs(vDeg + Math.PI / 2) * 12.5
            this.deg = Math.round(Math.abs(this.vDeg + 90)) + "°"
          } else {
            this.start_angle = 180
            this.angle_nagative = vDeg < 0
            this.angle = Math.abs(Math.PI - Math.abs(vDeg)) * 12.5
            this.deg = Math.round(Math.abs(180 - Math.abs(this.vDeg))) + "°"
          }
        }
        if (this.deg == "0°") this.angle = 100
      }
    })
  },
  onDestroy() {
    sensor.unsubscribeAccelerometer()
  },
  exit(a) {
    //返回
    if (a.direction == "right") {
      this.$app.exit()
    }
  },
  onBackPress() {
    this.exit({direction: "right"})
    return true
  }
}
function deg(rad) { return rad * 180 / Math.PI }