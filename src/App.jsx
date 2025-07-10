import React, { useEffect, useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const newCount = await window.electronAPI.getCounter();
      setCount(newCount);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchTaskStatus();
  }, []);

  const fetchTaskStatus = async () => {
    const result = await window.taskAPI.status();
    setTasks(result);
    window.logger.info(result)
  };

  const handleClick = async () => {
    window.logger.info('Increment button clicked');
    const updated = await window.electronAPI.incrementCounter();
    setCount(updated);
  };

  const startTask = async (name) => {
    await window.taskAPI.start(name);
    window.logger.info(`Started task: ${name}`);
    fetchTaskStatus();
  };

  const stopTask = async (name) => {
    await window.taskAPI.stop(name);
    window.logger.info(`Stopped task: ${name}`);
    fetchTaskStatus();
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>HireDue Dashboard</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Counter: {count}</h3>
        <button onClick={handleClick}>Increment</button>
      </div>

      <div>
        <h3>Background Tasks</h3>
        {tasks.map(task => (
          <div key={task.name} style={{ marginBottom: '1rem' }}>
            <strong>{task.name}</strong> — 
            {task.running ? '🟢 Running' : '🔴 Stopped'} &nbsp;
            <code>{task.cron}</code>
            <br />
            <button onClick={() => startTask(task.name)} disabled={task.running}>Start</button>
            <button onClick={() => stopTask(task.name)} disabled={!task.running}>Stop</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
