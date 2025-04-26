import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Divider,
  Alert,
  Chip,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme
} from '@mui/material';
import { useJobs } from '../hooks/useJobs';
import { ContentType, ContentSubmissionForm } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ContentGenerationProgress from '../components/ContentGenerationProgress';

const NewContent = () => {
  const navigate = useNavigate();
  const { submitContent } = useJobs();
  const theme = useTheme();
  const [formData, setFormData] = useState<ContentSubmissionForm>({
    title: '',
    content: '',
    content_types: [],
    metadata: {
      tone: 'professional',
      hashtags: [],
      style: 'modern',
    },
  });
  const [hashtag, setHashtag] = useState('');
  const [error, setError] = useState('');

  const handleContentTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.name as ContentType;
    const checked = event.target.checked;

    setFormData(prev => ({
      ...prev,
      content_types: checked
        ? [...prev.content_types, value]
        : prev.content_types.filter(type => type !== value),
    }));
  };

  const handleToneChange = (event: SelectChangeEvent<string>) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata!,
        tone: event.target.value,
      },
    }));
  };

  const handleStyleChange = (event: SelectChangeEvent<string>) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata!,
        style: event.target.value,
      },
    }));
  };

  const handleAddHashtag = () => {
    if (hashtag.trim() && !formData.metadata?.hashtags?.includes(hashtag.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata!,
          hashtags: [...(prev.metadata?.hashtags || []), hashtag.trim()],
        },
      }));
      setHashtag('');
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata!,
        hashtags: prev.metadata?.hashtags?.filter(t => t !== tag) || [],
      },
    }));
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    if (formData.content_types.length === 0) {
      setError('Please select at least one platform');
      return;
    }

    try {
      setIsGenerating(true);

      // Simulate a delay to show the progress tracking
      await new Promise(resolve => setTimeout(resolve, 8000));

      const result = await submitContent.mutateAsync(formData);
      navigate(`/jobs/${result.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (submitContent.isPending && !isGenerating) {
    return (
      <AuthLayout>
        <LoadingSpinner message="Preparing submission..." />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 600,
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(90deg, #90caf9, #ce93d8)'
            : 'linear-gradient(90deg, #1976d2, #9c27b0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Create New Content
      </Typography>

      {isGenerating && (
        <ContentGenerationProgress
          isGenerating={isGenerating}
          platformCount={formData.content_types.length}
          onComplete={() => {}}
        />
      )}

      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
          backgroundColor: theme.palette.mode === 'light'
            ? 'rgba(255, 255, 255, 0.7)'
            : 'rgba(30, 41, 59, 0.6)',
          transition: theme.transitions.create(['box-shadow', 'transform'], {
            duration: theme.transitions.duration.standard,
          }),
          '&:hover': {
            boxShadow: theme.shadows[8],
          },
          position: 'relative',
          zIndex: 10,
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <TextField
            label="Content"
            fullWidth
            multiline
            rows={10}
            margin="normal"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            placeholder="Paste your blog content here..."
            helperText="Paste the full blog post or article that you want to repurpose"
          />

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Target Platforms
          </Typography>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend">Select platforms to generate content for</FormLabel>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.content_types.includes(ContentType.TWITTER)}
                    onChange={handleContentTypeChange}
                    name={ContentType.TWITTER}
                  />
                }
                label="Twitter"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.content_types.includes(ContentType.INSTAGRAM)}
                    onChange={handleContentTypeChange}
                    name={ContentType.INSTAGRAM}
                  />
                }
                label="Instagram"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.content_types.includes(ContentType.LINKEDIN)}
                    onChange={handleContentTypeChange}
                    name={ContentType.LINKEDIN}
                  />
                }
                label="LinkedIn"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.content_types.includes(ContentType.FACEBOOK)}
                    onChange={handleContentTypeChange}
                    name={ContentType.FACEBOOK}
                  />
                }
                label="Facebook"
              />
            </FormGroup>
          </FormControl>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Content Settings
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="tone-label">Tone</InputLabel>
                <Select
                  labelId="tone-label"
                  value={formData.metadata?.tone || 'professional'}
                  label="Tone"
                  onChange={handleToneChange}
                >
                  <MenuItem value="professional">Professional</MenuItem>
                  <MenuItem value="casual">Casual</MenuItem>
                  <MenuItem value="friendly">Friendly</MenuItem>
                  <MenuItem value="humorous">Humorous</MenuItem>
                  <MenuItem value="authoritative">Authoritative</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="style-label">Image Style</InputLabel>
                <Select
                  labelId="style-label"
                  value={formData.metadata?.style || 'modern'}
                  label="Image Style"
                  onChange={handleStyleChange}
                >
                  <MenuItem value="modern">Modern</MenuItem>
                  <MenuItem value="minimalist">Minimalist</MenuItem>
                  <MenuItem value="vibrant">Vibrant</MenuItem>
                  <MenuItem value="corporate">Corporate</MenuItem>
                  <MenuItem value="artistic">Artistic</MenuItem>
                  <MenuItem value="photorealistic">Photorealistic</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Hashtags
            </Typography>

            <Box display="flex" alignItems="center" mb={2}>
              <TextField
                label="Add Hashtag"
                size="small"
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                sx={{ mr: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleAddHashtag}
                disabled={!hashtag.trim()}
              >
                Add
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.metadata?.hashtags?.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveHashtag(tag)}
                />
              ))}
              {formData.metadata?.hashtags?.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No hashtags added. The AI will suggest relevant hashtags.
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outlined"
              sx={{
                mr: 2,
                borderRadius: '20px',
                px: 3,
                py: 1,
                transition: theme.transitions.create(['background-color', 'transform'], {
                  duration: theme.transitions.duration.shorter,
                }),
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitContent.isPending || isGenerating}
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 1,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #90caf9 30%, #ce93d8 90%)'
                  : 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
                transition: theme.transitions.create(['transform', 'box-shadow'], {
                  duration: theme.transitions.duration.shorter,
                }),
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                },
              }}
            >
              {isGenerating ? 'Generating...' : 'Submit'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
    </AuthLayout>
  );
};

export default NewContent;
