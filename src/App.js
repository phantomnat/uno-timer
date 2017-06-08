import React, { Component } from 'react'
import './App.css'
import $ from 'jquery'
import injectTapEventPlugin from 'react-tap-event-plugin'
import TimerMixin from 'react-timer-mixin'
import Chroma from 'chroma-js'

injectTapEventPlugin()

const INTERVAL = 50

class App extends Component {
  mixins = [TimerMixin]
  timerDuration = 5
  debouncingTime = 500    // ms
  status = {
    stop: 'stop',
    running: 'running',
    timeExpired: 'timeExpired',
  }
  ccColor = [112, 234, 228, 1]
  runningColor = Chroma.scale(['lightgreen', 'orange'])

  constructor() {
    super()
    this.state = {
      status: this.status.stop,
      seconds: this.timerDuration,
      tsStartTimer: 0,
      playSound: false,
      debouncing: false,
      color: this.ccColor,
    }
    this.animateTimer = null
    this.debouncingTimer = 0
    this.timer = 0
    this.audioAlarm = null

    this.onPageClick = this.onPageClick.bind(this)
    this.onSettingButtonClick = this.onSettingButtonClick.bind(this)

    this.startTimer = this.startTimer.bind(this)
    this.countDown = this.countDown.bind(this)
    this.resetTimer = this.resetTimer.bind(this)
    this.restartTimer = this.restartTimer.bind(this)

    this.onDebouncingEnd = this.onDebouncingEnd.bind(this)
  }

  componentWillUnmount() {
    console.log('componentWillUnmount')
    TimerMixin.clearInterval(this.animateTimer)
  }


  componentDidMount() {
    console.log('componentDidMount')
    const $a = $('#audio-alert')
    if ($a && typeof $a[0] !== 'undefined' && 'play' in $a[0]) {
      this.audioAlarm = $('#audio-alert')[0]
    }

    this.animateTimer = TimerMixin.setInterval(() => {
      if (this.state.status === this.status.stop) {
        this.setState({
          color: this.ccColor,
        })
      } else if (this.state.status === this.status.running) {
        let percent = ((new Date() / 1000) - this.state.tsStartTimer) / this.timerDuration
        if (percent > 1) percent = 1
        // console.log(percent)
        const _color = this.runningColor(percent)._rgb
        this.setState({
          color: [_color[0] | 0, _color[1] | 0, _color[2] | 0, _color[3] | 0]
        })
      } else {
        this.setState({
          color: [255, 0, 0, 1]
        })
      }
    }, INTERVAL)

  }

  resetTimer() {
    this.audioAlarm.pause()
    this.audioAlarm.currentTime = 0

    this.setState({
      seconds: this.timerDuration,
      playSound: false,
      status: this.status.stop,
    })

  }

  startTimer() {
    if (this.state.status === this.status.stop &&
      this.timer === 0) {
      // start timer only when timer is stop
      this.setState({
        status: this.status.running,
        tsStartTimer: (new Date() / 1000) | 0,
      })
      this.timer = TimerMixin.setInterval(this.countDown, 100)
    }
  }

  restartTimer() {
    TimerMixin.clearInterval(this.timer)
    this.timer = 0
    this.timer = TimerMixin.setInterval(this.countDown, 100)
    this.setState({
      seconds: this.timerDuration,
      tsStartTimer: (new Date() / 1000) | 0,
    })
  }

  countDown() {
    // Remove one second, set state so a re-render happens.
    let seconds = this.state.seconds - 1

    this.setState({
      seconds: seconds,
    })

    if (seconds + 1 === this.timerDuration) {
      TimerMixin.clearInterval(this.timer)
      this.timer = TimerMixin.setInterval(this.countDown, 1000)
    }

    // Check if we're at zero.
    if (seconds === 0) {
      TimerMixin.clearInterval(this.timer)
      this.timer = 0
      this.audioAlarm.play()
      this.setState({
        playSound: true,
        status: this.status.timeExpired,
      })
    }
  }

  onDebouncingEnd() {
    TimerMixin.clearInterval(this.debouncingTimer)
    this.setState({ debouncing: false })
  }

  onPageClick() {
    if (this.state.status === this.status.running &&
      this.state.debouncing) {
      // prevent too fast click
      // console.log('!debouncing')
      return
    }
    // console.log(this.state)
    // console.log('on page click')

    this.setState({ debouncing: true })
    this.debouncingTimer = TimerMixin.setInterval(this.onDebouncingEnd, 1000)

    if (this.state.status === this.status.stop) {
      this.startTimer()
    } else if (this.state.status === this.status.running) {
      this.restartTimer()
    } else if (this.state.status === this.status.timeExpired) {
      // stop playing sound and reset timer
      this.resetTimer()
    }
  }

  onSettingButtonClick(e) {
    // console.log('on setting button click')
    e.stopPropagation()
    if (this.state.status === this.status.stop) {
      this.timerDuration = (this.timerDuration === 10)
        ? 3
        : this.timerDuration + 1
      this.resetTimer()
    }
  }

  render() {
    const strColor = `rgb(${this.state.color[0]}, ${this.state.color[1]}, ${this.state.color[2]})`
    return (
      <div className={`App`} onClick={this.onPageClick} style={{ backgroundColor: strColor }}>
        <p className={`hidden-content`}>.</p>
        <h1 className={`number`}>{this.state.seconds}</h1>
        <button className={`btn-setting`} disabled={this.state.status !== this.status.stop} onClick={this.onSettingButtonClick}>+- Time</button>
      </div>
    )
  }
}

export default App
