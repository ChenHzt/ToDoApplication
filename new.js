/* eslint-disable no-unused-expressions */
/* eslint-disable no-plusplus */

function ToDoItem(argmap) {
  if (localStorage.getItem('todosCounter') !== null) {
    this.counter = localStorage.getItem('todosCounter');
  } else this.counter = 1;
  this.id = argmap.id || this.counter++;
  localStorage.setItem('todosCounter', this.counter);
  if (argmap.todoContent) this.todoContent = argmap.todoContent;
  else throw new Error('todo content is not provided');
  if (argmap.createDate) this.createDate = argmap.createDate;
  else this.createDate = Date.now();
  if (argmap.isCompleted) this.isCompleted = argmap.isCompleted;
  else this.isCompleted = false;
}

ToDoItem.prototype = {
  getId() {
    return this.id;
  },

  getContent() {
    return this.todoContent;
  },

  getComplitedStatus() {
    return this.isCompleted;
  },

  setComplitedStatus(isCompleted) {
    this.isCompleted = isCompleted;
  },
};

function ToDoCRUD() {
  this.todos = new Map();
  const r = '{}';
  if (localStorage.getItem('todos') !== null) {
    let stam = JSON.parse(localStorage.getItem('todos'));
    stam = stam.map((elem) => [elem[0], new ToDoItem(elem[1])]);
    this.todos = new Map(stam);
  } else localStorage.setItem('todos', JSON.stringify([...this.todos]));
}

ToDoCRUD.prototype = {
  addItem(taskName, isCompleted = false) {
    const newTodo = new ToDoItem({ todoContent: taskName, isCompleted });
    this.todos.set(newTodo.getId(), newTodo);
    localStorage.setItem('todos', JSON.stringify([...this.todos]));
    return newTodo;
  },

  deleteItem(taskID) {
    if (!this.todos.has(taskID))
      throw new Error(`task with id of ${taskID} doesn't exists`);
    this.todos.delete(taskID);
    localStorage.setItem('todos', JSON.stringify([...this.todos]));
  },

  markAsDone(taskID) {
    if (!this.todos.has(taskID))
      throw new Error(`task with id of ${taskID} doesn't exists`);
    this.todos.get(taskID).setComplitedStatus(true);
    localStorage.setItem('todos', JSON.stringify([...this.todos]));
  },

  unmarkAsDone(taskID) {
    if (!this.todos.has(taskID))
      throw new Error(`task with id of ${taskID} doesn't exists`);
    this.todos.get(taskID).setComplitedStatus(false);
    localStorage.setItem('todos', JSON.stringify([...this.todos]));
  },

  getAllUnmarked() {
    return Array.from(this.todos.values()).filter(
      (todo) => !todo.getComplitedStatus()
    );
  },

  getAll() {
    const list = Array.from(this.todos.values());
    const done = list.filter((todo) => todo.getComplitedStatus());
    const undone = list.filter((todo) => !todo.getComplitedStatus());
    return undone.concat(done);
  },
};

const todoManager = new ToDoCRUD();

function ToDoApp() {
  this.tasksUl = document.querySelector('.tasks-list');
  this.addBtn = document.querySelector('.button-add');
  this.addInput = document.querySelector('#new-task-info');
  this.todos = todoManager.getAll();
  this.unmarkedCount = todoManager.getAllUnmarked().length;
  this.addBtn.addEventListener('click', (event) => this.addButtonClicked());
  this.refreshList();
}

ToDoApp.prototype = {
  createTaskDisplay(todo) {
    const li = document.createElement('li');
    li.setAttribute('data-task-id', todo.getId());

    const leftSide = document.createElement('div');
    leftSide.classList.add('todo-left-side');
    li.appendChild(leftSide);

    const taskChecked = document.createElement('div');
    taskChecked.classList.add('myCheckBox');
    taskChecked.setAttribute(
      'data-checked',
      todo.getComplitedStatus().toString()
    );
    taskChecked.innerHTML = todo.getComplitedStatus() ? '&check;' : '';
    leftSide.appendChild(taskChecked);

    taskChecked.addEventListener('click', (event) => {
      if (todo.getComplitedStatus()) this.unmarkTask(event, li, todo.getId());
      else this.markTask(event, li, todo.getId());
    });

    const taskInfo = document.createElement('p');
    taskInfo.classList.add('taskInfo');
    taskInfo.innerHTML = todo.getContent();
    leftSide.appendChild(taskInfo);

    const taskDelete = document.createElement('button');
    taskDelete.classList.add('delete-button');
    taskDelete.innerHTML = '&#128465;';
    taskDelete.addEventListener('click', (event) => {
      this.delete(todo, li);
    });
    li.appendChild(taskDelete);

    return li;
  },
  refreshList() {
    this.tasksUl.innerHTML = '';
    this.todos = todoManager.getAll();
    this.todos.forEach((todo) => {
      const li = this.createTaskDisplay(todo);
      this.tasksUl.appendChild(li);
    });
  },

  delete(todo, li) {
    todoManager.deleteItem(todo.getId());
    todo.getComplitedStatus() ? null : this.unmarkedCount--;
    li.remove();
  },

  markTask(event, li, taskID) {
    const taskChecked = event.target;
    taskChecked.setAttribute('data-checked', 'true');
    taskChecked.innerHTML = '&check;';
    this.unmarkedCount--;
    todoManager.markAsDone(taskID);
    li.remove();
    this.tasksUl.insertBefore(li, this.tasksUl.children[this.unmarkedCount]);
  },

  unmarkTask(event, li, taskID) {
    const taskChecked = event.target;
    taskChecked.setAttribute('data-checked', 'false');
    taskChecked.innerHTML = '';
    todoManager.unmarkAsDone(taskID);
    li.remove();
    this.tasksUl.insertBefore(li, this.tasksUl.children[this.unmarkedCount++]);
  },

  addButtonClicked() {
    if (!this.addInput.value) return;
    const newTask = todoManager.addItem(this.addInput.value);
    this.unmarkedCount++;
    const li = this.createTaskDisplay(newTask);
    this.tasksUl.appendChild(li);
    this.addInput.value = '';
  },
};

const c = new ToDoApp();
