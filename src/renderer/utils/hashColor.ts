export const computeHue = (title: string, artist: string): number => {
  const hash = `${title}${artist}`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hash % 360;
};
