import { useState } from 'react';
import { 
  Box, Paper, Grid, Typography, TextField, MenuItem, Button, 
  Card, CardContent, LinearProgress, Chip 
} from '@mui/material';
import { toast } from 'react-toastify';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';

const Reports = () => {
  const [filters, setFilters] = useState({ type: 'daily', date: '', week: '', month: '' });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // تحديد أعمدة جدول الحضور
  const columns = [
    { field: 'student_name', headerName: 'الطالب' },
    { field: 'company_name', headerName: 'الشركة' },
    { field: 'date', headerName: 'التاريخ' },
    { 
      field: 'status', 
      headerName: 'الحالة',
      render: (row) => (
        <Chip 
          label={row.status === 'present' ? 'حاضر' : 'غائب'} 
          color={row.status === 'present' ? 'success' : 'error'} 
          size="small" 
        />
      )
    },
    { field: 'reason', headerName: 'سبب الغياب' }
  ];

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // تجهيز البارامترات حسب النوع
      const params = { type: filters.type };
      if (filters.type === 'daily') params.date = filters.date;
      if (filters.type === 'weekly') params.week = filters.week;
      if (filters.type === 'monthly') params.month = filters.month;

      const res = await api.get('attendance-report/', { params });
      setReportData(res.data);
      toast.success("تم استخراج التقرير");
    } catch (err) {
      toast.error("فشل استخراج التقرير، تأكد من اختيار التاريخ");
    } finally {
      setLoading(false);
    }
  };

  // مكون لبطاقة الإحصائيات الصغيرة
  const StatBox = ({ title, value, color }) => (
    <Card sx={{ bgcolor: 'background.paper', borderLeft: `4px solid ${color}` }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary">{title}</Typography>
        <Typography variant="h4" fontWeight="bold" sx={{ color }}>{value}</Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <PageHeader title="📑 التقارير والإحصائيات" btnLabel="" onAdd={() => {}} />

      {/* فلتر التقرير */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              select label="نوع التقرير" fullWidth
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <MenuItem value="daily">تقرير يومي</MenuItem>
              <MenuItem value="weekly">تقرير أسبوعي</MenuItem>
              <MenuItem value="monthly">تقرير شهري</MenuItem>
            </TextField>
          </Grid>

          {/* إظهار حقل التاريخ حسب النوع */}
          <Grid item xs={12} md={3}>
            {filters.type === 'daily' && (
              <TextField type="date" fullWidth label="التاريخ" InputLabelProps={{ shrink: true }}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
            )}
            {filters.type === 'weekly' && (
              <TextField type="week" fullWidth label="الأسبوع" InputLabelProps={{ shrink: true }}
                onChange={(e) => setFilters({ ...filters, week: e.target.value })} />
            )}
            {filters.type === 'monthly' && (
              <TextField type="month" fullWidth label="الشهر" InputLabelProps={{ shrink: true }}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })} />
            )}
          </Grid>

          <Grid item xs={12} md={2}>
            <Button 
              variant="contained" size="large" fullWidth onClick={handleGenerateReport}
              disabled={loading}
            >
              عرض التقرير
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* عرض النتائج */}
      {reportData && (
        <Box>
          <Typography variant="h5" gutterBottom>
            نتائج الفترة: {reportData.date_range}
          </Typography>
          
          {/* كروت الملخص */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} md={3}><StatBox title="إجمالي السجلات" value={reportData.total_records} color="#1976d2" /></Grid>
            <Grid item xs={6} md={3}><StatBox title="حضور" value={reportData.present} color="#2e7d32" /></Grid>
            <Grid item xs={6} md={3}><StatBox title="غياب" value={reportData.absent} color="#d32f2f" /></Grid>
            <Grid item xs={6} md={3}><StatBox title="نسبة الحضور" value={`${reportData.attendance_rate}%`} color="#ed6c02" /></Grid>
          </Grid>

          {/* الجدول التفصيلي */}
          <DataTable columns={columns} rows={reportData.records} onDelete={() => {}} onEdit={() => {}} />
        </Box>
      )}
    </Box>
  );
};

export default Reports;