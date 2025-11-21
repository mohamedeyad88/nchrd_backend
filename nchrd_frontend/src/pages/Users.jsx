import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField, MenuItem, Chip } from '@mui/material';
import { toast } from 'react-toastify';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'employee', phone: '' });

  const roles = [
    { value: 'admin', label: 'مسؤول النظام (Admin)', color: 'error' },
    { value: 'manager', label: 'مدير فرع', color: 'warning' },
    { value: 'supervisor', label: 'مشرف', color: 'info' },
    { value: 'employee', label: 'موظف', color: 'default' },
    { value: 'institution', label: 'مؤسسة تدريبية', color: 'secondary' },
  ];

  const columns = [
    { field: 'username', headerName: 'اسم المستخدم' },
    { field: 'email', headerName: 'البريد الإلكتروني' },
    { field: 'phone', headerName: 'الهاتف' },
    { 
      field: 'role', 
      headerName: 'الصلاحية',
      render: (row) => {
        const role = roles.find(r => r.value === row.role) || {};
        return <Chip label={role.label || row.role} color={role.color || 'default'} size="small" />;
      }
    }
  ];

  const fetchData = async () => {
    try {
      const res = await api.get('users/');
      setUsers(res.data);
    } catch (err) {
      toast.error("فشل تحميل المستخدمين");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    try {
      await api.post('users/', formData);
      toast.success("تم إضافة المستخدم");
      setOpen(false);
      fetchData();
    } catch (err) {
      toast.error("حدث خطأ (ربما اسم المستخدم مكرر)");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("حذف هذا المستخدم؟")) {
      try {
        await api.delete(`users/${id}/`);
        toast.success("تم الحذف");
        fetchData();
      } catch (err) {
        toast.error("فشل الحذف (لا يمكن حذف نفسك أو الأدمن الرئيسي)");
      }
    }
  };

  return (
    <Box>
      <PageHeader title="👥 إدارة المستخدمين" btnLabel="مستخدم جديد" onAdd={() => setOpen(true)} />
      <DataTable columns={columns} rows={users} onDelete={handleDelete} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إضافة مستخدم جديد</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="اسم المستخدم" fullWidth onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
            <TextField label="البريد الإلكتروني" fullWidth onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <TextField label="كلمة المرور" type="password" fullWidth onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            <TextField label="الهاتف" fullWidth onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <TextField select label="الصلاحية" fullWidth value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              {roles.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">إلغاء</Button>
          <Button onClick={handleSave} variant="contained">حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;