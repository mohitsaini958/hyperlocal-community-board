const validate = (field, value, form) => {
  if (field === "username") {
    if (!value) return "Username is required";
    if (value.length < 3) return "At least 3 characters";
    if (value.length > 30) return "Maximum 30 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Only letters, numbers and _";
  }
  if (field === "email") {
    if (!value) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email";
  }
  if (field === "password") {
    if (!value) return "Password is required";
    if (value.length < 6) return "At least 6 characters";
  }
  if (field === "confirmPassword") {
    if (!value) return "Please confirm your password";
    if (value !== form.password) return "Passwords do not match";
  }
  return "";
};

export default validate;