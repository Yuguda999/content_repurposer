import { Box, Typography, useTheme } from '@mui/material';
import { AutoAwesome as SparkleIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface LogoProps {
  variant?: 'default' | 'sidebar' | 'footer';
  showText?: boolean;
}

const Logo = ({ variant = 'default', showText = true }: LogoProps) => {
  const theme = useTheme();
  
  // Determine size based on variant
  const iconSize = variant === 'sidebar' ? 32 : variant === 'footer' ? 24 : 28;
  const fontSize = variant === 'sidebar' ? 'h5' : variant === 'footer' ? 'body1' : 'h6';
  
  // Logo animation variants
  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        delay: 0.2
      }
    }
  };
  
  // Sparkle animation variants
  const sparkleVariants = {
    hidden: { opacity: 0, rotate: -45 },
    visible: { 
      opacity: 1, 
      rotate: 0,
      transition: { 
        duration: 0.5,
        delay: 0.3
      }
    }
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={logoVariants}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: iconSize + 8,
            height: iconSize + 8,
            borderRadius: '12px',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
              : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 4px 12px rgba(59, 130, 246, 0.3)'
              : '0 4px 12px rgba(37, 99, 235, 0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: '#ffffff',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              fontSize: iconSize * 0.7,
            }}
          >
            CR
          </Typography>
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={sparkleVariants}
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
            }}
          >
            <SparkleIcon 
              sx={{ 
                fontSize: iconSize * 0.5,
                color: '#ffffff',
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))',
              }} 
            />
          </motion.div>
        </Box>
      </motion.div>
      
      {showText && (
        <Typography
          variant={fontSize}
          component={motion.div}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          sx={{
            fontWeight: 700,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(90deg, #60a5fa, #a78bfa)'
              : 'linear-gradient(90deg, #2563eb, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px',
          }}
        >
          Content Repurposer
        </Typography>
      )}
    </Box>
  );
};

export default Logo;
