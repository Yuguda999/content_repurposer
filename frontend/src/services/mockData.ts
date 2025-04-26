import { Job, JobStatus, ContentType, JobOutput } from '../types';

// Generate a random date within the last 30 days
const randomDate = (daysAgo = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

// Generate a random job status
const randomStatus = (): JobStatus => {
  const statuses = [JobStatus.COMPLETED, JobStatus.PROCESSING, JobStatus.PENDING, JobStatus.FAILED];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Generate random content types
const randomContentTypes = (): ContentType[] => {
  const allTypes = [
    ContentType.TWITTER,
    ContentType.INSTAGRAM,
    ContentType.LINKEDIN,
    ContentType.FACEBOOK,
    ContentType.THUMBNAIL,
  ];

  // Shuffle and take a random number of types
  const shuffled = [...allTypes].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
};

// Generate a mock job output
const createMockOutput = (jobId: string, contentType: ContentType): JobOutput => {
  const isImage = contentType === ContentType.THUMBNAIL ||
                 contentType === ContentType.TWITTER_IMAGE ||
                 contentType === ContentType.INSTAGRAM_IMAGE;

  return {
    id: `output-${Math.random().toString(36).substring(2, 9)}`,
    content_type: contentType,
    content: isImage ? null : `Mock content for ${contentType}. This is a generated text for demonstration purposes.`,
    file_path: isImage ? `https://picsum.photos/seed/${jobId}/800/600` : null,
    created_at: randomDate(5),
    updated_at: randomDate(2),
  };
};

// Generate a mock job
const createMockJob = (id: string): Job => {
  const status = randomStatus();
  const contentTypes = randomContentTypes();
  const createdAt = randomDate(30);
  const updatedAt = randomDate(15);

  // Generate outputs based on content types
  const outputs: JobOutput[] = contentTypes.map(type => createMockOutput(id, type));

  // Add thumbnail
  outputs.push(createMockOutput(id, ContentType.THUMBNAIL));

  return {
    id,
    title: `Mock Job ${id}`,
    status,
    created_at: createdAt,
    updated_at: updatedAt,
    completed_at: status === JobStatus.COMPLETED ? randomDate(5) : null,
    error_message: status === JobStatus.FAILED ? 'Mock error message' : null,
    job_metadata: {
      content_types: contentTypes,
      tone: 'professional',
      hashtags: ['mock', 'test', 'demo'],
    },
    outputs,
  };
};

// Generate a list of mock jobs
export const generateMockJobs = (count = 10): Job[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockJob(`job-${i + 1}`)
  );
};

// Mock jobs data
export const mockJobs = generateMockJobs();

// Get a job by ID
export const getMockJob = (jobId: string): Job | undefined => {
  return mockJobs.find(job => job.id === jobId);
};

// Create a new job
export const createNewMockJob = (data: any): Job => {
  const newJob: Job = {
    id: `job-${mockJobs.length + 1}`,
    title: data.title,
    status: JobStatus.PENDING,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null,
    error_message: null,
    job_metadata: {
      content_types: data.content_types,
      ...data.metadata,
    },
    outputs: [],
  };

  mockJobs.unshift(newJob);
  return newJob;
};
