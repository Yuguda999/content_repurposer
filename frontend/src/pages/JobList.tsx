import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Stack,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useJobs } from '../hooks/useJobs';
import { Job, JobStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import JobStatusBadge from '../components/JobStatusBadge';

const JobList = () => {
  const { getJobs } = useJobs();
  const { data: jobs, isLoading, error } = getJobs;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleStatusFilterChange = (status: JobStatus | 'all') => {
    setStatusFilter(status);
    setPage(0);
  };

  // Filter and sort jobs
  const filteredJobs = jobs
    ? jobs
        .filter(job =>
          (statusFilter === 'all' || job.status === statusFilter) &&
          (searchTerm === '' ||
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.id.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : [];

  const paginatedJobs = filteredJobs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    console.error('JobList error:', error);
    return (
      <Box>
        <ErrorMessage message="Failed to load jobs. Please ensure the backend server is running." />
        <Box mt={2} mb={4}>
          <Typography variant="body2" color="text.secondary">
            The application requires a running backend server to function properly. Please start the backend server and refresh the page.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Refresh Page
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(90deg, #60a5fa, #a78bfa)'
              : 'linear-gradient(90deg, #2563eb, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Job History
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/new"
          sx={{
            borderRadius: '10px',
            px: 3,
            py: 1,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(45deg, #3b82f6 30%, #8b5cf6 90%)'
              : 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
            color: '#ffffff',
            '&:hover': {
              boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
              transform: 'translateY(-2px)',
            },
            transition: theme.transitions.create(['transform', 'box-shadow'], {
              duration: theme.transitions.duration.shorter,
            }),
          }}
        >
          New Content
        </Button>
      </Box>

      <Paper sx={{ mb: 4, p: 2 }}>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2}>
          <TextField
            placeholder="Search by title or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1, maxWidth: { sm: '300px' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box display="flex" gap={1}>
            <Chip
              label="All"
              color={statusFilter === 'all' ? 'primary' : 'default'}
              onClick={() => handleStatusFilterChange('all')}
              clickable
            />
            <Chip
              label="Completed"
              color={statusFilter === JobStatus.COMPLETED ? 'success' : 'default'}
              onClick={() => handleStatusFilterChange(JobStatus.COMPLETED)}
              clickable
            />
            <Chip
              label="Processing"
              color={statusFilter === JobStatus.PROCESSING ? 'info' : 'default'}
              onClick={() => handleStatusFilterChange(JobStatus.PROCESSING)}
              clickable
            />
            <Chip
              label="Failed"
              color={statusFilter === JobStatus.FAILED ? 'error' : 'default'}
              onClick={() => handleStatusFilterChange(JobStatus.FAILED)}
              clickable
            />
          </Box>
        </Box>
      </Paper>

      {/* Responsive layout - Table for desktop, Cards for mobile */}
      {!isMobile ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Platforms</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {searchTerm || statusFilter !== 'all'
                      ? 'No jobs match your search criteria'
                      : 'No jobs found. Start by creating a new content repurposing job.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedJobs.map((job) => (
                  <TableRow
                    key={job.id}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(0,0,0,0.02)',
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{job.title}</TableCell>
                    <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <JobStatusBadge status={job.status} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {job.job_metadata.content_types.map((type) => (
                          <Chip
                            key={type}
                            label={type.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        to={`/jobs/${job.id}`}
                        startIcon={<VisibilityIcon />}
                        sx={{
                          borderRadius: '8px',
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.05)'
                              : 'rgba(0,0,0,0.02)',
                          },
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredJobs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      ) : (
        // Mobile card view
        <>
          {paginatedJobs.length === 0 ? (
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(0,0,0,0.02)',
              }}
            >
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {searchTerm || statusFilter !== 'all'
                  ? 'No jobs match your search criteria'
                  : 'No jobs found.'}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                component={Link}
                to="/new"
                sx={{ mt: 2 }}
              >
                Create Your First Job
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {paginatedJobs.map((job) => (
                <Grid item xs={12} key={job.id}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 4px 20px rgba(0, 0, 0, 0.2)'
                        : '0 4px 20px rgba(0, 0, 0, 0.05)',
                      transition: theme.transitions.create(['transform', 'box-shadow'], {
                        duration: theme.transitions.duration.standard,
                      }),
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 8px 25px rgba(0, 0, 0, 0.3)'
                          : '0 8px 25px rgba(0, 0, 0, 0.1)',
                      },
                      position: 'relative',
                    }}
                  >
                    {/* Status indicator */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        bgcolor: job.status === JobStatus.COMPLETED
                          ? theme.palette.success.main
                          : job.status === JobStatus.FAILED
                            ? theme.palette.error.main
                            : theme.palette.info.main,
                      }}
                    />

                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6" component="div" fontWeight={600}>
                          {job.title}
                        </Typography>
                        <JobStatusBadge status={job.status} />
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Created: {new Date(job.created_at).toLocaleString()}
                      </Typography>

                      <Divider sx={{ my: 1.5 }} />

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Platforms:
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2}>
                        {job.job_metadata.content_types.map((type) => (
                          <Chip
                            key={type}
                            label={type.replace('_', ' ')}
                            size="small"
                            sx={{
                              borderRadius: '8px',
                              textTransform: 'capitalize',
                            }}
                          />
                        ))}
                      </Stack>

                      <Box display="flex" justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          component={Link}
                          to={`/jobs/${job.id}`}
                          startIcon={<VisibilityIcon />}
                          sx={{
                            borderRadius: '10px',
                            '&:hover': {
                              backgroundColor: theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'rgba(0, 0, 0, 0.03)',
                            },
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10]}
              component="div"
              count={filteredJobs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage=""
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default JobList;
