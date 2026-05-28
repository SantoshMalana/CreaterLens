const axios = require('axios');
const { YoutubeTranscript } = require('youtube-transcript');
const YOUTUBE_API_KEY = 'AIzaSyAUaHMAqsWssGoczIfEec96LDxM4_20CnY';

async function test() {
  // Search for the Raj Shamani video
  const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      q: 'How To Grow Your Salary To ₹1 Crore Using AI Raj Shamani',
      part: 'snippet',
      type: 'video',
      key: YOUTUBE_API_KEY
    }
  });
  
  const videoId = res.data.items[0].id.videoId;
  console.log('Found video ID:', videoId);

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    console.log('Transcript length:', transcript.length);
  } catch (err) {
    console.error('Error fetching transcript:', err);
  }

  // Also try codebasics video
  const res2 = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      q: 'Agentic AI Crash Course using LangChain codebasics',
      part: 'snippet',
      type: 'video',
      key: YOUTUBE_API_KEY
    }
  });
  const videoId2 = res2.data.items[0].id.videoId;
  console.log('Found video ID 2:', videoId2);
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId2);
    console.log('Transcript length 2:', transcript.length);
  } catch (err) {
    console.error('Error fetching transcript 2:', err);
  }
}

test();
