import { Grid, Paper, Typography, Box, Card, CardContent, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

// مكون للكارت (مثل الموجود في الصورة)
const DashboardCard = ({ title, value, subValue, icon, isPositive }) => (
  <Card sx={{ bgcolor: '#1E1E1E', borderRadius: 2, height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
          {icon}
        </Box>
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>{value}</Typography>
        </Box>
      </Box>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: isPositive ? '#4CAF50' : '#f44336', 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 'bold'
          }}
        >
          {subValue} {isPositive ? '↗' : '↘'}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const Home = () => {
  // بيانات وهمية للجدول (مؤقتاً لتطابق الصورة)
  const units = [
    { name: 'وحدة الجيزة', manager: 'أحمد محمد', supervisors: 5, performance: 'ممتاز', status: 'نشطة' },
    { name: 'وحدة أسيوط', manager: 'سارة علي', supervisors: 3, performance: 'جيد', status: 'نشطة' },
  ];

  return (
    <Box>
      {/* عنوان الصفحة */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h5" fontWeight="bold">
          لوحة القيادة المركزية
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, mr: 1 }}>
          نظرة شاملة على أداء المنظومة في الوقت الفعلي
        </Typography>
      </Box>

      {/* صف الكروت */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <DashboardCard 
            title="عدد الوحدات النشطة" 
            value="2" 
            subValue="+2 عن الشهر الماضي" 
            icon={<BusinessIcon color="primary" />} 
            isPositive={true} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <DashboardCard 
            title="إجمالي المستخدمين" 
            value="2" 
            subValue="+12% عن الشهر الماضي" 
            icon={<GroupIcon color="warning" />} 
            isPositive={true} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <DashboardCard 
            title="معدل الأداء العام" 
            value="87%" 
            subValue="+5% عن الشهر الماضي" 
            icon={<TrendingUpIcon color="success" />} 
            isPositive={true} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <DashboardCard 
            title="تنبيهات النظام" 
            value="0" 
            subValue="لا توجد تنبيهات" 
            icon={<NotificationsActiveIcon color="error" />} 
            isPositive={false} 
          />
        </Grid>
      </Grid>

      {/* صف الرسم البياني والأنشطة */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* الأنشطة (يمين) */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: '#1E1E1E', height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">أحدث الأنشطة</Typography>
              <Chip label="مباشر" color="error" size="small" />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ borderRight: '2px solid #1976d2', pr: 2 }}>
                <Typography variant="body2">تم تعيين مدير جديد لوحدة الجيزة</Typography>
                <Typography variant="caption" color="text.secondary">منذ 2 ساعة</Typography>
              </Box>
              <Box sx={{ borderRight: '2px solid #f44336', pr: 2 }}>
                <Typography variant="body2">انخفاض في تقييمات وحدة الفيوم</Typography>
                <Typography variant="caption" color="text.secondary">منذ 5 ساعات</Typography>
              </Box>
              <Box sx={{ borderRight: '2px solid #1976d2', pr: 2 }}>
                <Typography variant="body2">اكتمال تسكين 50 طالب جديد</Typography>
                <Typography variant="caption" color="text.secondary">منذ يوم</Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="primary" sx={{ mt: 3, cursor: 'pointer' }}>
              عرض كل السجل
            </Typography>
          </Paper>
        </Grid>

        {/* الرسم البياني (يسار - صورة توضيحية أو مكتبة) */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, bgcolor: '#1E1E1E', height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ alignSelf: 'flex-start', mb: 2 }}>
              تحليل الأداء الزمني للوحدات
            </Typography>
            {/* هنا المفروض يكون فيه رسم بياني حقيقي باستخدام Recharts */}
            {/* حالياً سنضع شكلاً تقريبياً بالـ CSS */}
            <Box sx={{ width: '100%', height: '200px', display: 'flex', alignItems: 'flex-end', gap: 2, borderBottom: '1px solid #555', pb: 1 }}>
               {/* أعمدة وهمية للرسم البياني */}
               <Box sx={{ width: '10%', height: '40%', bgcolor: '#D32F2F', borderRadius: '4px 4px 0 0' }} />
               <Box sx={{ width: '10%', height: '60%', bgcolor: '#D32F2F', borderRadius: '4px 4px 0 0' }} />
               <Box sx={{ width: '10%', height: '50%', bgcolor: '#D32F2F', borderRadius: '4px 4px 0 0' }} />
               <Box sx={{ width: '10%', height: '80%', bgcolor: '#D32F2F', borderRadius: '4px 4px 0 0' }} />
               <Box sx={{ width: '10%', height: '90%', bgcolor: '#D32F2F', borderRadius: '4px 4px 0 0' }} />
               <Box sx={{ width: '10%', height: '85%', bgcolor: '#D32F2F', borderRadius: '4px 4px 0 0' }} />
            </Box>
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption">يناير</Typography>
                <Typography variant="caption">فبراير</Typography>
                <Typography variant="caption">مارس</Typography>
                <Typography variant="caption">أبريل</Typography>
                <Typography variant="caption">مايو</Typography>
                <Typography variant="caption">يونيو</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* جدول الوحدات في الأسفل */}
      <Paper sx={{ width: '100%', overflow: 'hidden', bgcolor: '#1E1E1E', borderRadius: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight="bold">حالة الوحدات الإقليمية</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#121212' }}>
              <TableRow>
                <TableCell sx={{ color: '#aaa' }}>اسم الوحدة</TableCell>
                <TableCell sx={{ color: '#aaa' }}>المدير المسؤول</TableCell>
                <TableCell sx={{ color: '#aaa' }}>المشرفين</TableCell>
                <TableCell sx={{ color: '#aaa' }}>الأداء</TableCell>
                <TableCell sx={{ color: '#aaa' }}>الحالة</TableCell>
                <TableCell sx={{ color: '#aaa' }}>إجراء</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {units.map((row) => (
                <TableRow key={row.name} hover>
                  <TableCell sx={{ color: '#fff' }}>{row.name}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{row.manager}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{row.supervisors}</TableCell>
                  <TableCell sx={{ color: '#4CAF50' }}>{row.performance}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color="success" size="small" variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ color: '#fff' }}>...</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Home;