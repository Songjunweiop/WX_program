const app = getApp() // 全局APP
let that = null // 页面this指针
Page({
  data: {
    spage: 0, // 切换页面开始，勿改
    epage: 0, // 切换页面结束，勿改
    status: 0, // 报名状态
    form: {}, // 报名信息填写
    info: {
      start: {
        title: '婚宴', // 活动名称
        local: '湖北·恩施', // 地点
        time: '5/20', // 时间
        hold: 'You had me at Hello' // 下方的举办方
      },
      invite: {
        title: '亲爱的各位亲朋好友：', // 邀请对象
        text: '"假如我来世上一遭，只为与你相聚一次，只为了亿万光年里的那一刹那﹐一刹那里所有的甜蜜和悲凄，那么就让一切该发生的，都在瞬间出现，让我俯首感谢所有星球的相助，让我与你相遇与你别离，完成了上帝所作的一首诗，然后再缓缓地老去"。兹定于2022年5月20日(星期五)在湖北咸丰世纪兴大酒店为宋俊威与石一君举行结婚典礼，敬备喜筵，恭请阁下光临，敬邀~'
      },
      meeting: [{ // 会议流程
        time: '9:00-9:30',
        text: '新娘和新郎迎接宾客'
      }, {
        time: '9:30-9:50',
        text: '主持人致辞'
      }, {
        time: '9:50-10:10',
        text: '双方父母致辞'
      }, {
        time: '10:10-10:30',
        text: '新人致辞、交换结婚戒指'
      }, {
        time: '10:30-10:30',
        text: '切蛋糕，嘉宾敬酒'
      }, {
        time: '10:30-11:10',
        text: '婚礼合影留念'
      }, {
        time: '11:10-12:00',
        text: '婚宴'
      }],
      address: {
        point: [29.685407,109.161928], // 地图展示的中心点
        marker: { // 地图当前标记点
          id: 0, // 标记点ID，不用变更
          latitude: 29.685407, // 标记点所在纬度
          longitude: 109.161928, // 标记点所在经度
          iconPath: '../../images/show.png', // 标记点图标，png或jpg类型
          width: '30', // 标记点图标宽度
          height: '38' // 标记点图标高度
        },
        local: '东升未来国际城市酒店三层宴会厅', // 地址
        time: '2022年5月20日（星期五）', // 举办时间
        tel: '13085191553' // 联系电话
      },
      review: { // 审核信息
        2: { // 报名成功信息
          image: '../../images/success.svg',
          title: '报名成功',
          des: '新郎新娘期待您的到来！'
        },
        1: { // 审核中信息
          image: '../../images/review.svg',
          title: '审核中',
          des: '报名信息正在审核中'
        }
      },
      form: { // 报名填写项
        name: {
          name: '姓名',
          place: '请填写您的姓名'
        },
        tel: {
          name: '手机',
          place: '请填写您的手机号码'
        },
        people: {
          name: '参与人数',
          place: '请填写参与人数'
        },
        retext: {
          name: '备注',
          place: '请填写备注'
        }
      }
    }
  },
  /**
   * 页面加载
   */
  onLoad () {
    that = this // 页面this指向指针变量
    const { windowHeight, windowWidth } = wx.getSystemInfoSync() // 获取系统屏幕信息
    that.setData({
      noserver: (windowWidth / windowHeight) > 0.6 // 如果宽高比大于0.6，则差不多平板感觉，不适合邀请函的UI
    })
    that.init() // 初始化
  },
  /**
   * 初始化加载信息
   */
  async init () {
    const result = await app.call({ name: 'get' }) // 调用云函数，获取当前用户报名状态
    that.setData({
      status: result // 将状态存入data，0-未报名，1-审核中，2-报名成功
    })
  },
  /**
   * 覆盖全局的上下页切换，用于地图和表单组件中，禁用全局上下翻页
   * @param {*} e 页面信息
   */
  changeno (e) {
    if (e.type === 'begin' || e.type === 'touchstart') { // 如果触发状态为触摸开始，或者地图移动开始
      that.no = true // 设置不干预变量为true
    } else if (e.type === 'end' || e.type === 'touchend') { // 如果触发状态未触摸结束，或地图移动结束
      setTimeout(function () { // 延迟100ms设置，防止低端机型的线程强占
        that.no = false // 设置不干预变量为false
      }, 100)
    }
  },
  /**
   * 上下翻页
   * @param {*} e 页面信息
   */
  movepage (e) {
    if (that.no === true) return // 如果不干预变量为true，说明禁用翻页
    const { clientY } = e.changedTouches[0] // 获取触摸点Y轴位置
    if (e.type === 'touchstart') { // 如果是触摸开始
      that.startmove = clientY // 记录一下开始点
    }
    if (e.type === 'touchend') { // 如果是触摸结束
      let { epage } = that.data // 获取data中的结束页
      const spage = that.data.epage // 将结束页传给开始页，要从这里动作
      if (that.startmove > clientY) { // 如果触摸点比初次高
        if (epage < 4) epage++ // 在结束页小于4时加1，因为一共就4页
      } else if (that.startmove < clientY) { // 如果触摸点比初次低
        if (epage > 0) epage-- // 在结束页大于0时减1
      }
      if (spage !== epage) { // 如果初始页和结束页相同，则证明翻到底了，不同才要改变
        that.setData({ // 更新存储
          spage: spage,
          epage: epage
        })
      }
    }
  },
  /**
   * 更新输入框输入值
   * @param {*} e 页面信息
   */
  oninput (e) {
    const key = `form.${e.currentTarget.dataset.key}` // 将key值带入，生成改变路径
    that.setData({ // 更改对应路径为输入信息
      [key]: e.detail.value
    })
  },
  /**
   * 提交报名
   */
  async submit () {
    let flag = true // 先设置flag为true，用于检查
    const check = that.data.info.form // 取出form原始结构
    const form = that.data.form // 取出输入的
    for (const i in check) { // 对原始结构进行循环
      if (form[i] == null || form[i] === '') { // 如果原始需要填写的没有写
        wx.showModal({ // 提示要补充
          content: `${check[i].name}未填写，请补充！`,
          showCancel: false
        })
        flag = false // 设置false，跳过提交环节
        break // 退出for循环
      }
    }
    if (flag === true) { // 如果flag=true，证明验证通过
      wx.showLoading({ // 显示加载中
        title: '提交中',
        mask: true
      })
      await app.call({ // 发起云函数，提交信息
        name: 'add',
        data: form
      })
      await that.init() // 更新信息
      wx.hideLoading() // 隐藏加载中
    }
  }
})
