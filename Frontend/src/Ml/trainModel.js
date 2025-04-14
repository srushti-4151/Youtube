// import * as tf from "@tensorflow/tfjs";
// import axios from "axios";

// const RECM_BASE_URL =
//   import.meta.env.MODE === "development"
//     ? "http://localhost:8000/api/v1/recommendation"
//     : "https://youtube-ydae.onrender.com/api/v1/recommendation";

// const fetchTrainingData = async () => {
//   const response = await axios.get(`${RECM_BASE_URL}/training-data`);
//   return response.data;
// };

// const fetchVideoDetails = async (videoIds) => {
//   const response = await axios.post(`${RECM_BASE_URL}/video-details`, { videoIds });
//   console.log("recommendation fetchVideoDetails", response);
//   return response.data;
// };

// const trainModel = async () => {
//   const trainingData = await fetchTrainingData();

//   // Encoding
//   const encode = {};
//   let index = 0;
//   trainingData.forEach(({ userId, videoId }) => {
//     if (!(userId in encode)) encode[userId] = index++;
//     if (!(videoId in encode)) encode[videoId] = index++;
//   });

//   const xs = tf.tensor2d(trainingData.map((d) => [encode[d.userId], encode[d.videoId]]));
//   const ys = tf.tensor2d(trainingData.map((d) => [d.score]));

//   const model = tf.sequential();
//   model.add(tf.layers.dense({ inputShape: [2], units: 10, activation: "relu" }));
//   model.add(tf.layers.dense({ units: 1 }));
//   model.compile({ optimizer: "adam", loss: "meanSquaredError" });

//   console.log("Training...");
//   await model.fit(xs, ys, { epochs: 100 });
//   console.log("Training complete!");

//   const currentUserId = "67de7d7d3b69a9f47859ef2b";
//   const allVideoIds = Object.keys(encode).filter(
//     (id) => id !== currentUserId && id.length === 24
//   );

//   const predictions = [];

//   for (let videoId of allVideoIds) {
//     const input = tf.tensor2d([[encode[currentUserId], encode[videoId]]]);
//     const prediction = model.predict(input);
//     const score = await prediction.data();
//     predictions.push({
//       videoId,
//       score: score[0],
//     });
//   }

//   // Sort by score (highest first)
//   const topPredictions = predictions
//     .sort((a, b) => b.score - a.score)
//     .slice(0, 10); // Top 10 videos

//   const topVideoIds = topPredictions.map((v) => v.videoId);
//   const recommendedVideos = await fetchVideoDetails(topVideoIds);

//   console.log("Final Recommended Videos:", recommendedVideos);
// };

// trainModel();
