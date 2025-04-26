import { Chip } from '@mui/material';
import { JobStatus } from '../types';

interface JobStatusBadgeProps {
  status: JobStatus;
}

const JobStatusBadge = ({ status }: JobStatusBadgeProps) => {
  const getStatusColor = () => {
    switch (status) {
      case JobStatus.COMPLETED:
        return 'success';
      case JobStatus.PROCESSING:
        return 'info';
      case JobStatus.PENDING:
        return 'warning';
      case JobStatus.FAILED:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={getStatusColor()}
      size="small"
    />
  );
};

export default JobStatusBadge;
