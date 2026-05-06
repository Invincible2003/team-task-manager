import { useEffect, useState } from "react";
import axios from "axios";

function App() {

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmFjMzc3NmNmNDUyNDI2OGQ4MWY3MCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3ODA0MTgwNywiZXhwIjoxNzc4NjQ2NjA3fQ.iSicWvd6oTZo1el8V01xkjoRWCVr6lgWmAIAZd9bXso";

  const [dashboard, setDashboard] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  });

  const [tasks, setTasks] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  useEffect(() => {

    fetchDashboard();
    fetchTasks();

  }, []);

  const fetchDashboard = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/dashboard",
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setDashboard(res.data);

    } catch (error) {

      console.log(error);

    }

  };

  const fetchTasks = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/tasks",
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setTasks(res.data);

    } catch (error) {

      console.log(error);

    }

  };

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const markDone = async (id) => {

    try {

      await axios.put(
        `http://localhost:5000/api/tasks/${id}`,
        {
          status: "Done",
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      fetchTasks();
      fetchDashboard();

    } catch (error) {

      console.log(error);

    }

  };

  const createTask = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        "http://localhost:5000/api/tasks",
        {
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setFormData({
        title: "",
        description: "",
        dueDate: "",
      });

      fetchTasks();
      fetchDashboard();

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-4xl font-bold text-center text-blue-600">
        Team Task Manager
      </h1>

      {/* Dashboard Cards */}

      <div className="mt-10 grid grid-cols-4 gap-5">

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Total Tasks</h2>
          <p className="text-3xl mt-2">
            {dashboard.totalTasks}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Completed</h2>
          <p className="text-3xl mt-2 text-green-600">
            {dashboard.completedTasks}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Pending</h2>
          <p className="text-3xl mt-2 text-yellow-500">
            {dashboard.pendingTasks}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">Overdue</h2>
          <p className="text-3xl mt-2 text-red-500">
            {dashboard.overdueTasks}
          </p>
        </div>

      </div>

      {/* Create Task Form */}

      <div className="bg-white p-6 rounded-xl shadow mt-10">

        <h2 className="text-2xl font-bold mb-5">
          Create Task
        </h2>

        <form
          onSubmit={createTask}
          className="grid grid-cols-3 gap-4"
        >

          <input
            type="text"
            name="title"
            placeholder="Task Title"
            value={formData.title}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="border p-3 rounded-lg"
            required
          />

          <button
            type="submit"
            className="bg-blue-600 text-white p-3 rounded-lg col-span-3 hover:bg-blue-700"
          >
            Create Task
          </button>

        </form>

      </div>

      {/* Task List */}

      <div className="bg-white p-6 rounded-xl shadow mt-10">

        <h2 className="text-2xl font-bold mb-5">
          Tasks
        </h2>

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Due Date</th>
              <th className="text-left p-3">Action</th>

            </tr>

          </thead>

          <tbody>

            {tasks.map((task) => (

              <tr
                key={task._id}
                className="border-b"
              >

                <td className="p-3">
                  {task.title}
                </td>

                <td className="p-3">
                  {task.description}
                </td>

                <td className="p-3">
                  {task.status}
                </td>

                <td className="p-3">
                  {new Date(task.dueDate)
                    .toLocaleDateString()}
                </td>

                <td className="p-3">

                  <button
                    onClick={() => markDone(task._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Done
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}

export default App;