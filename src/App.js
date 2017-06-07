import React, { Component } from 'react'
import './App.css'
import Sound from 'react-sound'
import injectTapEventPlugin from "react-tap-event-plugin"
injectTapEventPlugin()

class App extends Component {
  timerDuration = 5
  debouncingTime = 500    // ms
  status = {
    stop: 'stop',
    running: 'running',
    timeExpired: 'timeExpired',
  }

  constructor() {
    super()
    this.state = {
      status: this.status.stop,
      seconds: this.timerDuration,
      playSound: false,
      debouncing: false,
    }
    this.debouncingTimer = 0
    this.timer = 0

    this.onPageClick = this.onPageClick.bind(this)
    this.onSettingButtonClick = this.onSettingButtonClick.bind(this)

    this.startTimer = this.startTimer.bind(this)
    this.countDown = this.countDown.bind(this)
    this.resetTimer = this.resetTimer.bind(this)
    this.restartTimer = this.restartTimer.bind(this)

    this.onDebouncingEnd = this.onDebouncingEnd.bind(this)
  }

  resetTimer() {
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
      this.setState({ status: this.status.running })
      this.timer = setInterval(this.countDown, 1000)
    }
  }

  restartTimer() {
    clearInterval(this.timer)
    this.timer = 0
    this.timer = setInterval(this.countDown, 1000)
    this.setState({
      seconds: this.timerDuration,
    })
  }

  countDown() {
    // Remove one second, set state so a re-render happens.
    let seconds = this.state.seconds - 1
    this.setState({
      seconds: seconds,
    })

    // Check if we're at zero.
    if (seconds === 0) {
      clearInterval(this.timer)
      this.timer = 0
      // console.log('Time expired!')
      // console.log('play sound!')
      this.setState({
        playSound: true,
        status: this.status.timeExpired,
      })
    }
  }

  onDebouncingEnd() {
    clearInterval(this.debouncingTimer)
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
    this.debouncingTimer = setInterval(this.onDebouncingEnd, 1000)

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
    let sound
    if (this.state.playSound) {
      sound = (
        <Sound
          url="assets/iphone_alarm.ogg"
          playStatus={Sound.status.PLAYING}
        />
      )
    }
    return (
      <div className={`App`} onClick={this.onPageClick}>
        <p className={`hidden-content`}>.</p>
        <h1 className={`number`}>{this.state.seconds}</h1>
        {sound}
        <button className={`btn-setting`} disabled={this.state.status !== this.status.stop} onClick={this.onSettingButtonClick}>+- Time</button>
      </div>
    )
  }
}

export default App
