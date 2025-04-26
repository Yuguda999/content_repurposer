import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentAPI } from '../services/api';
import { ContentSubmissionForm, Job } from '../types';

export const useJobs = () => {
  const queryClient = useQueryClient();

  // Get all jobs
  const getJobs = useQuery({
    queryKey: ['jobs'],
    queryFn: contentAPI.getJobs,
    retry: 1, // Only retry once
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });

  // Get job by ID
  const getJob = (jobId: string) => {
    return useQuery({
      queryKey: ['job', jobId],
      queryFn: () => contentAPI.getJob(jobId),
      retry: 1, // Only retry once
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
      refetchInterval: (data) => {
        // Refetch every 5 seconds if job is not completed
        if (data?.status === 'pending' || data?.status === 'processing') {
          return 5000;
        }
        return false;
      },
    });
  };

  // Submit content for repurposing
  const submitContent = useMutation({
    mutationFn: (data: ContentSubmissionForm) => contentAPI.submitContent(data),
    onSuccess: () => {
      // Invalidate jobs query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  return {
    getJobs,
    getJob,
    submitContent,
  };
};
