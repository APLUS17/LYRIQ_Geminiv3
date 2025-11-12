// This is a browser-only service
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

// A function to decode base64 audio data into an AudioBuffer
async function decodeAudioData(base64: string): Promise<AudioBuffer> {
    try {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const arrayBuffer = bytes.buffer;
        return await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error("Failed to decode audio data:", error);
        throw error;
    }
}

/**
 * Generates a simplified waveform from audio data for visualization.
 * @param base64 - The base64 encoded audio data.
 * @param barCount - The number of bars to generate for the waveform.
 * @returns A promise that resolves to an array of numbers (0-1) representing the waveform.
 */
export async function generateWaveform(base64: string, barCount: number = 100): Promise<number[]> {
    if (!base64) {
        return Array(barCount).fill(0);
    }

    try {
        const audioBuffer = await decodeAudioData(base64);
        const channelData = audioBuffer.getChannelData(0); // Use the first channel
        const totalSamples = channelData.length;
        
        const samplesPerBar = Math.floor(totalSamples / barCount);
        const waveform: number[] = [];
        let maxPeak = 0;

        // First pass: find the absolute maximum peak in the entire audio
        for (let i = 0; i < totalSamples; i++) {
            const peak = Math.abs(channelData[i]);
            if (peak > maxPeak) {
                maxPeak = peak;
            }
        }
        
        if (maxPeak === 0) return Array(barCount).fill(0); // Handle silence

        // Second pass: calculate peaks for each bar and normalize
        for (let i = 0; i < barCount; i++) {
            const start = i * samplesPerBar;
            const end = start + samplesPerBar;
            let barPeak = 0;

            for (let j = start; j < end; j++) {
                const sample = Math.abs(channelData[j] || 0);
                if (sample > barPeak) {
                    barPeak = sample;
                }
            }
            
            // Normalize the bar's peak against the absolute max peak
            waveform.push(barPeak / maxPeak);
        }
        
        return waveform;
    } catch (error) {
        console.error("Error generating waveform:", error);
        return Array(barCount).fill(0.1); // Return a default waveform on error
    }
}
