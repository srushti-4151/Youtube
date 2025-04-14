import UserInteraction from "../models/UserInteraction.js";

// Utility: Convert interaction to a numerical score
const getInteractionScore = ({ watched, liked, subscribed }) => {
  return (watched ? 1 : 0) + (liked ? 2 : 0) + (subscribed ? 3 : 0);
};

// Main function: Generate training data
export const generateTrainingData = async () => {
  try {
    const interactions = await UserInteraction.find();

    const trainingData = interactions.map((item) => {
      return {
        userId: item.userId,
        videoId: item.videoId,
        score: getInteractionScore(item)
      };
    });

    return trainingData;
  } catch (err) {
    console.error("Error generating training data:", err);
    return [];
  }
};
