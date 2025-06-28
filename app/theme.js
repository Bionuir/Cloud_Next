// theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // o 'dark'
    primary: {
      main: '#6750A4', // color primario de Material 3
    },
    secondary: {
      main: '#625B71',
    },
    background: {
      default: '#FFFFFF',
    },
  },
  shape: {
    borderRadius: 12, // bordes más suaves como en Material 3
  },
});

export default theme;
