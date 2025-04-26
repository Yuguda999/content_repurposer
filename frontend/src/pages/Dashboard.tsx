import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Paper,
  useTheme,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Facebook as FacebookIcon,
  Image as ImageIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useJobs } from '../hooks/useJobs';
import { JobStatus, ContentType } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import JobStatusBadge from '../components/JobStatusBadge';
import { motion } from 'framer-motion';

// Platform icon mapping
const platformIcons = {
  [ContentType.TWITTER]: <TwitterIcon sx={{ color: '#1DA1F2' }} />,
  [ContentType.INSTAGRAM]: <InstagramIcon sx={{ color: '#E1306C' }} />,
  [ContentType.LINKEDIN]: <LinkedInIcon sx={{ color: '#0077B5' }} />,
  [ContentType.FACEBOOK]: <FacebookIcon sx={{ color: '#4267B2' }} />,
  [ContentType.THUMBNAIL]: <ImageIcon color="primary" />,
  [ContentType.TWITTER_IMAGE]: <ImageIcon sx={{ color: '#1DA1F2' }} />,
  [ContentType.INSTAGRAM_IMAGE]: <ImageIcon sx={{ color: '#E1306C' }} />,
};

const Dashboard = () => {
  const { getJobs } = useJobs();
  const { data: jobs, isLoading, error, refetch } = getJobs;
  const theme = useTheme();

  // Count jobs by status
  const jobCounts = {
    total: jobs?.length || 0,
    completed: jobs?.filter(job => job.status === JobStatus.COMPLETED).length || 0,
    processing: jobs?.filter(job => job.status === JobStatus.PROCESSING || job.status === JobStatus.PENDING).length || 0,
    failed: jobs?.filter(job => job.status === JobStatus.FAILED).length || 0,
  };

  // Get recent jobs (up to 5)
  const recentJobs = jobs?.slice(0, 5) || [];

  // Animation variants for cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    console.error('Dashboard error:', error);
    return (
      <Box>
        <ErrorMessage message="Failed to load dashboard data. Please ensure the backend server is running." />
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
        <Box>
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
            Welcome Back
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Here's an overview of your content repurposing activities
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <Tooltip title="Refresh dashboard">
            <IconButton
              onClick={() => refetch()}
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

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
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} mb={4} sx={{ justifyContent: 'center' }}>
        {/* Create a reusable stat card component */}
        {[
          {
            title: 'Total Jobs',
            value: jobCounts.total,
            icon: <Typography variant="h5" fontWeight={700}>{jobCounts.total}</Typography>,
            color: theme.palette.primary.main,
            bgColor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)',
            description: 'All content repurposing jobs',
            delay: 0
          },
          {
            title: 'Completed Jobs',
            value: jobCounts.completed,
            icon: <CheckCircleIcon sx={{ fontSize: 28 }} />,
            color: theme.palette.success.main,
            bgColor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
            description: 'Successfully completed jobs',
            delay: 0.1
          },
          {
            title: 'In Progress',
            value: jobCounts.processing,
            icon: <PendingIcon sx={{ fontSize: 28 }} />,
            color: theme.palette.info.main,
            bgColor: theme.palette.mode === 'dark' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(14, 165, 233, 0.1)',
            description: 'Currently processing jobs',
            delay: 0.2
          },
          {
            title: 'Failed Jobs',
            value: jobCounts.failed,
            icon: <ErrorIcon sx={{ fontSize: 28 }} />,
            color: theme.palette.error.main,
            bgColor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
            description: 'Jobs with errors',
            delay: 0.3
          }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} lg={3} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: stat.delay }}
              style={{ height: '100%' }}
            >
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: 200, // Fixed height for all boxes
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(0, 0, 0, 0.3)'
                    : '0 4px 20px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* Colored top border */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    bgcolor: stat.color,
                  }}
                />

                {/* Icon or number */}
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: stat.bgColor,
                    color: stat.color,
                    mb: 2,
                  }}
                >
                  {typeof stat.icon === 'string' ? stat.value : stat.icon}
                </Avatar>

                {/* Only show the value as a separate element if it's not already in the avatar */}
                {typeof stat.icon !== 'string' && stat.icon.type !== Typography && (
                  <Typography variant="h6" fontWeight={600}>
                    {stat.value}
                  </Typography>
                )}

                <Typography variant="subtitle1" fontWeight={600} textAlign="center">
                  {stat.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {stat.description}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Box mb={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            fontWeight={600}
          >
            Recent Jobs
          </Typography>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            component={Link}
            to="/jobs"
            sx={{
              borderRadius: '10px',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.03)',
              },
            }}
          >
            View All
          </Button>
        </Box>

        {recentJobs.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(0, 0, 0, 0.02)',
            }}
          >
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No jobs found.
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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {recentJobs.map((job) => (
                <Grid item xs={12} key={job.id}>
                  <motion.div variants={itemVariants}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 4px 20px rgba(0, 0, 0, 0.2)'
                          : '0 4px 20px rgba(0, 0, 0, 0.05)',
                        transition: theme.transitions.create(['transform', 'box-shadow'], {
                          duration: theme.transitions.duration.standard,
                        }),
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.palette.mode === 'dark'
                            ? '0 10px 30px rgba(0, 0, 0, 0.3)'
                            : '0 10px 30px rgba(0, 0, 0, 0.1)',
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

                      {/* Show progress bar for processing jobs */}
                      {(job.status === JobStatus.PROCESSING || job.status === JobStatus.PENDING) && (
                        <LinearProgress
                          sx={{
                            height: 4,
                            borderRadius: 0,
                          }}
                        />
                      )}

                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={8}>
                            <Box display="flex" alignItems="center" mb={1}>
                              <Typography
                                variant="h6"
                                component="div"
                                fontWeight={600}
                                sx={{ mr: 2 }}
                              >
                                {job.title}
                              </Typography>
                              <JobStatusBadge status={job.status} />
                            </Box>

                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Created: {new Date(job.created_at).toLocaleString()}
                            </Typography>

                            {job.completed_at && (
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Completed: {new Date(job.completed_at).toLocaleString()}
                              </Typography>
                            )}

                            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" gap={1}>
                              {job.job_metadata.content_types.map((type) => (
                                <Chip
                                  key={type}
                                  icon={platformIcons[type] || <ImageIcon />}
                                  label={type.replace('_', ' ')}
                                  size="small"
                                  sx={{
                                    borderRadius: '8px',
                                    textTransform: 'capitalize',
                                  }}
                                />
                              ))}
                            </Stack>
                          </Grid>

                          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: { sm: 'flex-end' }, alignItems: 'center' }}>
                            <Button
                              variant="outlined"
                              endIcon={<ArrowForwardIcon />}
                              component={Link}
                              to={`/jobs/${job.id}`}
                              sx={{
                                borderRadius: '10px',
                                mt: { xs: 2, sm: 0 },
                                '&:hover': {
                                  backgroundColor: theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'rgba(0, 0, 0, 0.03)',
                                },
                              }}
                            >
                              View Details
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
