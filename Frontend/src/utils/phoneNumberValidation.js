export const phoneNumberValidation = phoneNumber => {
    const pattern = new RegExp('^09\\d{9}$');
    return pattern.test(phoneNumber);
}
