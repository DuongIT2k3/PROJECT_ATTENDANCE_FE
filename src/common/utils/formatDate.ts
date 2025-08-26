
export const formatDateToLocaleVN = (date: string, showTime = true) => {
    const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    };

    if(showTime) {
        options.hour = "2-digit"
        options.minute = "2-digit"

    }

    return new Date(date).toLocaleDateString("vi-VN", options);
}