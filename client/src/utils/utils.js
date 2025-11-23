import { v4 as uuidv4 } from "uuid";

// function to truncate a string to a specified length
export const truncateString = (str, num) => {
  if (str.length <= num) {
    return str;
  }
    return str.slice(0, num) + '...';
};

// function to format a date to a readable string
export const formatDate = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

export const uid = (prefix = "") =>
  prefix + uuidv4().replace(/-/g, "");