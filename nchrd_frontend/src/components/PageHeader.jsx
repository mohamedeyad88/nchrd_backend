import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const PageHeader = ({ title, btnLabel, onAdd }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
      <Typography variant="h4" color="primary">
        {title}
      </Typography>
      <Button 
        variant="contained" 
        startIcon={<AddIcon />} 
        onClick={onAdd}
        sx={{ px: 4 }} // Padding ثابت
      >
        {btnLabel}
      </Button>
    </Box>
  );
};

export default PageHeader;