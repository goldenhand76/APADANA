export const notificationTextGenerator = (item) => {
    let text = item?.actor?.title + ' ';
    text +=  verbGenerator(item.verb);
    return text
}

export const verbGenerator = (verb) => {
    switch (verb) {
        case 'has connected':
            return 'متصل شد';
        case 'has disconnected':
            return 'قطع شد';
        case 'Turned On':
            return 'روشن شد';
        case 'Turned Off':
            return 'خاموش شد';
        case 'Created':
            return 'ساخته شد';
        case 'Deleted':
            return 'حذف شد';
        case 'Added user':
            return 'اضافه شد';
        case 'Removed user':
            return 'حذف شد';
        case 'started following':
            return 'دنبال می شود'
        default:
            return 'قطع شد';
    }
}