/**
 * Safely formats a date string to Turkish locale
 * @param dateString - The date string to format
 * @param format - 'long' for full date, 'short' for compact date
 * @returns Formatted date string or fallback message
 */
export const formatDate = (
    dateString: string | undefined | null,
    format: 'long' | 'short' = 'long'
): string => {
    if (!dateString) {
        return 'Tarih bilgisi yok';
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return 'Geçersiz tarih';
    }

    if (format === 'short') {
        return date.toLocaleDateString('tr-TR');
    }

    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Formats a price with currency
 * @param price - The price value
 * @param currency - Currency code (TRY, USD, EUR)
 * @returns Formatted price string
 */
export const formatPrice = (price: number, currency: string): string => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: currency
    }).format(price);
};
