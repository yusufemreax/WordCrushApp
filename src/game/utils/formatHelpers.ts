export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);

  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDuration = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if(minutes === 0) {
        return `${minutes} sn`;
    }

    return `${minutes} dk ${seconds} sn`;
};

export const formatTotalDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if(hours === 0){
        return `${minutes} dk`;
    }

    return `${hours} sa ${minutes} dk`;
};