import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  RadarController,
  RadialLinearScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import React, { useEffect, useState } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import { fetchDashboardAnalytics } from "../../api/DashboardApi.js";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader.jsx";

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  RadarController,
  RadialLinearScale
);

const ViewChart = () => {
  const { user } = useSelector((state) => state.auth);
  const [chartData, setChartData] = useState(null); // Changed initial state to null
  const [totalViews, setTotalViews] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    async function fetchData() {
      try {
        setLoading(true); // Set loading to true when starting fetch
        const data = await fetchDashboardAnalytics();

        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: "Views",
              data: data.viewsData,
              borderColor: "rgba(75,192,192,1)",
              backgroundColor: "rgba(75,192,192,0.9)",
              tension: 0.4,
              fill: true,
            },
            {
              label: "Subscribers",
              data: data.subscribersData,
              borderColor: "#a855f7",
              backgroundColor: "rgba(168,85,247,0.9)",
              tension: 0.4,
              fill: true,
            },
            {
              label: "Likes",
              data: data.likesData,
              borderColor: "#facc15",
              backgroundColor: "rgba(250,204,21,0.9)",
              tension: 0.4,
              fill: true,
            },
          ],
        });

        setTotalViews(data.totalViews);
        setTotalLikes(data.totalLikes);
        setTotalSubscribers(data.totalSubscribers);
        setLabels(data.labels);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false); // Set loading to false when done (success or error)
      }
    }

    fetchData();
  }, [user]);

  const options = {
    responsive: true,
    scales: {
      x: {
        type: "time",
        time: { unit: "day" },
        title: { display: true, text: "Date" },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Count" },
      },
    },
    plugins: {
      legend: { position: "top" },
    },
  };

  const pieData = {
    labels: ["Views", "Subscribers", "Likes"],
    datasets: [
      {
        data: [totalViews, totalSubscribers, totalLikes],
        backgroundColor: ["#60a5fa", "#a78bfa", "#facc15"],
        hoverOffset: 6,
      },
    ],
  };

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-black">
        <div className="text-center p-8 max-w-md mx-auto bg-white dark:bg-black rounded-xl shadow-lg dark:shadow-gray-700/50 transition-all">
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-red-500 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need to be logged in to view this dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-blue-100 p-4 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold">Total Views</h3>
          <p className="text-2xl font-bold text-blue-600">{totalViews}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold">Total Subscribers</h3>
          <p className="text-2xl font-bold text-purple-600">
            {totalSubscribers}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold">Total Likes</h3>
          <p className="text-2xl font-bold text-yellow-600">{totalLikes}</p>
        </div>
      </div>
      {chartData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 mt-16 md:mt-28">
            {/* Bar Chart */}
            <div>
              <h2 className="text-xl font-semibold text-center mb-2">
                Engagement Comparison
              </h2>
              <Bar data={chartData} options={options} />
            </div>

            {/* Pie Chart */}
            <div className="max-w-lg mx-auto mt-16 md:mt-0">
              <h2 className="text-xl font-semibold text-center mb-2">
                Total Distribution
              </h2>
              <Pie data={pieData} />
            </div>
          </div>

          {/* Line Chart */}
          <div className="mt-16 md:mt-28">
            <h2 className="text-xl font-semibold text-center mb-2">
              Growth Over Time
            </h2>
            <Line data={chartData} options={options} />
          </div>
        </>
      )}
    </div>
  );
};

export default ViewChart;

// AnalyticsDashboard.jsx
// import React from "react";
// import { Line, Bar, Pie, Radar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   LineElement,
//   BarElement,
//   PointElement,
//   LinearScale,
//   TimeScale,
//   CategoryScale,
//   ArcElement,
//   Tooltip,
//   Legend,
//   Title,
//   RadarController,
//   RadialLinearScale,
// } from "chart.js";
// import "chartjs-adapter-date-fns";

// ChartJS.register(
//   LineElement,
//   BarElement,
//   PointElement,
//   LinearScale,
//   TimeScale,
//   CategoryScale,
//   ArcElement,
//   Tooltip,
//   Legend,
//   Title,
//   RadarController,
//   RadialLinearScale
// );

// const ViewChart = () => {
//   // Static summary data
//   const totalViews = 1200;
//   const totalLikes = 350;
//   const totalSubscribers = 180;

//   // Static time-series data
//   const labels = [
//     "2025-04-10",
//     "2025-04-11",
//     "2025-04-12",
//     "2025-04-13",
//     "2025-04-14",
//   ];

//   const chartData = {
//     labels,
//     datasets: [
//       {
//         label: "Views",
//         data: [200, 300, 150, 350, 200],
//         borderColor: "rgba(75,192,192,1)",
//         backgroundColor: "rgba(75,192,192,0.9)",
//         tension: 0.4,
//         fill: true,
//       },
//       {
//         label: "Subscribers",
//         data: [20, 25, 18, 30, 22],
//         borderColor: "#a855f7",
//         backgroundColor: "rgba(168,85,247,0.9)",
//         tension: 0.4,
//         fill: true,
//       },
//       {
//         label: "Likes",
//         data: [50, 70, 30, 90, 60],
//         borderColor: "#facc15",
//         backgroundColor: "rgba(250,204,21,0.9)",
//         tension: 0.4,
//         fill: true,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     scales: {
//       x: {
//         type: "time",
//         time: { unit: "day" },
//         title: { display: true, text: "Date" },
//       },
//       y: {
//         beginAtZero: true,
//         title: { display: true, text: "Count" },
//       },
//     },
//     plugins: {
//       legend: { position: "top" },
//     },
//   };

//   const pieData = {
//     labels: ["Views", "Subscribers", "Likes"],
//     datasets: [
//       {
//         data: [totalViews, totalSubscribers, totalLikes],
//         backgroundColor: ["#60a5fa", "#a78bfa", "#facc15"],
//         hoverOffset: 6,
//       },
//     ],
//   };

//   return (
//     <div className="p-4">
//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
//         <div className="bg-blue-100 p-4 rounded-xl shadow-md">
//           <h3 className="text-lg font-semibold">Total Views</h3>
//           <p className="text-2xl font-bold text-blue-600">{totalViews}</p>
//         </div>
//         <div className="bg-purple-100 p-4 rounded-xl shadow-md">
//           <h3 className="text-lg font-semibold">Total Subscribers</h3>
//           <p className="text-2xl font-bold text-purple-600">
//             {totalSubscribers}
//           </p>
//         </div>
//         <div className="bg-yellow-100 p-4 rounded-xl shadow-md">
//           <h3 className="text-lg font-semibold">Total Likes</h3>
//           <p className="text-2xl font-bold text-yellow-600">{totalLikes}</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 mt-16 md:mt-28">
//         {/* Bar Chart */}
//         <div>
//           <h2 className="text-xl font-semibold text-center mb-2">
//             Engagement Comparison
//           </h2>
//           <Bar data={chartData} options={options} />
//         </div>

//         {/* Pie Chart */}
//         <div className="max-w-lg mx-auto mt-16 md:mt-0">
//           <h2 className="text-xl font-semibold text-center mb-2">
//             Total Distribution
//           </h2>
//           <Pie data={pieData} />
//         </div>
//       </div>

//       {/* Line Chart */}
//       <div className="mt-16 md:mt-28">
//         <h2 className="text-xl font-semibold text-center mb-2">
//           Growth Over Time
//         </h2>
//         <Line data={chartData} options={options} />
//       </div>

//     </div>
//   );
// };

// export default ViewChart;
