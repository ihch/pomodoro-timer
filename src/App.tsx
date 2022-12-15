import { useReducer, useState } from 'react';
import { ColorFormat, CountdownCircleTimer, Props as CountdownCircleTimerProps } from 'react-countdown-circle-timer';
import styles from './App.module.scss'

const CountdownTimer: React.FC<Omit<CountdownCircleTimerProps, 'colors'> & { key?: string, colors: ColorFormat; }> = ({ isPlaying, duration, colors = '#433443', onComplete, key }) => {
  return (
    <CountdownCircleTimer isPlaying={isPlaying} duration={duration} colors={colors} onComplete={onComplete} key={key}>
      {({ remainingTime }) => `${Math.floor(remainingTime / 60)}:${remainingTime % 60}`}
    </CountdownCircleTimer>
  )
}

type InputTimeFormProps = {
  value: number;
  label: string;
  disabled?: boolean;
  handleInputTime: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputTimeForm: React.FC<InputTimeFormProps> = ({ value, label, disabled, handleInputTime }) => {
  return (
    <div className={styles['input-time-form']}>
      <span className={styles['label']}>
        {label}
      </span>
      <div className={styles['form']}>
        <input className={styles['input']} type="number" value={value} disabled={disabled} onChange={handleInputTime} />
      </div>
    </div>
  )
}

type TimerState = {
  isPlaying: boolean;
  duration: number;
  color: string;
  state: 'IDLE' | 'WORK' | 'BREAK';
  key?: string;
}

const nextTimerActions: Record<TimerState['state'], (payload: { duration: number, key?: string }) => TimerState> = {
  'IDLE': ({ duration }) => ({ isPlaying: true, duration, color: '#4EED83', state: 'WORK' }),
  'WORK': ({ duration }) => ({ isPlaying: true, duration, color: '#EDA437', state: 'BREAK' }),
  'BREAK': ({ duration, key }) => ({ isPlaying: false, duration, color: '#4EED83', state: 'IDLE', key }),
}

enum TimerAction {
  next = 0,
  reset = 1,
  pause = 2,
  unpause = 3,
}

const timerReducer = (state: TimerState, action: { type: TimerAction; duration?: number }): TimerState => {
  const { duration = 0 } = action;

  switch (action.type) {
    case TimerAction.next:
      const nextAction = nextTimerActions[state.state];
      if (!nextAction) {
        return state;
      }
      return nextAction({ duration, key: new Date().toString() });
    case TimerAction.reset:
      return nextTimerActions['BREAK']({ duration, key: new Date().toString() });
    case TimerAction.pause:
      return { ...state, isPlaying: false };
    case TimerAction.unpause:
      return { ...state, isPlaying: true };
  }
}

function App() {
  const [workingTime, setWorkingTime] = useState(20);
  const [breakingTime, setBreakingTime] = useState(5);

  const [timerConfig, dispatchTimerConfig] = useReducer(
    timerReducer,
    { isPlaying: false, color: '', duration: workingTime, state: 'IDLE' }
  );

  return (
    <div className={styles["app-root"]}>
      <header className={styles["app-header"]}>
        <h2 className={styles["title"]}>ポモドーロタイマー</h2>
      </header>

      <div className={styles['pomodoro-timer']}>
        <div className={styles['timer']}>
          <CountdownTimer
            isPlaying={timerConfig.isPlaying}
            duration={timerConfig.duration * 60}
            key={timerConfig.key}
            colors="#4EED83"
            onComplete={() => {
              dispatchTimerConfig({ type: TimerAction.next });
            }}
          />
        </div>
        <button
          className={styles['button']}
          onClick={() => {
            const actionType = timerConfig.state === 'IDLE' ? TimerAction.next : TimerAction.reset;
            dispatchTimerConfig({ type: actionType, duration: timerConfig.duration });
          }}
        >
          {timerConfig.state === 'IDLE' ? 'start' : 'reset'}
        </button>
        <button
          className={styles['button']}
          disabled={timerConfig.state === 'IDLE'}
          onClick={() => {
            dispatchTimerConfig({ type: timerConfig.isPlaying ? TimerAction.pause : TimerAction.unpause });
          }}
        >
          {timerConfig.isPlaying ? 'pause' : 'unpause'}
        </button>
      </div>

      <div className={styles['input-form']}>
        <div className={styles['working']}>
          <InputTimeForm label='作業' disabled={timerConfig.isPlaying} value={workingTime} handleInputTime={(e) => { setWorkingTime(Number(e.target.value)) }} />
        </div>
        <div className={styles['breaking']}>
          <InputTimeForm label='休憩' value={breakingTime} handleInputTime={(e) => { setBreakingTime(Number(e.target.value)) }} />
        </div>
      </div>
    </div>
  )
}

export default App
