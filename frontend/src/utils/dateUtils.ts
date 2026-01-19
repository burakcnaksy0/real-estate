export const formatLastSeen = (dateString?: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Az önce aktif';
    }

    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) {
        return `${minutes} dakika önce aktif`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} saat önce aktif`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
        return `${days} gün önce aktif`;
    }

    if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `${weeks} hafta önce aktif`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return `${months} ay önce aktif`;
    }

    const years = Math.floor(days / 365);
    return `${years} yıl önce aktif`;
};
