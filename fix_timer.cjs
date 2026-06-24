const fs = require('fs');
let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

// Stop elapsedTime from resetting, and smooth out dynamicRemaining

const oldTimeLogic = `  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const dynamicRemaining = useMemo(() => {
    if (elapsedTime < 3 || progress < 2) return duration * 10; // Start with rough but stable estimate
    if (progress >= 100) return 0;
    
    const timePerPercent = elapsedTime / progress;
    const rawRemaining = Math.max(0, Math.ceil(timePerPercent * (100 - progress)));
    
    // Cap at a reasonable maximum to avoid wild spikes if progress briefly stalls
    return Math.min(rawRemaining, duration * 15);
  }, [elapsedTime, progress, duration]);`;

const newTimeLogic = `  // Track total generation time
  const [generationTook, setGenerationTook] = useState<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setGenerationTook(null); // Reset when starting
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      // Keep the time so we can show "took X seconds"
      if (elapsedTime > 0) {
        setGenerationTook(elapsedTime);
      }
    }
    return () => clearInterval(timer);
  }, [isLoading, elapsedTime]);

  const dynamicRemaining = useMemo(() => {
    // Smoother ETA that leans heavily on the duration estimate 
    // and doesn't jump wildly with random progress increments.
    if (progress >= 100) return 0;
    
    // Base estimate based on selected duration (e.g. 1 minute script takes ~15s to generate)
    const baseExpectedTime = duration * 10; 
    
    if (elapsedTime < 3 || progress < 5) return baseExpectedTime;
    
    // Blend the calculated time with the base expected time to prevent crazy spikes
    const timePerPercent = elapsedTime / progress;
    const calculatedRemaining = Math.max(0, Math.ceil(timePerPercent * (100 - progress)));
    
    // Interpolate between base and calculated to keep it stable
    const blended = Math.floor((calculatedRemaining * 0.4) + (baseExpectedTime * 0.6 * ((100 - progress) / 100)));
    
    return Math.min(blended, duration * 20); // Cap
  }, [elapsedTime, progress, duration]);`;

content = content.replace(oldTimeLogic, newTimeLogic);

// Add display for the completion time in the status area when NOT loading but generationTook is present
// Where is the status shown? In LoadingTerminal or inside the generated editor... 
// The user says "The number it computes is not real". Where is it currently shown?
// Nowhere! Wait, let's see.

fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
