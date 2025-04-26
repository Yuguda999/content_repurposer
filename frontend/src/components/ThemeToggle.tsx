import { IconButton, Tooltip, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeMode } from '../theme/ThemeProvider';

const ThemeToggle = () => {
  const { mode, toggleColorMode } = useThemeMode();
  const theme = useTheme();

  return (
    <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton
        onClick={toggleColorMode}
        sx={{
          color: theme.palette.mode === 'light' ? theme.palette.text.primary : 'inherit',
          transition: theme.transitions.create(['transform', 'color'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            transform: 'rotate(12deg)',
          },
        }}
      >
        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
