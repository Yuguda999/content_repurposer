import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Tooltip,
  Alert,
  Chip,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useJobs } from '../hooks/useJobs';
import { ContentType, JobStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import JobStatusBadge from '../components/JobStatusBadge';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`job-tabpanel-${index}`}
      aria-labelledby={`job-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const JobDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { getJob } = useJobs();
  const { data: job, isLoading, error, refetch } = getJob(jobId || '');

  // Auto-refresh for pending or processing jobs
  useEffect(() => {
    let intervalId: number | null = null;

    if (job && (job.status === JobStatus.PENDING || job.status === JobStatus.PROCESSING)) {
      console.log(`Job ${job.id} is ${job.status}. Setting up auto-refresh.`);

      // Refresh every 5 seconds for pending/processing jobs
      intervalId = window.setInterval(() => {
        console.log(`Auto-refreshing job ${job.id}...`);
        refetch();
      }, 5000);
    }

    // Clean up interval on unmount or when job status changes
    return () => {
      if (intervalId) {
        console.log('Clearing auto-refresh interval');
        window.clearInterval(intervalId);
      }
    };
  }, [job?.status, job?.id, refetch]);

  const [tabValue, setTabValue] = useState(0);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});

  // State for content editing
  const [editingContent, setEditingContent] = useState<Record<string, boolean>>({});
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCopyContent = (content: string, platform: string) => {
    navigator.clipboard.writeText(content);
    setCopySuccess(`${platform} content copied to clipboard!`);
    setTimeout(() => setCopySuccess(null), 3000);
  };

  // Handle editing content
  const handleStartEditing = (outputId: string, content: string) => {
    setEditingContent(prev => ({ ...prev, [outputId]: true }));
    setEditedContent(prev => ({ ...prev, [outputId]: content }));
  };

  const handleCancelEditing = (outputId: string) => {
    setEditingContent(prev => ({ ...prev, [outputId]: false }));
  };

  const handleSaveEditing = (outputId: string) => {
    setEditingContent(prev => ({ ...prev, [outputId]: false }));
    // In a real application, you would save the changes to the backend here
    // For now, we'll just update the UI
    if (job && job.outputs) {
      const updatedOutputs = job.outputs.map((output: any) => {
        if (output.id === outputId) {
          return { ...output, content: editedContent[outputId] };
        }
        return output;
      });

      // Update the job object with the edited content
      job.outputs = updatedOutputs;
    }
  };

  const handleContentChange = (outputId: string, newContent: string) => {
    setEditedContent(prev => ({ ...prev, [outputId]: newContent }));
  };

  // Helper function to construct base URLs for different storage paths
  const getBaseStorageUrls = (filePath: string) => {
    if (!filePath) {
      console.error('Empty file path provided to getBaseStorageUrls');
      return [];
    }

    // If the file path is already a full URL, return it as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      console.log('Using absolute URL:', filePath);
      return [filePath];
    }

    // Get the base API URL
    const baseUrl = api.defaults.baseURL || 'http://localhost:8001/api';

    // Extract the base server URL without the API path
    let serverBaseUrl = baseUrl;
    if (baseUrl.includes('/api')) {
      serverBaseUrl = baseUrl.substring(0, baseUrl.indexOf('/api'));
    }

    // If the file path already contains 'storage/', remove it to avoid duplication
    let normalizedPath = filePath;
    if (normalizedPath.includes('storage/')) {
      normalizedPath = normalizedPath.substring(normalizedPath.indexOf('storage/') + 8);
    }

    // If the file path starts with a slash, remove it to avoid double slashes
    if (normalizedPath.startsWith('/')) {
      normalizedPath = normalizedPath.slice(1);
    }

    console.log('Normalized path:', normalizedPath);

    // Return an array of possible storage URLs
    return [
      // Direct access to the storage endpoint
      `${serverBaseUrl}/storage/${normalizedPath}`,

      // Try with platform-specific subfolders
      `${serverBaseUrl}/storage/twitter_images/${normalizedPath}`,
      `${serverBaseUrl}/storage/instagram_images/${normalizedPath}`,
      `${serverBaseUrl}/storage/linkedin_images/${normalizedPath}`,
      `${serverBaseUrl}/storage/facebook_images/${normalizedPath}`,
      `${serverBaseUrl}/storage/thumbnails/${normalizedPath}`,

      // Try with just the filename (in case the path is just a filename)
      `${serverBaseUrl}/storage/twitter_images/${normalizedPath.split('/').pop()}`,
      `${serverBaseUrl}/storage/instagram_images/${normalizedPath.split('/').pop()}`,
      `${serverBaseUrl}/storage/linkedin_images/${normalizedPath.split('/').pop()}`,
      `${serverBaseUrl}/storage/facebook_images/${normalizedPath.split('/').pop()}`,
      `${serverBaseUrl}/storage/thumbnails/${normalizedPath.split('/').pop()}`
    ];
  };

  // Preload and cache image URLs when job data changes
  useEffect(() => {
    if (job && job.outputs) {
      // Reset error and loading states
      const newImageLoading: Record<string, boolean> = {};

      // Process all image outputs
      job.outputs.forEach((output: any) => {
        if (output.file_path) {
          console.log(`Attempting to load image for output ${output.id} with path:`, output.file_path);

          // Set loading state
          newImageLoading[output.id] = true;

          // Try to find the correct URL format for this image
          tryAlternativeImageUrl(output.id, output.file_path);
        }
      });

      // Update loading state
      setImageLoading(newImageLoading);
    }
  }, [job]);

  // Track which URL format was successful for each output
  const [successfulUrlFormat, setSuccessfulUrlFormat] = useState<Record<string, string>>({});

  // Try different URL formats for accessing images
  const tryAlternativeImageUrl = (outputId: string, filePath: string, currentAttempt = 0) => {
    if (!filePath) {
      console.error(`No file path provided for output ${outputId}`);
      setImageError(prev => ({ ...prev, [outputId]: true }));
      setImageLoading(prev => ({ ...prev, [outputId]: false }));
      return;
    }

    // Get all possible URL formats
    const urlFormats = getBaseStorageUrls(filePath);

    if (currentAttempt >= urlFormats.length) {
      console.error(`All image URL formats failed for output ${outputId}`);
      setImageError(prev => ({ ...prev, [outputId]: true }));
      setImageLoading(prev => ({ ...prev, [outputId]: false }));
      return;
    }

    // Reset error state and set loading
    setImageError(prev => ({ ...prev, [outputId]: false }));
    setImageLoading(prev => ({ ...prev, [outputId]: true }));

    const url = urlFormats[currentAttempt];
    console.log(`Trying URL format ${currentAttempt + 1}/${urlFormats.length} for output ${outputId}:`, url);

    const img = new Image();
    img.onload = () => {
      console.log(`URL format ${currentAttempt + 1} successful for output ${outputId}:`, url);
      setSuccessfulUrlFormat(prev => ({ ...prev, [outputId]: url }));
      setImageUrls(prev => ({ ...prev, [outputId]: url }));
      setImageLoading(prev => ({ ...prev, [outputId]: false }));
    };
    img.onerror = () => {
      console.error(`URL format ${currentAttempt + 1} failed for output ${outputId}:`, url);
      // Try the next format
      tryAlternativeImageUrl(outputId, filePath, currentAttempt + 1);
    };

    // Add cache-busting parameter
    img.src = `${url}?t=${new Date().getTime()}`;
  };

  const handleImageError = (outputId: string) => {
    console.error(`Image error for output ${outputId}`);

    // If we have a successful format for this output, use it
    if (successfulUrlFormat[outputId]) {
      console.log(`Using previously successful URL format for output ${outputId}:`, successfulUrlFormat[outputId]);
      setImageUrls(prev => ({ ...prev, [outputId]: successfulUrlFormat[outputId] }));
      return;
    }

    // Otherwise, try alternative URL formats
    const output = job?.outputs.find((o: any) => o.id === outputId);
    if (output && output.file_path) {
      tryAlternativeImageUrl(outputId, output.file_path);
    } else {
      setImageError(prev => ({ ...prev, [outputId]: true }));
    }
  };

  const handleDownloadImage = (url: string, platform: string) => {
    if (!url) {
      console.error('No URL provided for download');
      return;
    }

    // Add cache-busting parameter
    const downloadUrl = `${url}?t=${new Date().getTime()}`;
    console.log('Downloading image from URL:', downloadUrl);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${platform.toLowerCase()}_image.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTabLabel = (contentType: ContentType) => {
    switch (contentType) {
      case ContentType.TWITTER:
        return 'Twitter';
      case ContentType.INSTAGRAM:
        return 'Instagram';
      case ContentType.LINKEDIN:
        return 'LinkedIn';
      case ContentType.FACEBOOK:
        return 'Facebook';
      case ContentType.THUMBNAIL:
        return 'Thumbnail';
      case ContentType.TWITTER_IMAGE:
        return 'Twitter Image';
      case ContentType.INSTAGRAM_IMAGE:
        return 'Instagram Image';
      default:
        return contentType;
    }
  };

  // Group outputs by content type
  const groupedOutputs = job?.outputs.reduce((acc: Record<string, any[]>, output: any) => {
    const contentType = output.content_type;
    if (!acc[contentType]) {
      acc[contentType] = [];
    }
    acc[contentType].push(output);
    return acc;
  }, {} as Record<string, any[]>);

  // Get content types for tabs
  const contentTypes = groupedOutputs ? Object.keys(groupedOutputs) as ContentType[] : [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !job) {
    console.error('JobDetail error:', error);
    return (
      <Box>
        <ErrorMessage message="Failed to load job details. Please ensure the backend server is running." />
        <Box mt={2} mb={4}>
          <Typography variant="body2" color="text.secondary">
            The application requires a running backend server to function properly. Please start the backend server and refresh the page.
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            <Button
              variant="outlined"
              component={Link}
              to="/jobs"
              startIcon={<ArrowBackIcon />}
            >
              Back to Jobs
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <Button
          component={Link}
          to="/jobs"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Jobs
        </Button>
        <Typography variant="h4" component="h1">
          Job Details
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Refresh">
          <IconButton onClick={() => refetch()}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {copySuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {copySuccess}
        </Alert>
      )}

      <Paper sx={{ mb: 4, p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <Box sx={{ flex: { md: 2 } }}>
            <Typography variant="h5" gutterBottom>
              {job.title}
            </Typography>
            <Box display="flex" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                Status:
              </Typography>
              <JobStatusBadge status={job.status} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Created: {new Date(job.created_at).toLocaleString()}
            </Typography>
            {job.completed_at && (
              <Typography variant="body2" color="text.secondary">
                Completed: {new Date(job.completed_at).toLocaleString()}
              </Typography>
            )}
          </Box>
          <Box sx={{ flex: { md: 1 } }}>
            <Typography variant="subtitle2" gutterBottom>
              Platforms:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {job.job_metadata.content_types.map((type: string) => (
                <Chip key={type} label={type} size="small" />
              ))}
            </Box>
            {job.job_metadata.tone && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Tone: {job.job_metadata.tone}
              </Typography>
            )}
            {job.job_metadata.style && (
              <Typography variant="body2" color="text.secondary">
                Style: {job.job_metadata.style}
              </Typography>
            )}
          </Box>
        </Box>

        {job.status === JobStatus.FAILED && job.error_message && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Error:</Typography>
            {job.error_message}
          </Alert>
        )}
      </Paper>

      {job.status === JobStatus.PENDING || job.status === JobStatus.PROCESSING ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LoadingSpinner message={`Job is ${job.status}. Content will appear here when ready.`} />
        </Paper>
      ) : job.outputs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No outputs available for this job.
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ mb: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {contentTypes.map((contentType, index) => (
                <Tab key={contentType} label={getTabLabel(contentType)} id={`job-tab-${index}`} />
              ))}
            </Tabs>
          </Box>

          {contentTypes.map((contentType, index) => (
            <TabPanel key={contentType} value={tabValue} index={index}>
              {groupedOutputs[contentType].map((output: any) => (
                <Box key={output.id} mb={3}>
                  {output.content ? (
                    <Card>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6">
                            {getTabLabel(output.content_type)} Content
                          </Typography>
                          <Box>
                            {editingContent[output.id] ? (
                              <>
                                <Tooltip title="Save changes">
                                  <IconButton
                                    onClick={() => handleSaveEditing(output.id)}
                                    color="primary"
                                    sx={{ mr: 1 }}
                                  >
                                    <SaveIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel editing">
                                  <IconButton
                                    onClick={() => handleCancelEditing(output.id)}
                                    color="error"
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            ) : (
                              <>
                                <Tooltip title="Edit content">
                                  <IconButton
                                    onClick={() => handleStartEditing(output.id, output.content!)}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Copy to clipboard">
                                  <IconButton onClick={() => handleCopyContent(output.content!, getTabLabel(output.content_type))}>
                                    <ContentCopyIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {editingContent[output.id] ? (
                          <TextField
                            fullWidth
                            multiline
                            minRows={5}
                            maxRows={15}
                            value={editedContent[output.id]}
                            onChange={(e) => handleContentChange(output.id, e.target.value)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                fontFamily: 'inherit',
                                fontSize: '1rem',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                              }
                            }}
                          />
                        ) : (
                          <Typography
                            variant="body1"
                            component="pre"
                            sx={{
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              p: 2,
                              bgcolor: 'background.default',
                              borderRadius: 1,
                              fontFamily: 'inherit'
                            }}
                          >
                            {output.content}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ) : output.file_path ? (
                    <Card>
                      {imageError[output.id] ? (
                        <Box
                          sx={{
                            height: 300,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3,
                            bgcolor: 'background.default'
                          }}
                        >
                          <Typography variant="h6" color="error" gutterBottom>
                            Image could not be loaded
                          </Typography>
                          <Typography variant="body2" color="text.secondary" align="center">
                            The image may not be available or the backend server might not be running.
                          </Typography>
                          <Button
                            variant="outlined"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={() => {
                              console.log(`Manual retry for output ${output.id}`);

                              // Try alternative URL formats
                              tryAlternativeImageUrl(output.id, output.file_path!);
                            }}
                          >
                            Retry
                          </Button>
                        </Box>
                      ) : imageLoading[output.id] ? (
                        <Box
                          sx={{
                            height: 300,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3,
                            bgcolor: 'background.default'
                          }}
                        >
                          <CircularProgress size={40} />
                          <Typography variant="body1" sx={{ mt: 2 }}>
                            Loading image...
                          </Typography>
                        </Box>
                      ) : (
                        <CardMedia
                          component="img"
                          image={`${successfulUrlFormat[output.id] || imageUrls[output.id] || ''}?t=${new Date().getTime()}`}
                          alt={`${getTabLabel(output.content_type)} Image`}
                          sx={{
                            maxHeight: '500px',
                            objectFit: 'contain',
                            bgcolor: 'background.default'
                          }}
                          onError={() => handleImageError(output.id)}
                        />
                      )}
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">
                            {getTabLabel(output.content_type)}
                          </Typography>
                          <Box>
                            <Tooltip title="View full image">
                              <IconButton
                                onClick={() => {
                                  // Use the successful URL format with a cache-busting parameter
                                  const url = successfulUrlFormat[output.id] || imageUrls[output.id] || '';
                                  if (url) {
                                    window.open(`${url}?t=${new Date().getTime()}`, '_blank');
                                  } else {
                                    console.error(`No valid URL found for output ${output.id}`);
                                    // Try to discover the URL
                                    tryAlternativeImageUrl(output.id, output.file_path!);
                                  }
                                }}
                                disabled={imageError[output.id]}
                                sx={{ mr: 1 }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download image">
                              <IconButton
                                onClick={() => {
                                  // Use the successful URL format for downloading
                                  const url = successfulUrlFormat[output.id] || imageUrls[output.id] || '';
                                  if (url) {
                                    handleDownloadImage(url, getTabLabel(output.content_type));
                                  } else {
                                    console.error(`No valid URL found for output ${output.id}`);
                                    // Try to discover the URL
                                    tryAlternativeImageUrl(output.id, output.file_path!);
                                  }
                                }}
                                disabled={imageError[output.id]}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No content available for this output.
                    </Typography>
                  )}
                </Box>
              ))}
            </TabPanel>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default JobDetail;
