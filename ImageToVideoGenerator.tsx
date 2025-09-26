

import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GeneratorCard, ResultPreview } from '../GeneratorCard';
import { UserSubscription, Page, HistoryItem } from '../../types';
import { DownloadIcon } from '../Icons';

interface ImageToVideoGeneratorProps {
    userSubscription: UserSubscription | null;
    openAuthModal: () => void;
    setActivePage: (page: Page) => void;
    onVideoGenerated: () => void;
    onAddToHistory: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => void;
}

const loadingMessages = [
  "Analyzing your image...",
  "Preparing the animation sequence...",
  "This can take a few minutes, please wait...",
  "Rendering video frames...",
  "Finalizing your animated video...",
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

const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to read file as base64 string."));
            }
        };
        reader.onerror = error => reject(error);
    });
};


export const ImageToVideoGenerator: React.FC<ImageToVideoGeneratorProps> = ({ userSubscription, openAuthModal, setActivePage, onVideoGenerated, onAddToHistory }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
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
        } catch(e) {
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
    if (!imageFile) {
        setError("Please upload an image to generate a video.");
        setResult(null);
        return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
        const imageBytes = await getBase64(imageFile);
        const ai = new GoogleGenAI({ apiKey: "AIzaSyB7O8JZHnFzFNK6HBfysAZJS1lbUG2RTew" });
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt || 'Animate this image.',
            image: {
                imageBytes: imageBytes,
                mimeType: imageFile.type,
            },
            config: {
                numberOfVideos: 1
            }
        });
        const videoUrl = await pollOperation(ai, operation);
        setResult(videoUrl);
        onVideoGenerated();
        onAddToHistory({
            type: 'Image to Video',
            prompt: prompt || 'Animate this image.',
            outputs: [videoUrl],
            parameters: { aspectRatio, inputImage: imagePreview },
        });
    } catch(e: any) {
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
        setCooldownTime(10);
    }
  }, [imageFile, prompt, imagePreview, aspectRatio, pollOperation, userSubscription, openAuthModal, setActivePage, onVideoGenerated, onAddToHistory]);

  return (
    <GeneratorCard title="Image to Video Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="image-upload" className="block text-md font-medium text-slate-300 mb-2">
            Upload your image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                {imagePreview ? (
                     <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto rounded-md" />
                ) : (
                    <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
              <div className="flex text-sm text-slate-400">
                <label htmlFor="image-upload" className={`relative cursor-pointer rounded-md font-medium text-sky-400 hover:text-sky-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500 ${loading ? 'pointer-events-none' : ''}`}>
                  <span>Upload a file</span>
                  <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} disabled={loading} />
                </label>
                <p className="pl-1">{imageFile ? imageFile.name : 'or drag and drop'}</p>
              </div>
              <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="prompt-img-video" className="block text-md font-medium text-slate-300 mb-2">
            (Optional) Add a prompt to guide the video
          </label>
          <textarea
            id="prompt-img-video"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Make the scene snowy"
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out placeholder:text-slate-400"
            rows={5}
            disabled={loading}
          />
        </div>
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
                name="aspect-ratio-video-image"
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
          disabled={loading || !imageFile || cooldownTime > 0}
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
