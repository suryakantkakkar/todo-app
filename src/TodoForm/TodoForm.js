import React, {useState,useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import config from '../config/config.local';
import backgroundImage from './background.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCircleCheck, faPen, faTrashCan 
} from '@fortawesome/free-solid-svg-icons'

import './TodoForm.css';
import axios from 'axios';

function TodoForm() {

  const [toDoList, setToDoList] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [updateData, setUpdateData] = useState('');
  const [largestTaskId, setLargestTaskId] = useState(0);
  useEffect(() => {
    // Fetch the todo list from MongoDB using an API endpoint
    fetchTodoList();
  }, []);


  const fetchTodoList = async () => {
    try {
      const response = await fetch(`${config.apiUrl}`); 
      const data = await response.json();
      setToDoList(data);
       // Find the largest taskid in the data array
    const largestTaskId = data.reduce((maxId, task) => {
        return Math.max(maxId, task.taskid);
      }, 0);
      // Store the largest taskid in your desired state variable
      setLargestTaskId(largestTaskId);
  
    } catch (error) {
      console.log('Error fetching todo list:', error);
    }
  };


  // Add task 

  const addTask = async () => {
    if (newTask) {
      try {
        const num = largestTaskId + 1;
        setLargestTaskId(num);
        const newEntry = { taskid: num, title: newTask, status: 'Progress' };
  
        const response = await axios.post(`${config.apiUrl}`, newEntry);
  
        if (response.status === 201) {
          const data = response.data;
          setToDoList([...toDoList, data]);
          setNewTask('');
        } else {
          console.log('Failed to add task:', response.status);
        }
      } catch (error) {
        console.log('Error adding task:', error);
      }
    }
  };
  

  // Delete task 
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${config.apiUrl}/${id}`);
      const newTasks = toDoList.filter((task) => task.taskid !== id);
      setToDoList(newTasks);
    } catch (error) {
      console.log('Error deleting task:', error);
    }
  };
  
  // mark task as done or completed
  const markDone = async (id) => {
    try {
      const newTasks = toDoList.map((task) => {
        if (task.taskid === id) {
          const newStatus = task.status === 'Completed' ? 'Progress' : 'Completed';
          return { ...task, status: newStatus };
        }
        return task;
      });
  
      setToDoList(newTasks);
  
      const updatedTask = newTasks.find((task) => task.taskid === id);
  
      // Make the PUT request to update the task
      const response = await axios.put(`${config.apiUrl}/${id}`, updatedTask);
  
      if (response.status !== 200) {
        console.log('Failed to update task:', response.status);
      }
    } catch (error) {
      console.log('Error updating task:', error);
    }
  };
  

  // cancel update
  const cancelUpdate = () => {
    setUpdateData('');
  }

  // Change task for update
  const changeTask = (e) => {
    let newEntry = {
      taskid: updateData.taskid,
      title: e.target.value,
      status : updateData.status === 'Completed' ? 'Progress' : 'Completed',
      //status: updateData.status ? true : false
    }
    setUpdateData(newEntry);
  }

  // update task 
  ////////////////////////////////////////// 
  const updateTask = async () => {
    console.log(updateData)
    if (updateData) {
      try {
        // Update the task in the local state
        let filterRecords = [...toDoList].filter(task => task.taskid !== updateData.taskid);
        let updatedObject = [...filterRecords, updateData];
        setToDoList(updatedObject);
        setUpdateData('');
  
        // Call the API endpoint to update the task in the MongoDB database
        const response = await axios.put(`${config.apiUrl}/${updateData.taskid}`, updateData);
  
        console.log('Task updated successfully:', response.data);
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  const getNewTask = (e) => {
    setNewTask(e.target.value);
  };
  
  return (
    <div className="block container" style={{ backgroundImage: `url(${backgroundImage})`, minHeight: '100vh', minWidth: '93vw' }}>
      <br/><br />
      <h2 style={{ fontFamily: 'cursive', fontSize: '3rem', color: 'black', textAlign: 'center' }}>
  My To Do List
</h2>
      <br/><br/>
      {updateData && updateData ? (
        <>
          <div className="row">
            <div className="col">
              <input 
                value={updateData && updateData.title} 
                onChange={ (e) => changeTask(e) } 
                className="form-control form-control-lg" 
              />
            </div>
            <div className="col-auto">
              <button 
                className="btn btn-lg btn-success mr-20" 
                onClick={updateTask}
              >Update</button>
              <button 
                className="btn btn-lg btn-warning" 
                onClick={cancelUpdate}
              >Cancel</button>
            </div>
          </div>
          <br />
        </>
      ) : (
        <>
          <div className="row">
            <div className="col">
              <input placeholder='Enter New Task here' value={newTask} onChange={getNewTask} className="form-control form-control-lg" />
            </div>
            <div className="col-auto">
              <button className="btn btn-lg btn-success" onClick={addTask}>Add Task</button>
            </div>
          </div>
          <br/>
        </>
      )}


      {/* If there are no to dos in state, display a message   */}
      {toDoList && toDoList.length ? '' : 'No tasks...'}
      
      {/* Show to dos   */}
      {toDoList && toDoList.sort((a, b) => a.taskid > b.taskid ? 1 : -1).map( (task, index) => {
        return(
          <React.Fragment key={task.taskid}>
          
            <div className="col taskBg">
              
              <div className={ task.status==='Completed' ? 'done' : '' }>
                {/* Show number of task */}
                <span className="taskNumber">{index + 1}</span> 
                <span className="taskText">{task.title}</span>
              </div>

              <div className="iconsWrap">
                <span 
                  onClick={(e) => markDone(task.taskid)}
                  title="Completed / Not Completed"
                >
             <FontAwesomeIcon icon={faCircleCheck} className={`${task.status === "Completed" ? "Completed" : "Progress"}`}/>
                </span>
                
                {task.status==='Completed' ? null : (
                  <span 
                    title="Edit"
                    onClick={ () => setUpdateData({ taskid: task.taskid, title: task.title, satus: task.status }) }
                  >
                     <FontAwesomeIcon icon={faPen} className="pen-icon" />
                  </span>
                )}

                <span 
                  onClick={() => deleteTask(task.taskid)}
                  title="Delete"
                >
                   <FontAwesomeIcon icon={faTrashCan}  className="trash-icon" />
                </span>
              </div>

            </div>
                     
        </React.Fragment>
        );
      })}
      <br></br>
    </div>
  );
}

export default TodoForm;