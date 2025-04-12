

export const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
};

export const formatTimeSince = (timestamp: number | null | undefined) => {
  if (timestamp === null || timestamp === undefined) {
    return '0 seconds ago';
  }
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}; 
