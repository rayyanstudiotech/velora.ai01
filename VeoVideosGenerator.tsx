

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GeneratorCard, ResultPreview } from '../GeneratorCard';
import { UserSubscription, Page, HistoryItem } from '../../types';
import { DownloadIcon } from '../Icons';

interface VeoVideosGeneratorProps {
    userSubscription: UserSubscription | null;
    openAuthModal: () => void;
    setActivePage: (page: Page) => void;
    onVideoGenerated: () => void;
    onAddToHistory: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => void;
}

const loadingMessages = [
  "Initializing advanced Veo model...",
  "Crafting high-definition storyboards...",
  "This can take several minutes, the results are worth it...",
  "Rendering cinematic-quality frames...",
  "Applying final polish to your Veo video...",
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


export const VeoVideosGenerator: React.FC<VeoVideosGeneratorProps> = ({ userSubscription, openAuthModal, setActivePage, onVideoGenerated, onAddToHistory }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [dialogue, setDialogue] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [cooldownTime, setCooldownTime] = useState<number>(0);

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
        setError("Please enter a prompt to generate a Veo video.");
        setResult(null);
        return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let finalPrompt = prompt.trim();
      if (dialogue.trim()) {
        finalPrompt += `\n\nAudio description: ${dialogue.trim()}`;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const operation = await ai.models.generateVideos({
          model: 'veo-2.0-generate-001',
          prompt: finalPrompt,
          config: {
              numberOfVideos: 1
          }
      });
      const videoUrl = await pollOperation(ai, operation);
      setResult(videoUrl);
      onVideoGenerated();
      onAddToHistory({
        type: 'Veo Video',
        prompt: finalPrompt,
        outputs: [videoUrl],
        parameters: { dialogue: dialogue.trim() },
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
  }, [prompt, dialogue, pollOperation, userSubscription, openAuthModal, setActivePage, onVideoGenerated, onAddToHistory]);

  return (
    <GeneratorCard title="Veo Videos Generator">
      <div>
        <label htmlFor="prompt-veo" className="block text-md font-medium text-slate-300 mb-2">
          Describe the Veo video you want to create
        </label>
        <textarea
          id="prompt-veo"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A majestic cinematic shot of a futuristic city at sunset"
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out placeholder:text-slate-400"
          rows={3}
          disabled={loading}
        />
        <p className="mt-2 text-sm text-slate-400">Create stunning, high-definition videos with our most advanced model.</p>
      </div>

      <div className="mt-6">
        <label htmlFor="dialogue-veo" className="block text-md font-medium text-slate-300 mb-2">
          Dialogue & Sound
        </label>
        <textarea
          id="dialogue-veo"
          value={dialogue}
          onChange={(e) => setDialogue(e.target.value)}
          placeholder="e.g., Character: 'Let's go!' [Sound of spaceship engine roaring to life]"
          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out placeholder:text-slate-400"
          rows={3}
          disabled={loading}
        />
        <p className="mt-2 text-sm text-slate-400">Describe character dialogue and sound effects. The model will generate audio for your video.</p>
      </div>

      <div className="mt-8">
        <button
          onClick={handleGenerate}
          disabled={loading || cooldownTime > 0}
          className="w-full sm:w-auto bg-sky-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-transform transform hover:scale-105 duration-200 disabled:bg-sky-500/50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {loading ? 'Generating...' : (cooldownTime > 0 ? `Please wait... (${cooldownTime}s)` : 'Generate with Veo')}
        </button>
      </div>
      <ResultPreview>
         {loading && <LoadingSpinner message={loadingMessage} />}
         {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-lg">{error}</p>}
         {!loading && !error && !result && <p className="text-slate-400 italic">Your generated Veo video will appear here.</p>}
         {result && (
            <div className="relative group w-full">
                <video src={result} controls className="w-full rounded-lg" />
                 <a
                    href={result}
                    download="velora-ai-generated-veo-video.mp4"
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
