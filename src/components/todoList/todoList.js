'use strict';

import React, { useState, useEffect, useRef } from 'react';

import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, serverTimestamp, query, orderBy } from "firebase/firestore";

import "./todoList.scss";

const firebaseConfig = {
    apiKey: "AIzaSyBwwf5QsqT2NSoNdAA-54isZtwIRDLna80",
    authDomain: "todoserver-ef08e.firebaseapp.com",
    projectId: "todoserver-ef08e",
    storageBucket: "todoserver-ef08e.firebasestorage.app",
    messagingSenderId: "63186881975",
    appId: "1:63186881975:web:8b6d2ac98ca9b9cb5aec32",
    measurementId: "G-FP3EDVTTHF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default () => {

    const [todoTasksArr, setTodoTasksArr] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [editTaskId, setEditTaskId] = useState(null);
    const [inputHandleValue, setInputHandleValue] = useState("");
    const [textBefore, setTextBefore] = useState("");
    const [isCheckDelete, setIsCheckDelete] = useState(false);
    const [allChecked, setAllChecked] = useState(false);
    const todoListRef = useRef(null);
    const lastTasksArrLength = useRef(0);

    function getCurrentTime() {
        const now = new Date();
        const [hours, minute] = now.toLocaleTimeString({ hour12: false, hour: '2-digit', minute: '2-digit' }).split(':');
        return [ hours, minute ];
    }

    function getCurrentDay() {
        const now = new Date();
        return now.toLocaleDateString('uk-UA', { month: 'numeric', day: 'numeric', year: 'numeric' });
    }

    async function addTodo() {
        const [hours, minute] = getCurrentTime();
        const day = getCurrentDay();

        const newTask = {
            text: inputValue.trim(),
            completed: false,
            time: `${day}: ${hours}:${minute}`,
            nameTask: JSON.parse(localStorage.getItem('SPA_USER_NAME')) || 'Анонім',
            createdAt: serverTimestamp() // для сортування orderBy
        };

        if (!newTask.text) {
            return;
        }

        try {
            const docRef = await addDoc(collection(db, "TodoChat"), newTask); // додає нову задачу до колекції "TodoChat" та отримує посилання на створений документ, автоматично генерує унікальний ID для кожної задачі
            setInputValue('');
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    }

    async function handleChange(id, event) {
       try {
            const todoDoc = doc(db, "TodoChat", id); // створює посилання на документ в колекції "TodoChat" по його ID
            await updateDoc(todoDoc, {
                completed: event.target.checked
            });
        } catch (error) {
            console.error("Error updating document: ", error);
        }

    }

    function handleEdit(id) {
        const taskToEdit = todoTasksArr.find(task => task.id === id);

        if (taskToEdit) {
            setInputHandleValue(taskToEdit.text.trim());
            setTextBefore(taskToEdit.text.trim())
        }
        setEditTaskId(id);
    }

    async function saveEdit(id) {
        if (!inputHandleValue.trim()) {
            alert("текстове поле не може бути порожнім");
            return;
        }

        if (textBefore === inputHandleValue.trim()) {
            alert("для підтвердження потрібно внести зміни");
            return;
        }

        const [hours, minute] = getCurrentTime();
        const day = getCurrentDay();

        try {
            const todoDoc = doc(db, "TodoChat", id);
            await updateDoc(todoDoc, {
                text: inputHandleValue,
                time: `виправлено ${day} в ${hours}:${minute}`
            });
        } catch (error) {
            console.error("Error updating document: ", error);
        }

        setEditTaskId(null);
    }

    async function checkAllTasks() {
        setAllChecked(!allChecked);
      
        setTodoTasksArr((prevTasks) => {
    
          const updatedTasks = prevTasks.map((task) => ({
            ...task,
            completed: !allChecked, 
          }));
      
          updatedTasks.forEach(async (task) => {
            try {
              const todoDoc = doc(db, "TodoChat", task.id);
              await updateDoc(todoDoc, {
                completed: task.completed,
              });
            } catch (error) {
              console.error("Error updating document: ", error);
            }
          });
      
          return updatedTasks;
        });
    }

    async function deleteTasks() {
        if (confirm("Бажаєте видалити виділенні повідомлення?")) {
        
            todoTasksArr.forEach(async (task) => {
                if (task.completed) {
                    try {
                        const todoDoc = doc(db, "TodoChat", task.id);
                        await deleteDoc(todoDoc);
                    } catch (error) {
                        console.error("Error deleting document: ", error);
                    }
                }
            });
        }
    }

    useEffect(() => {
        setIsCheckDelete(todoTasksArr.some(task => task.completed));
        setAllChecked(todoTasksArr.every(task => task.completed));

        if (todoListRef.current && todoTasksArr.length > lastTasksArrLength.current) {
            todoListRef.current.scrollTop = todoListRef.current.scrollHeight;
        }
        lastTasksArrLength.current = todoTasksArr.length;
        
    }, [todoTasksArr]);

    useEffect(() => {
        if (todoListRef.current) {
            todoListRef.current.scrollTop = todoListRef.current.scrollHeight;
        }
    }, [inputValue]); // щоб скролл при введенні задачі був прибитий до низу

    useEffect(() => {
        // отримання задач
        const tasks = query(collection(db, "TodoChat"), orderBy("createdAt")); 
        const unsubscribe = onSnapshot(tasks, (querySnapshot) => {
            const tasks = [];
            querySnapshot.forEach((doc) => {
                tasks.push({ ...doc.data(), id: doc.id });
            });
            setTodoTasksArr(tasks);
            lastTasksArrLength.current = 0;
        });

        return () => unsubscribe(); //відписка від оновлення дати при розмонтуванні
    }, []);

    return (
        <div className='todo-wrap'>
            <h2>Чат-задач</h2>

            <div className="todo-block">
                {isCheckDelete && (
                    <div className='select-btn'>
                        <button className="delete-btn" onClick={deleteTasks}>🗑</button>
                        <button className="check-all" onClick={checkAllTasks}>{allChecked ? "Зняти виділення" : "Виділити усе"}</button>
                    </div>
                )}

                <ul className="todo-list" ref={todoListRef}>
                    {todoTasksArr.map((task) => (
                        <li key={task.id}
                            className={task.completed ? "todo-item check-bg" : "todo-item"}
                            data-id={task.id}
                        >
                            {editTaskId === task.id ? (
                                <React.Fragment>
                                    <input
                                        type="text"
                                        className="todo-input"
                                        value={inputHandleValue}
                                        onChange={(e) => setInputHandleValue(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)} 
                                    />
                                    <div className='todo-item-controls'>
                                        <button className='save-btn' onClick={() => saveEdit(task.id)}>✓</button>
                                        <button className='cancel-btn' onClick={() => setEditTaskId(null)}>X</button>
                                    </div>
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <div className='todo-item-notification'>
                                        <div className="todo-item-meta">
                                            <div className="todo-item-name">{task.nameTask}</div>
                                            <div className="todo-item-time">{task.time}</div>
                                        </div>
                                        <div className="todo-item-text">{task.text}</div>
                                    </div>  

                                    <div className='todo-item-controls'>
                                        <button className='edit-btn' onClick={() => handleEdit(task.id)}></button>
                                        <input
                                            className='done-item'
                                            type="checkbox"
                                            checked={Boolean(task.completed)}
                                            onChange={(event) => handleChange(task.id, event)}
                                        />
                                    </div>
                                </React.Fragment>
                            )}
                            
                        </li>
                    ))}
                </ul>

                <div className="todo-input-wrap">
                    <input
                        type="text"
                        className="todo-input"
                        placeholder="Написати..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addTodo()} 
                    />
                    <button className="add-btn" onClick={addTodo}>Додати</button>
                </div>
            </div>
        </div>
    );
}