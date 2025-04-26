import { Box, useTheme } from '@mui/material';
import { keyframes } from '@mui/system';
import { useThemeMode } from '../theme/ThemeProvider';
import { useLocation } from 'react-router-dom';

// Define animations
const float = keyframes`
  0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
  25% { transform: translateY(-30px) translateX(15px) rotate(5deg); }
  50% { transform: translateY(-15px) translateX(30px) rotate(10deg); }
  75% { transform: translateY(15px) translateX(15px) rotate(5deg); }
  100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
`;

const morph = keyframes`
  0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  25% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  50% { border-radius: 50% 60% 30% 40% / 40% 30% 70% 60%; }
  75% { border-radius: 40% 60% 70% 30% / 60% 40% 30% 60%; }
  100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
`;

const pulse = keyframes`
  0% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
  100% { opacity: 0.3; transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

interface AnimatedBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
}

const AnimatedBackground = ({ intensity = 'medium' }: AnimatedBackgroundProps) => {
  const theme = useTheme();
  const { mode } = useThemeMode();
  const location = useLocation();

  // Determine if we're on the login or signup page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Adjust number of shapes based on intensity and page
  const shapeCount = isAuthPage ? 15 : intensity === 'low' ? 5 : intensity === 'medium' ? 8 : 12;

  // Generate different shape types
  const generateShapes = () => {
    const shapes = [];

    // Color palette based on theme
    const colors = mode === 'light'
      ? [
          theme.palette.primary.light,
          theme.palette.secondary.light,
          theme.palette.info.light,
          theme.palette.success.light,
          '#e3f2fd', // Light blue
          '#f3e5f5', // Light purple
        ]
      : [
          theme.palette.primary.dark,
          theme.palette.secondary.dark,
          theme.palette.info.dark,
          theme.palette.success.dark,
          '#1a237e', // Deep blue
          '#4a148c', // Deep purple
        ];

    // Generate circles
    for (let i = 0; i < Math.floor(shapeCount * 0.4); i++) {
      const size = Math.floor(Math.random() * 150) + 50; // Random size between 50 and 200
      shapes.push({
        type: 'circle',
        size,
        top: `${Math.floor(Math.random() * 100)}%`,
        left: `${Math.floor(Math.random() * 100)}%`,
        animationDuration: `${Math.floor(Math.random() * 15) + 20}s`, // 20-35s
        delay: `${Math.floor(Math.random() * 10)}s`,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: isAuthPage ? (mode === 'light' ? 0.15 : 0.25) : (mode === 'light' ? 0.07 : 0.12),
      });
    }

    // Generate blobs (morphing shapes)
    for (let i = 0; i < Math.floor(shapeCount * 0.3); i++) {
      const size = Math.floor(Math.random() * 200) + 100; // Random size between 100 and 300
      shapes.push({
        type: 'blob',
        size,
        top: `${Math.floor(Math.random() * 100)}%`,
        left: `${Math.floor(Math.random() * 100)}%`,
        animationDuration: `${Math.floor(Math.random() * 10) + 25}s`, // 25-35s
        morphDuration: `${Math.floor(Math.random() * 5) + 15}s`, // 15-20s
        delay: `${Math.floor(Math.random() * 10)}s`,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: isAuthPage ? (mode === 'light' ? 0.12 : 0.2) : (mode === 'light' ? 0.05 : 0.1),
      });
    }

    // Generate gradient blobs
    for (let i = 0; i < Math.floor(shapeCount * 0.3); i++) {
      const size = Math.floor(Math.random() * 250) + 150; // Random size between 150 and 400
      const colorIndex1 = Math.floor(Math.random() * colors.length);
      let colorIndex2 = Math.floor(Math.random() * colors.length);
      // Make sure we get different colors
      while (colorIndex2 === colorIndex1) {
        colorIndex2 = Math.floor(Math.random() * colors.length);
      }

      shapes.push({
        type: 'gradient',
        size,
        top: `${Math.floor(Math.random() * 100)}%`,
        left: `${Math.floor(Math.random() * 100)}%`,
        animationDuration: `${Math.floor(Math.random() * 15) + 30}s`, // 30-45s
        morphDuration: `${Math.floor(Math.random() * 5) + 20}s`, // 20-25s
        shimmerDuration: `${Math.floor(Math.random() * 10) + 15}s`, // 15-25s
        delay: `${Math.floor(Math.random() * 10)}s`,
        color1: colors[colorIndex1],
        color2: colors[colorIndex2],
        opacity: isAuthPage ? (mode === 'light' ? 0.18 : 0.3) : (mode === 'light' ? 0.07 : 0.15),
      });
    }

    return shapes;
  };

  const shapes = generateShapes();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        overflow: 'hidden',
        background: mode === 'light'
          ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,242,245,0.9) 100%)'
          : 'linear-gradient(135deg, rgba(18,18,18,0.95) 0%, rgba(30,30,30,0.95) 100%)',
      }}
    >
      {shapes.map((shape, index) => {
        if (shape.type === 'circle') {
          return (
            <Box
              key={`circle-${index}`}
              sx={{
                position: 'absolute',
                width: shape.size,
                height: shape.size,
                borderRadius: '50%',
                backgroundColor: shape.color,
                opacity: shape.opacity,
                top: shape.top,
                left: shape.left,
                animation: `${float} ${shape.animationDuration} ease-in-out infinite, ${pulse} ${
                  parseInt(shape.animationDuration) / 3
                }s ease-in-out infinite`,
                animationDelay: shape.delay,
                filter: isAuthPage ? 'blur(6px)' : 'blur(8px)',
              }}
            />
          );
        } else if (shape.type === 'blob') {
          return (
            <Box
              key={`blob-${index}`}
              sx={{
                position: 'absolute',
                width: shape.size,
                height: shape.size,
                backgroundColor: shape.color,
                opacity: shape.opacity,
                top: shape.top,
                left: shape.left,
                animation: `${float} ${shape.animationDuration} ease-in-out infinite, ${morph} ${
                  shape.morphDuration
                } ease-in-out infinite, ${pulse} ${
                  parseInt(shape.animationDuration) / 3
                }s ease-in-out infinite`,
                animationDelay: shape.delay,
                borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                filter: isAuthPage ? 'blur(8px)' : 'blur(12px)',
              }}
            />
          );
        } else if (shape.type === 'gradient') {
          return (
            <Box
              key={`gradient-${index}`}
              sx={{
                position: 'absolute',
                width: shape.size,
                height: shape.size,
                background: `linear-gradient(45deg, ${shape.color1}, ${shape.color2})`,
                backgroundSize: '400% 400%',
                opacity: shape.opacity,
                top: shape.top,
                left: shape.left,
                animation: `${float} ${shape.animationDuration} ease-in-out infinite, ${morph} ${
                  shape.morphDuration
                } ease-in-out infinite, ${shimmer} ${
                  shape.shimmerDuration
                } linear infinite`,
                animationDelay: shape.delay,
                borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                filter: isAuthPage ? 'blur(10px)' : 'blur(16px)',
              }}
            />
          );
        }
        return null;
      })}

      {/* Add a subtle grid overlay for depth */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: mode === 'light'
            ? 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)'
            : 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          zIndex: -1,
        }}
      />
    </Box>
  );
};

export default AnimatedBackground;
