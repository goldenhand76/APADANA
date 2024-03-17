export const convertToNumber = (position) => {
    Object.keys(position).map(function (key, index) {
        position[key] *= 1
    });
}