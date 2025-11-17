// src/utils/simpleToken.js

/**
 * Encode an object into a Base64 string
 * @param {object} data
 * @returns {string}
 */
export const encodeData = (data) => {
    const json = JSON.stringify(data);
    return btoa(json); // Base64 encode
};

/**
 * Decode a Base64 string back to object
 * @param {string} token
 * @returns {object|null}
 */
export const decodeData = (token) => {
    try {
        const json = atob(token); // Base64 decode
        return JSON.parse(json);
    } catch (err) {
        console.error("Invalid token", err);
        return null;
    }
};
