/*
====================================================
SIMPLE TASK PLANNER
====================================================

This project uses JavaScript to create a task app.

The user can:

1. Add tasks
2. Mark tasks complete
3. Delete tasks
4. Save tasks in browser memory
5. Load tasks again after refresh

Core concepts used:

- DOM manipulation
- Arrays / Objects
- Event listeners
- Functions
- localStorage
- JSON

====================================================
*/


/*
====================================================
1. GET HTML ELEMENTS
====================================================

We use getElementById() to connect JavaScript
to the HTML elements on the page.

This lets us control:

- the form
- the text input
- the task list area
*/

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");


/*
====================================================
2. TASK DATA ARRAY
====================================================

This array stores every task in memory.

Each task is an object like:

{
  text: "Apply for jobs",
  completed: false
}

text = task name
completed = true or false
*/

let tasks = [];


/*
====================================================
3. SAVE TASKS TO BROWSER
====================================================

localStorage can only store text.

Our tasks array is JavaScript data,
so first we convert it into text using:

JSON.stringify(tasks)

Example:

[
  {text:"Learn JS",completed:false}
]

becomes a text string.

Then we store it under the key name:

"tasks"

Think of it like saving a file called tasks.
*/

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}


/*
====================================================
4. LOAD TASKS FROM BROWSER
====================================================

When page opens, we check if saved tasks exist.

getItem("tasks") looks inside browser storage.

If found:

savedTasks = text version of our tasks

Then we convert text back into real JavaScript
using:

JSON.parse()

This rebuilds the tasks array.

Finally we show tasks on screen.
*/

function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");

  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }

  renderTasks();
}


/*
====================================================
5. RENDER TASKS ON SCREEN
====================================================

This is the most important function.

It takes the tasks array and draws it visually.

Whenever tasks change, we call renderTasks().

Examples:

- add task
- delete task
- mark done
- undo
*/

function renderTasks() {

  /*
  Clear old HTML first.

  Without this, tasks would duplicate each time.
  */

  taskList.innerHTML = "";


  /*
  Loop through every task in the array.

  forEach gives us:

  task = current task object
  index = position in array
  */

  tasks.forEach((task, index) => {

    /*
    Create one <li> row
    */

    const li = document.createElement("li");
    li.classList.add("task");


    /*
    If task is complete,
    add completed style class.

    This adds strike-through text via CSS.
    */

    if (task.completed) {
      li.classList.add("completed");
    }


    /*
    Create text area for task title
    */

    const span = document.createElement("span");
    span.textContent = task.text;


    /*
    ====================================
    DONE / UNDO BUTTON
    ====================================

    If task.completed = false
    button says Done

    If true
    button says Undo
    */

    const completeBtn = document.createElement("button");

    completeBtn.textContent =
      task.completed ? "Undo" : "Done";


    /*
    When clicked:

    ! means opposite

    false becomes true
    true becomes false
    */

    completeBtn.addEventListener("click", () => {

      tasks[index].completed =
        !tasks[index].completed;

      /*
      Save new data
      Refresh screen
      */

      saveTasks();
      renderTasks();
    });


    /*
    ====================================
    DELETE BUTTON
    ====================================
    */

    const deleteBtn =
      document.createElement("button");

    deleteBtn.textContent = "Delete";


    /*
    splice(index,1)

    Remove 1 item
    starting at this index

    Example:

    [Task1, Task2, Task3]

    delete index 1 = Task2 removed
    */

    deleteBtn.addEventListener("click", () => {

      tasks.splice(index, 1);

      saveTasks();
      renderTasks();
    });


    /*
    Create container for buttons
    */

    const buttonGroup = document.createElement("div");
    buttonGroup.classList.add("button-group");

    buttonGroup.appendChild(completeBtn);
    buttonGroup.appendChild(deleteBtn);


    /*
    Build final row:

    [Task Name] [Done] [Delete]
    */

    li.appendChild(span);
    li.appendChild(buttonGroup);


    /*
    Add row onto page
    */

    taskList.appendChild(li);

  });
}


/*
====================================================
6. ADD TASK FORM
====================================================

Runs when:

- user clicks Add
- user presses Enter
*/

taskForm.addEventListener("submit", (event) => {

  /*
  Prevent page reload
  */

  event.preventDefault();


  /*
  Get text from input box

  trim() removes empty spaces
  */

  const taskText = taskInput.value.trim();


  /*
  If user entered nothing,
  stop function
  */

  if (taskText === "") return;


  /*
  Add new task object into array
  */

  tasks.push({
    text: taskText,
    completed: false
  });


  /*
  Clear input box
  */

  taskInput.value = "";


  /*
  Save data
  Refresh screen
  */

  saveTasks();
  renderTasks();

});


/*
====================================================
7. START APP
====================================================

When page first loads,
run loadTasks()

This checks browser storage
and restores previous tasks.
*/

loadTasks();