import { ReactNode, useEffect, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: ReactNode;
}

// Generate random shapes for the background
const generateShapes = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 80 + 20,
    rotation: Math.random() * 360,
    opacity: Math.random() * 0.5 + 0.1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
    type: Math.random() > 0.5 ? 'circle' : 'square',
  }));
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const theme = useTheme();
  const [shapes, setShapes] = useState(generateShapes(25));

  // Regenerate shapes on theme change
  useEffect(() => {
    setShapes(generateShapes(25));
  }, [theme.palette.mode]);

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', width: '100%' }}>
      {/* Background container with fixed position */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          overflow: 'hidden',
        }}
      >
        {/* Animated shapes */}
        {shapes.map((shape) => (
          <motion.div
            key={shape.id}
            initial={{
              x: `${shape.x}vw`,
              y: `${shape.y}vh`,
              rotate: shape.rotation,
              opacity: shape.opacity,
            }}
            animate={{
              x: `${(shape.x + 10) % 100}vw`,
              y: `${(shape.y + 10) % 100}vh`,
              rotate: shape.rotation + 360,
              opacity: shape.opacity,
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: shape.delay,
            }}
            style={{
              position: 'absolute',
              width: shape.size,
              height: shape.size,
              borderRadius: shape.type === 'circle' ? '50%' : '20%',
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(45deg, ${theme.palette.primary.dark}40, ${theme.palette.secondary.dark}40)`
                : `linear-gradient(45deg, ${theme.palette.primary.light}30, ${theme.palette.secondary.light}30)`,
              zIndex: 1,
            }}
          />
        ))}
      </Box>

      {/* Content container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          width: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AuthLayout;
