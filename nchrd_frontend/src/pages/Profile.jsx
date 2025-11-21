import { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, Grid } from '@mui/material';
import { toast } from 'react-toastify';
import api from '../services/api';
import PageHeader from '../components/PageHeader';

const Profile = () => {
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm_password: '' });

  const handleChangePassword = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      return toast.error("كلمة المرور الجديدة غير متطابقة");
    }
    
    try {
      await api.post('change-password/', {
        old_password: passwords.old_password,
        new_password: passwords.new_password
      });
      toast.success("تم تغيير كلمة المرور بنجاح");
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || "فشل التغيير (كلمة المرور القديمة خطأ)");
    }
  };

  return (
    <Box maxWidth="md" mx="auto">
      <PageHeader title="👤 الملف الشخصي" btnLabel="" onAdd={() => {}} />
      
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>تغيير كلمة المرور</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="كلمة المرور الحالية" type="password" fullWidth
              value={passwords.old_password}
              onChange={(e) => setPasswords({...passwords, old_password: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="كلمة المرور الجديدة" type="password" fullWidth
              value={passwords.new_password}
              onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="تأكيد كلمة المرور" type="password" fullWidth
              value={passwords.confirm_password}
              onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" size="large" onClick={handleChangePassword}>
              حفظ التغييرات
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;