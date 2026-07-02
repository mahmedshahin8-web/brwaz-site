const fs = require('fs');

const data = {
  opening_sketch: { voice_over: "test" },
  scenes: [ { voice_over: "scene 1" } ],
  video_title: "Test Video"
};

const inputData = { data, topic: "test topic" };

const getGlobalMetaData = (inputData, topic) => {
  const innerData = inputData?.data || inputData;
  const allScenes = [innerData?.opening_sketch, ...(innerData?.scenes || [])].filter(Boolean);
  return { allScenes };
};

const getGlobalMetaData2 = (inputData, topic) => {
  const data = inputData?.data || inputData;
  const allScenes = [data?.opening_sketch, ...(data?.scenes || [])].filter(Boolean);
  return { allScenes };
};

// Simulate generateMd destructuring
const generateMd = ({ data, fragmenterData, finalVoiceScript, topic }) => {
  const { allScenes } = getGlobalMetaData2(data, topic);
  console.log("generateMd allScenes length:", allScenes.length);
};

// Simulate handleExport
generateMd({
  data: data,
  fragmenterData: null,
  finalVoiceScript: "",
  topic: "test"
});

