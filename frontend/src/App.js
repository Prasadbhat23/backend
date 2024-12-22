import React, { useState } from "react";
import axios from "axios";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

// Register the required components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const App = () => {
  const [file, setFile] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [sentiments, setSentiments] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:8000/analyze/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSentiments(response.data.sentiments);
      prepareChartData(response.data.sentiments);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const prepareChartData = (data) => {
    const texts = data.map((item) => item.text);
    const positiveScores = data.map((item) => item.positive);
    const neutralScores = data.map((item) => item.neutral);
    const negativeScores = data.map((item) => item.negative);

    setChartData({
      labels: texts,
      datasets: [
        {
          label: "Positive",
          data: positiveScores,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
        {
          label: "Neutral",
          data: neutralScores,
          backgroundColor: "rgba(153, 102, 255, 0.6)",
        },
        {
          label: "Negative",
          data: negativeScores,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
        },
      ],
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Sentiment Analysis Dashboard</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button type="submit">Analyze</button>
      </form>

      {chartData && (
        <div style={{ marginTop: "30px" }}>
          <h2>Sentiment Analysis Results</h2>
          <Bar data={chartData} />
        </div>
      )}

      {sentiments.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2>Detailed Results</h2>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Text</th>
                <th>Positive</th>
                <th>Neutral</th>
                <th>Negative</th>
                <th>Compound</th>
              </tr>
            </thead>
            <tbody>
              {sentiments.map((item, index) => (
                <tr key={index}>
                  <td>{item.text}</td>
                  <td>{item.positive}</td>
                  <td>{item.neutral}</td>
                  <td>{item.negative}</td>
                  <td>{item.compound}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default App;

