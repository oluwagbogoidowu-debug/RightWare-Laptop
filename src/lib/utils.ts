export function formatNaira(amount: number): string {
  if (!amount && amount !== 0) return '₦0';
  // If price was stored as smaller numbers (e.g. 950 for 950k NGN), normalize it
  const normalized = amount < 10000 ? amount * 1000 : amount;
  return `₦${normalized.toLocaleString()}`;
}

export function convertGoogleDriveUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  // Regex to extract file ID from common Google Drive share URLs
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }
  
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  return trimmed;
}
