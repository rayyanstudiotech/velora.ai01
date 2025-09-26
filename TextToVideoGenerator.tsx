

import React, { useState, useCallback, useEffect } from 'react'; 
import { GoogleGenAI } from "@google/genai";
import { GeneratorCard, ResultPreview } from '../GeneratorCard';
import { UserSubscription, Page, HistoryItem } from '../../types';
import { LightbulbIcon, DownloadIcon } from '../Icons';

interface TextToVideoGeneratorProps {
    userSubscription: UserSubscription | null;
    openAuthModal: () => void;
    setActivePage: (page: Page) => void;
    onVideoGenerated: () => void;
    onAddToHistory: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => void;
}

const loadingMessages = [
  "Warming up the video engine...",
  "Gathering pixels from the digital ether...",
  "This can take a few minutes, hang tight...",
  "Composing your cinematic masterpiece...",
  "Almost there, adding the final touches...",
];

const samplePrompts = [
    'A time-lapse video of a fantasy city being built from scratch.',
    'An astronaut floating in space, playing a guitar with Earth in the background.',
    'A drone shot flying through a lush, tropical jungle with waterfalls.',
    'A cute robot delivering a flower to another robot in a futuristic park.',
    'A magical library where books fly off the shelves and open themselves.'
];

const videoStyles = [
    'cinematic', 'dramatic lighting', 'film noir', 'rich colors', 'shallow depth of field',
    '3D animation', 'cartoonish', 'anime style', '2D animated', 'stop-motion',
    'photorealistic', 'ultra-high resolution', 'lifelike', 'hyperrealistic', '4K video',
    'surreal', 'impressionistic', 'watercolor', 'vintage', 'cyberpunk', 'vaporwave aesthetic'
];

const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <svg className="animate-spin h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-400 text-center">{message}</p>
    </div>
);

export const TextToVideoGenerator: React.FC<TextToVideoGeneratorProps> = ({ userSubscription, openAuthModal, setActivePage, onVideoGenerated, onAddToHistory }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [cooldownTime, setCooldownTime] = useState<number>(0);

  const aspectRatios = ['16:9', '9:16', '1:1'];

  useEffect(() => {
    let intervalId: number;
    if (loading) {
      let messageIndex = 0;
      setLoadingMessage(loadingMessages[messageIndex]);
      intervalId = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 5000);
    }
    return () => window.clearInterval(intervalId);
  }, [loading]);

  useEffect(() => {
    let timer: number;
    if (cooldownTime > 0) {
      timer = window.setInterval(() => {
        setCooldownTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => window.clearInterval(timer);
  }, [cooldownTime]);

  const handleSuggestPrompt = () => {
    const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
    setPrompt(randomPrompt);
  };
  
  const handleStyleClick = (style: string) => {
    setPrompt(prev => prev.trim() ? `${prev.trim()}, ${style}` : style);
  };

  const pollOperation = useCallback(async (ai: any, operation: any): Promise<string> => {
    let currentOperation = operation;
    while (!currentOperation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        try {
          currentOperation = await ai.operations.getVideosOperation({ operation: currentOperation });
        } catch (e) {
          console.error("Polling failed:", e);
          throw new Error("Failed to get operation status. The process may have been interrupted.");
        }
    }
    
    if (currentOperation.error) {
      throw new Error(currentOperation.error.message || "An unknown error occurred during video generation.");
    }

    const downloadLink = currentOperation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation failed to produce a valid download link.");
    }

    if (!process.env.API_KEY) {
        throw new Error("API_KEY is not configured, cannot download video.");
    }

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to download the generated video. Server responded with status: ${response.status}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!userSubscription) {
        openAuthModal();
        return;
    }
    
    if (userSubscription.videoCount >= userSubscription.plan.videoLimit) {
        setError("You have reached your video generation limit for this plan. Please upgrade to continue.");
        return;
    }

    if (!prompt.trim()) {
        setError("Please enter a prompt to generate a video.");
        setResult(null);
        return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // FIX: Initialize the GoogleGenAI client before use.
      const ai = new GoogleGenAI({ apiKey: "AIzaSyAPSlj6wlNqlVhYMC_U386XrPX61bjh9_g" });
      const operation = await ai.models.generateVideos({
          model: 'veo-2.0-generate-001',
          prompt: prompt,
          config: {
              numberOfVideos: 1
          }
      });
      const videoUrl = await pollOperation(ai, operation);
      setResult(videoUrl);
      onVideoGenerated();
      onAddToHistory({
        type: 'Text to Video',
        prompt,
        outputs: [videoUrl],
        parameters: { aspectRatio },
      });
    } catch (e: any) {
      console.error(e);
      const errorText = (e.message || JSON.stringify(e)).toLowerCase();
      
      if (errorText.includes('lifetime quota exceeded')) {
        setError("The application's API key has exceeded its free quota. The service is temporarily unavailable. Please contact support.");
      } else if (errorText.includes('resource_exhausted') || errorText.includes('rate limit') || errorText.includes('quota')) {
        setError("The service is currently experiencing high traffic. Please wait a moment and try again.");
      } else {
        setError(e.message || "An unexpected error occurred during video generation. Please try again later.");
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
      setCooldownTime(10);
    }
  }, [prompt, aspectRatio, pollOperation, userSubscription, openAuthModal, setActivePage, onVideoGenerated, onAddToHistory]);

  return (
    <GeneratorCard title="Text to Video Generator">
      <div>
        <div className="flex justify-between items-center mb-2">
            <label htmlFor="prompt-video" className="block text-md font-medium text-slate-300">
            Enter your prompt
            </label>
            <button onClick={handleSuggestPrompt} className="flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors">
                <LightbulbIcon />
                <span className="ml-1">Suggest</span>
            </button>
        </div>
        <textarea
          id="prompt-video"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., An astronaut riding a horse on the moon"
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out placeholder:text-slate-400"
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="mt-6">
        <label className="block text-md font-medium text-slate-300 mb-2">
            Models
        </label>
        <div className="flex flex-wrap gap-2">
            {videoStyles.map((style) => (
                <button
                    key={style}
                    onClick={() => handleStyleClick(style)}
                    disabled={loading}
                    className="px-3 py-1.5 border rounded-lg text-xs font-semibold transition-colors duration-200 bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`Add style: ${style}`}
                >
                    {style}
                </button>
            ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-md font-medium text-slate-300 mb-2">
          Aspect Ratio
        </label>
        <div className="flex flex-wrap gap-3">
          {aspectRatios.map((ratio) => (
            <label key={ratio} className="relative cursor-pointer">
              <input
                type="radio"
                name="aspect-ratio-video-text"
                value={ratio}
                checked={aspectRatio === ratio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="sr-only"
                aria-label={`Aspect ratio ${ratio}`}
                disabled={loading}
              />
              <div
                className={`px-5 py-2 border rounded-lg text-sm font-semibold transition-colors duration-200 ${
                  aspectRatio === ratio
                    ? 'bg-sky-500 text-white border-sky-500 ring-2 ring-sky-300 ring-offset-1'
                    : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
                }`}
              >
                {ratio}
              </div>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">Note: Aspect ratio is a hint and may not be strictly applied by the current video model.</p>
      </div>

      <div className="mt-6">
        <button
          onClick={handleGenerate}
          disabled={loading || cooldownTime > 0}
          className="w-full sm:w-auto bg-sky-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-transform transform hover:scale-105 duration-200 disabled:bg-sky-500/50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {loading ? 'Generating...' : (cooldownTime > 0 ? `Please wait... (${cooldownTime}s)` : 'Generate')}
        </button>
      </div>
      <ResultPreview>
        {loading && <LoadingSpinner message={loadingMessage} />}
        {error && <div className="text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</div>}
        {!loading && !error && !result && <p className="text-slate-400 italic">Your generated video will appear here.</p>}
        {result && (
            <div className="relative group w-full">
                <video src={result} controls className="w-full rounded-lg" />
                 <a
                    href={result}
                    download="velora-ai-generated-video.mp4"
                    className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity opacity-0 group-hover:opacity-100"
                    aria-label="Download video"
                >
                    <DownloadIcon />
                </a>
            </div>
        )}
      </ResultPreview>
    </GeneratorCard>
  );
};
