
const express = require('express');
const mongoose = require('mongoose');
const dotEnv = require("dotenv")
dotEnv.config()
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(cors())

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String,
});

const Task = mongoose.model('Task', taskSchema);

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const newTask = await Task.create({ title, description, status });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create task' });
  }
});

app.get('/api/tasks/:status', async (req, res) => {
  const { status } = req.params;
  try {
    const tasks = await Task.find({ status });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.patch('/api/tasks/:taskId', async (req, res) => {
  const taskId = req.params.taskId;
  const { title, description, status } = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(taskId, { title, description, status }, { new: true });
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:taskId', async (req, res) => {
  const taskId = req.params.taskId;
  try {
    await Task.findByIdAndDelete(taskId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const allTasks = await Task.find();
    const groupedTasks = {
      'To Do': allTasks.filter((task) => task.status === 'To Do'),
      'Doing': allTasks.filter((task) => task.status === 'Doing'),
      'Done': allTasks.filter((task) => task.status === 'Done'),
    };
    res.status(200).json(groupedTasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.patch('/api/updateTaskOrder', async (req, res) => {
  const { updatedTasks } = req.body;

  try {
    if (!updatedTasks) {
      throw new Error('updatedTasks is missing in the request body');
    }

    const todoTasks = updatedTasks['To Do'] || [];
    const doingTasks = updatedTasks['Doing'] || [];
    const doneTasks = updatedTasks['Done'] || [];

    const allTasks = [...todoTasks, ...doingTasks, ...doneTasks];

    await Task.updateMany(
      { _id: { $in: allTasks.map(task => task._id) } },
      { $set: { status: 'Unknown' } }
    );

    await Task.updateMany(
      { _id: { $in: todoTasks.map(task => task._id) } },
      { $set: { status: 'To Do' } }
    );

    await Task.updateMany(
      { _id: { $in: doingTasks.map(task => task._id) } },
      { $set: { status: 'Doing' } }
    );

    await Task.updateMany(
      { _id: { $in: doneTasks.map(task => task._id) } },
      { $set: { status: 'Done' } }
    );

    res.status(200).json({ message: 'Task order updated successfully' });
  } catch (error) {
    console.error('Error updating task order:', error);
    res.status(500).json({ error: 'Failed to update task order' });
  }
});

app.get('/', (req, res) => {
  res.send("everything is working fine")
});

app.listen(process.env.PORT, () => {
  mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log(`Server running on http://localhost:${process.env.PORT}`))
    .catch((error) => console.log(error))
});

