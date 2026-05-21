export function extractYouTubeVideoId(input: string): string | null {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return null;
  }

  const directIdRegex = /^[a-zA-Z0-9_-]{11}$/;

  if (directIdRegex.test(trimmedInput)) {
    return trimmedInput;
  }

  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*&v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmedInput.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}