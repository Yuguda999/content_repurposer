import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  useTheme 
} from '@mui/material';
import { keyframes } from '@mui/system';

// Define animation for the progress indicator
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

// Generation steps
const generationSteps = [
  'Analyzing content',
  'Generating ideas',
  'Creating drafts',
  'Optimizing for platforms',
  'Finalizing content'
];

interface ContentGenerationProgressProps {
  isGenerating: boolean;
  onComplete?: () => void;
  platformCount?: number;
}

const ContentGenerationProgress = ({ 
  isGenerating, 
  onComplete,
  platformCount = 3
}: ContentGenerationProgressProps) => {
  const theme = useTheme();
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Preparing to generate content...');

  // Status messages for each platform
  const platformMessages = [
    'Creating Twitter content...',
    'Designing Instagram post...',
    'Crafting LinkedIn article...',
    'Preparing Facebook update...',
    'Generating thumbnail image...'
  ];

  // Simulate progress updates
  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      setActiveStep(0);
      setStatusMessage('Preparing to generate content...');
      return;
    }

    // Reset progress when generation starts
    setProgress(0);
    setActiveStep(0);

    // Simulate the progress
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          if (onComplete) onComplete();
          return 100;
        }

        // Update step based on progress
        const newStep = Math.floor((prevProgress / 100) * generationSteps.length);
        if (newStep !== activeStep) {
          setActiveStep(newStep);
        }

        // Update status message
        if (prevProgress < 20) {
          setStatusMessage('Analyzing content structure and key points...');
        } else if (prevProgress < 40) {
          setStatusMessage('Generating platform-specific content ideas...');
        } else if (prevProgress < 60) {
          // Cycle through platform messages
          const platformIndex = Math.floor((prevProgress - 40) / 5) % platformCount;
          setStatusMessage(platformMessages[platformIndex]);
        } else if (prevProgress < 80) {
          setStatusMessage('Optimizing content for engagement...');
        } else if (prevProgress < 95) {
          setStatusMessage('Finalizing and preparing delivery...');
        } else {
          setStatusMessage('Content generation complete!');
        }

        // Calculate next progress value
        const increment = Math.random() * 3 + 1; // Random increment between 1 and 4
        return Math.min(prevProgress + increment, 100);
      });
    }, 300); // Update every 300ms

    return () => {
      clearInterval(timer);
    };
  }, [isGenerating, onComplete, activeStep, platformCount]);

  if (!isGenerating && progress === 0) {
    return null;
  }

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.standard,
        }),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <Typography variant="h6" gutterBottom>
        Content Generation Progress
      </Typography>
      
      <Box sx={{ width: '100%', mb: 2 }}>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{
            height: 10,
            borderRadius: 5,
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
            },
          }}
        />
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mt: 1 
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {statusMessage}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`${Math.round(progress)}%`}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {generationSteps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                StepIconProps={{
                  sx: {
                    ...(index === activeStep && {
                      animation: `${pulse} 2s infinite`,
                    }),
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      {/* Animated indicator */}
      {isGenerating && progress < 100 && (
        <Box 
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 3,
            background: `linear-gradient(90deg, 
              ${theme.palette.primary.main} 0%, 
              ${theme.palette.secondary.main} 50%, 
              ${theme.palette.primary.main} 100%)`,
            backgroundSize: '200% 100%',
            animation: `${keyframes`
              0% { background-position: 100% 0; }
              100% { background-position: 0 0; }
            `} 2s linear infinite`,
          }}
        />
      )}
    </Paper>
  );
};

export default ContentGenerationProgress;
