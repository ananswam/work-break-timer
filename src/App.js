import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, TextField, Button, Typography, 
  FormControlLabel, Switch, Paper, Grid, Collapse, IconButton
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SettingsIcon from '@mui/icons-material/Settings';

const alarmSound = new Audio('alarm.mp3');

function App() {
  const [exercises, setExercises] = useState(() => localStorage.getItem('exercises') || '');
  const [minutes, setMinutes] = useState(() => localStorage.getItem('minutes') !== null ? parseInt(localStorage.getItem('minutes')) : 30);
  const [seconds, setSeconds] = useState(() => localStorage.getItem('seconds') !== null ? parseInt(localStorage.getItem('seconds')) : 0);
  const [timeLeft, setTimeLeft] = useState(minutes * 60 + seconds);
  const [isRunning, setIsRunning] = useState(false);
  const [currentExercise, setCurrentExercise] = useState('');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isRandom, setIsRandom] = useState(() => localStorage.getItem('isRandom') === 'false');
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playAlarm();
            showExercise();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isRunning) {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (isAlarmPlaying) {
      alarmSound.loop = true;
      alarmSound.play();
    } else {
      alarmSound.pause();
      alarmSound.currentTime = 0;
    }
  }, [isAlarmPlaying]);

  useEffect(() => {
    localStorage.setItem('exercises', exercises);
    localStorage.setItem('minutes', minutes.toString());
    localStorage.setItem('seconds', seconds.toString());
    localStorage.setItem('isRandom', isRandom.toString());
  }, [exercises, minutes, seconds, isRandom]);

  const handleExercisesChange = (event) => {
    setExercises(event.target.value);
    setCurrentExerciseIndex(0);
  };

  const handleMinutesChange = (event) => {
    const newMinutes = Math.max(0, parseInt(event.target.value) || 0);
    setMinutes(newMinutes);
    setTimeLeft(newMinutes * 60 + seconds);
  };

  const handleSecondsChange = (event) => {
    const newSeconds = Math.max(0, Math.min(59, parseInt(event.target.value) || 0));
    setSeconds(newSeconds);
    setTimeLeft(minutes * 60 + newSeconds);
  };

  const toggleTimer = () => {
    if (!isRunning && timeLeft === 0) {
      setIsAlarmPlaying(false);
      setTimeLeft(minutes * 60 + seconds);
      // console.log('Setting exercise to empty from toggle timer');
      setCurrentExercise('');
    }
    setIsRunning(!isRunning);
  };

  const playAlarm = () => {
    setIsAlarmPlaying(true);
  };

  const resetTimer = () => {
    setIsAlarmPlaying(false);
    setIsRunning(false);
    // setTimeLeft(minutes * 60 + seconds);
    // setCurrentExercise('');
  };

  const showExercise = () => {
    const exerciseList = exercises.split('\n').filter(e => e.trim() !== '');
    let idx = 0;
    if (exerciseList.length > 0) {
      if (isRandom) {
        idx = Math.floor(Math.random() * exerciseList.length);
      } else {
        idx = currentExerciseIndex % exerciseList.length;
      }
      setCurrentExercise(exerciseList[idx]);
      // console.log('setting exercise to something from showExercise: ' + exerciseList[idx]);
      setCurrentExerciseIndex((idx + 1) % exerciseList.length);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Work Break Timer
      </Typography>
      <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px' }}>
        <Typography gutterBottom>Timer Duration</Typography>
        <Grid container spacing={2} sx={{ marginBottom: '20px' }}>
          <Grid item xs={6}>
            <TextField
              label="Minutes"
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
              value={minutes}
              onChange={handleMinutesChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Seconds"
              type="number"
              InputProps={{ inputProps: { min: 0, max: 59 } }}
              value={seconds}
              onChange={handleSecondsChange}
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid container spacing={2} sx={{ marginBottom: '20px' }}>
          <Grid item xs={6}>
            <Button
              variant="contained"
              color="primary"
              startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
              onClick={toggleTimer}
              fullWidth
            >
              {isRunning ? 'Pause' : 'Start'}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<RestartAltIcon />}
              onClick={resetTimer}
              fullWidth
            >
              Reset
            </Button>
          </Grid>
        </Grid>
        <Typography variant="h3" align="center" gutterBottom>
          {formatTime(timeLeft)}
        </Typography>
      </Paper>
      {currentExercise && (
        <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px' }}>
          <Typography variant="h6" gutterBottom>
            Current Exercise:
          </Typography>
          <Typography variant="body1">{currentExercise}</Typography>
        </Paper>
      )}
      <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px' }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h6">Configuration</Typography>
          </Grid>
          <Grid item>
            <IconButton onClick={() => setShowConfig(!showConfig)}>
              <SettingsIcon />
            </IconButton>
          </Grid>
        </Grid>
        <Collapse in={showConfig}>
          <TextField
            label="Exercises (one per line)"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={exercises}
            onChange={handleExercisesChange}
            sx={{ marginTop: '20px', marginBottom: '20px' }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={isRandom}
                onChange={(e) => setIsRandom(e.target.checked)}
                name="randomExercises"
                color="primary"
              />
            }
            label="Random Exercises"
          />
        </Collapse>
      </Paper>
    </Container>
  );
}

export default App;
