const express=require("express")
const router=express.Router()
const Task= require("./model")
const dotEnv = require("dotenv")
dotEnv.config()



router.post('/tasks', async (req, res) => {
    try {
      const { title, description, status } = req.body;
      const newTask = await Task.create({ title, description, status });
      res.status(201).json(newTask);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create task' });
    }
  });
  
router.get('/tasks/:status', async (req, res) => {
    const { status } = req.params;
    try {
      const tasks = await Task.find({ status });
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });
  
router.patch('/tasks/:taskId', async (req, res) => {
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
  
router.delete('/tasks/:taskId', async (req, res) => {
    const taskId = req.params.taskId;
    try {
      await Task.findByIdAndDelete(taskId);
      res.status(204).send();
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

module.exports= router;