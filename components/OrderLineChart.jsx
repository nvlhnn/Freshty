"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const OrderLineChart = ({ data }) => {
  // Prepare labels and data for the chart
  const labels = data.map((item) => item.date); // Array of dates
  const orderCounts = data.map((item) => item.totalOrders); // Array of total orders

  const chartData = {
    labels,
    datasets: [
      {
        label: "Total Orders",
        data: orderCounts,
        borderColor: "#4caf50", // Line color
        backgroundColor: "rgba(76, 175, 80, 0.2)", // Fill color
        borderWidth: 2,
        tension: 0.4, // Curve smoothness
        pointBackgroundColor: "#4caf50", // Point color
        pointRadius: 5, // Size of the points
        pointHoverRadius: 7, // Size of the points when hovered
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Total Orders",
        },
        beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default OrderLineChart;
